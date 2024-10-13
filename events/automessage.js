const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');

let isSending = false;

module.exports = {
    name: "nglspammer",
    description: "edi tanginamo",
    nashPrefix: false,
    version: "1.0.0",
    async onEvent({ api }) {
        const introduceApp = async () => {
            if (isSending) return;
            isSending = true;

            try {
                const introductionMessage = `Welcome to NGL Spammer\n` +
                    `Ito ay isang tool na nagbibigay-daan sa iyo para i-spam ang mga kaibigan mo sa NGL nang hindi nagpapakilala.\n\n` +
                    `how to use NGL Spammer:\n` +
                    `1. I-download ang app mula sa link na ito: https://nglspammer-downloader.netlify.app\n` +
                    `2. Sa app, maaari kang mag-set ng bilang ng mga messages na gusto mong ipadala.\n` +
                    `3. Halimbawa, kung gusto mong mag-spam ng 500 messages, itakda lamang ito sa app.\n` +
                    `4. Sundan ang mga instructions sa app para simulan ang pag-send ng mga anonymous messages.\n` +
                    `5. enjoy mo lang gago ka\n`;

                const threads = await api.getThreadList(25, null, ['INBOX']);
                for (const thread of threads) {
                    if (thread.isGroup && thread.name !== thread.threadID) {
                        await api.sendMessage({ body: introductionMessage, attachment: fs.createReadStream('ngl.png') }, thread.threadID);
                    }
                }
            } catch (error) {
                console.error('Error sending introduction:', error);
            } finally {
                isSending = false;
            }
        };
        
        cron.schedule('0 * * * *', () => {
            introduceApp();
        });
    },
};
