module.exports = {
    name: "un",
    description: "Command to unsend the bot's message that is replied to by the user",
    version: "1.0.0",
    nashPrefix: false,
    cooldowns: 5,
    async execute(api, event) {
        const { threadID, messageID, messageReply } = event;

        if (!messageReply) {
            return api.sendMessage(
                "[ 𝚄𝙽𝚂𝙴𝙽𝙳 ]\n\n" +
                "❌ You must reply to the message you want to unsend.",
                threadID,
                messageID
            );
        }

        api.unsendMessage(messageReply.messageID, (err) => {
            if (err) {
                api.sendMessage(
                    "❌ Failed to unsend the message. Please try again later.",
                    threadID,
                    messageID
                );
            }
        });
    },
};
