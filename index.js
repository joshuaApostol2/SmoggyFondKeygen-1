const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const login = require("chatbox-fca-remake");
const fs = require("fs");
const detectTyping = require("./handle/detectTyping");
const autoReact = require("./handle/autoReact");
const unsendReact = require("./handle/unsendReact");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

global.NashBoT = {
  commands: new Map(),
  events: new Map(),
  onlineUsers: new Map(),
  prefixes: new Map(),
};

global.NashBot = {
  ENDPOINT: "https://nash-rest-api-production.up.railway.app/",
  END: "https://deku-rest-api.gleeze.com/",
  KEN: "https://api.kenliejugarap.com/",
  MONEY: "https://frizzyelectricclients-production.up.railway.app/"
};

async function loadCommands() {
  const commandPath = path.join(__dirname, "commands");
  const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith(".js"));
  commandFiles.forEach(file => {
    const cmdFile = require(path.join(commandPath, file));
    if (cmdFile && cmdFile.name && cmdFile.execute) {
      cmdFile.nashPrefix = cmdFile.nashPrefix !== undefined ? cmdFile.nashPrefix : true;
      global.NashBoT.commands.set(cmdFile.name, cmdFile);
    }
  });
}

async function loadEvents() {
  const eventPath = path.join(__dirname, "events");
  const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith(".js"));
  eventFiles.forEach(file => {
    const evntFile = require(path.join(eventPath, file));
    if (evntFile && evntFile.name && typeof evntFile.onEvent === 'function') {
      global.NashBoT.events.set(evntFile.name, evntFile);
    }
  });
}

async function init() {
  await loadCommands();
  await loadEvents();
  await autoLogin();
}

async function getRandomProxy() {
  const proxies = fs.readFileSync(path.join(__dirname, "proxy.txt"), "utf-8").split("\n");
  return proxies[Math.floor(Math.random() * proxies.length)].trim();
}

async function autoLogin() {
  const appStatePath = path.join(__dirname, "appstate.json");
  if (fs.existsSync(appStatePath)) {
    const appStates = JSON.parse(fs.readFileSync(appStatePath, "utf8"));
    appStates.forEach(({ appState, prefix }) => {
      const proxy = getRandomProxy();
      login({ appState, proxy }, async (err, api) => {
        if (err) {
          console.error("Failed to login automatically:", err);
          return;
        }
        const cuid = api.getCurrentUserID();
        const userDetails = await api.getUserInfo(cuid);
        const BotName = userDetails[cuid].name;
        const botProfile = userDetails[cuid];
        global.NashBoT.onlineUsers.set(cuid, { userID: cuid, prefix, BotName, botProfile });
        global.NashBoT.prefixes.set(cuid, prefix);
        setupBot(api, prefix);
      });
    });
  }
}

app.post("/login", (req, res) => {
  const { botState, prefix } = req.body;
  try {
    const appState = JSON.parse(botState);
    const appStatePath = path.join(__dirname, "appstate.json");
    const appStates = fs.existsSync(appStatePath) ? JSON.parse(fs.readFileSync(appStatePath, "utf8")) : [];

    appStates.push({ appState, prefix });
    fs.writeFileSync(appStatePath, JSON.stringify(appStates));
    
    const proxy = getRandomProxy();
    login({ appState, proxy }, async (err, api) => {
      if (err) {
        return res.status(500).send("Failed to login");
      }
      const cuid = api.getCurrentUserID();
      const userDetails = await api.getUserInfo(cuid);
      const BotName = userDetails[cuid].name;
      const botProfile = userDetails[cuid];
      global.NashBoT.onlineUsers.set(cuid, { userID: cuid, prefix, BotName, botProfile });
      global.NashBoT.prefixes.set(cuid, prefix);
      setupBot(api, prefix);
      res.sendStatus(200);
    });
  } catch (error) {
    res.status(400).send("Invalid appState");
  }
});

function setupBot(api, prefix) {
  api.setOptions({
    forceLogin: false,
    listenEvents: true,
    logLevel: "silent",
    selfListen: false,
    online: true,
    autoMarkDelivery: false,
    autoMarkRead: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  });

  setInterval(() => {
    api.getFriendsList(() => {
      console.log("Keep-alive signal sent");
    });
  }, 1000 * 60 * 15);

  api.listenMqtt((err, event) => {
    if (err) {
      return;
    }
    handleMessage(api, event, prefix);
    handleEvent(api, event, prefix);
    detectTyping(api, event);
    autoReact(api, event);
    unsendReact(api, event);
  });
}

async function handleEvent(api, event, prefix) {
  const { events } = global.NashBoT;
  try {
    for (const { name, onEvent } of events.values()) {
      await onEvent({ prefix, api, event });
    }
  } catch (error) {
    console.error("Error handling event:", error);
  }
}

async function handleMessage(api, event, prefix) {
  if (!event.body) return;
  let [command, ...args] = event.body.trim().split(" ");
  if (command.startsWith(prefix)) {
    command = command.slice(prefix.length);
  }
  const cmdFile = global.NashBoT.commands.get(command.toLowerCase());
  if (cmdFile) {
    const nashPrefix = cmdFile.nashPrefix !== false;
    if (nashPrefix && !event.body.toLowerCase().startsWith(prefix)) {
      return;
    }
    try {
      cmdFile.execute(api, event, args, prefix);
    } catch (error) {
      api.sendMessage(`Error executing command: ${error.message}`, event.threadID);
    }
  }
}

app.get("/active-sessions", async (req, res) => {
  const json = {};
  global.NashBoT.onlineUsers.forEach(({ userID, prefix, BotName, botProfile }, uid) => {
    json[uid] = { userID, prefix, BotName, botProfile }; 
  });
  res.json(json);
});

app.get("/commands", (req, res) => {
  const commands = {};
  global.NashBoT.commands.forEach((command, name) => {
    commands[name] = {
      description: command.description || "No description available",
      nashPrefix: command.nashPrefix,
    };
  });
  res.json(commands);
});

init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});