const axios = require('axios');
const { createReadStream } = require('fs');
const { Readable } = require('stream');

module.exports = {
    name: 'generateart',
    description: 'Generate art based on the provided prompt.',
    cooldown: 3,
    nashPrefix: false,
    execute: async (api, event, args) => {
        const input = args.join(' ');

        if (!input) {
            return api.sendMessage('Please enter a prompt.', event.threadID, event.messageID);
        }

        api.sendMessage('Generating art, please wait...', event.threadID, event.messageID);

        try {
            const response = await axios.get(`https://nash-rest-api-production.up.railway.app/generate-art?prompt=${encodeURIComponent(input)}`);
            const imageUrl = response.data.imageUrl;

            const imageResponse = await axios({
                method: 'GET',
                url: imageUrl,
                responseType: 'stream'
            });

            const imageStream = imageResponse.data;
            api.sendMessage({
                body: 'Art generated successfully!',
                attachment: imageStream
            }, event.threadID, event.messageID);
        } catch (error) {
            api.sendMessage(`An error occurred: ${error.message}`, event.threadID, event.messageID);
        }
    },
};

