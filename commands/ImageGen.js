const axios = require('axios');

module.exports = {
    name: 'generateimage',
    description: 'Generate an image based on the provided prompt and style.',
    cooldown: 3,
    nashPrefix: false,
    execute: async (api, event, args) => {
        const input = args.join(' ');

        if (!input) {
            return api.sendMessage('Please enter a prompt.', event.threadID, event.messageID);
        }

        api.sendMessage('Generating image, please wait...', event.threadID, event.messageID);

        try {
            const response = await axios.get(`https://nash-rest-api-production.up.railway.app/generate-image?prompt=${encodeURIComponent(input)}&styleIndex=1`);
            const imageUrl = response.data.image;

            const imageResponse = await axios({
                method: 'GET',
                url: imageUrl,
                responseType: 'stream'
            });

            const imageStream = imageResponse.data;

            api.sendMessage({
                body: `Image generated successfully`,
                attachment: imageStream
            }, event.threadID, event.messageID);
        } catch (error) {
            api.sendMessage(`An error occurred: ${error.message}`, event.threadID, event.messageID);
        }
    },
};
