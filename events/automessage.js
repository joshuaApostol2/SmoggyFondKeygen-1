const axios = require('axios');
const cron = require('node-cron');

let lastSentHour = -1;

module.exports = {
    name: "automessage",
    description: "Automatically sends a motivational quote every hour.",
    nashPrefix: false,
    version: "1.0.0",
    async onEvent({ api }) {
        const motivation = async () => {
            const currentHour = new Date().getHours();
            if (currentHour === lastSentHour) return;

            try {
                const response = await axios.get("https://nash-rest-api-production.up.railway.app/quote");
                let quote = response.data.text;
                const author = response.data.author;

                quote = quote.replace(/^“|”$/g, '').trim();

                const formattedQuote = `┌─[ AUTOMESSAGE ]──[ # ]\n` +
                                       `└───► ${quote}\n\n` +
                                       `┌─[ AUTHOR ]───[ # ]\n` +
                                       `└───► ${author}`;

                const threads = await api.getThreadList(25, null, ['INBOX']);
                for (const thread of threads) {
                    if (thread.isGroup && thread.name !== thread.threadID) {
                        await api.sendMessage(formattedQuote, thread.threadID);
                    }
                }

                lastSentHour = currentHour;
            } catch (error) {
                console.error('Error fetching quote:', error);
            }
        };
        
        cron.schedule('0 * * * *', () => {
            motivation();
        });
    },
};
