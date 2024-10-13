const axios = require("axios");

module.exports = {
    name: "sim",
    description: "Talk to Simisimi",
    nashPrefix: false,
    version: "1.0.0",
    role: 0,
    cooldowns: 5,
    aliases: ["simi"],
    execute(api, event, args, prefix) {
        const { threadID, messageID, senderID } = event;
        let prompt = args.join(" ");
        if (!prompt) return api.sendMessage("Please enter a prompt.", threadID, messageID);
        
        if (!global.handle) {
            global.handle = {};
        }
        if (!global.handle.replies) {
            global.handle.replies = {};
        }

        api.sendMessage(
            "wait lang po...",
            threadID,
            (err, info) => {
                if (err) return;
                
                axios.get(`${global.NashBot.JOSHUA}simisimi?prompt=${encodeURIComponent(prompt)}`)
                    .then(response => {
                        const reply = response.data.reply;
                        api.editMessage(
                            reply,
                            info.messageID
                        );
                        global.handle.replies[info.messageID] = {
                            cmdname: module.exports.name,
                            this_mid: info.messageID,
                            this_tid: info.threadID,
                            tid: threadID,
                            mid: messageID,
                        };
                    })
                    .catch(error => {
                        console.error("Error fetching data:", error.message);
                        api.editMessage("Failed to fetch data. Please try again later.", info.messageID);
                    });
            },
            messageID
        );
    },
};
