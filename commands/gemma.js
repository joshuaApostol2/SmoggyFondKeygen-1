const axios = require("axios");

module.exports = {
    name: "gemma",
    description: "Interact with Gemma AI model",
    nashPrefix: false,
    version: "1.0.0",
    cooldowns: 5,
    aliases: ["gem", "gemma-ai"],
    execute(api, event, args, prefix) {
        const { threadID, messageID } = event;
        const prompt = args.join(" ");

        if (!prompt) return api.sendMessage("Please enter a prompt.", threadID, messageID);

        api.sendMessage(
            "[ Gemma AI ]\n\n please wait...",
            threadID,
            (err, info) => {
                if (err) return;

                axios.get(`${global.NashBot.JOSHUA}/gemma?prompt=${encodeURIComponent(prompt)}`)
                    .then(response => {
                        const reply = response.data.response; 
                        api.editMessage(
                            "[ Gemma AI ]\n\n" + reply,
                            info.messageID
                        );
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
