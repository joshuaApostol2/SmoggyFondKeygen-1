const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "shoti",
    description: "trip ko kang",
    nashPrefix: false,
    version: "1.0.0",
    role: 0,
    cooldowns: 5,
    async execute(api, event, args) {
        const { threadID, messageID } = event;

        api.sendMessage(
            "[ 𝗦𝗛𝗢𝗧𝗜 ]\n\n" +
            "Mag Antay Ka GAGO...",
            threadID,
            async (err, info) => {
                if (err) return;

                try {
                    const response = await axios.get('https://shoti.kenliejugarap.com/getvideo.php?apikey=shoti-0763839a3b9de35ae3da73816d087d57d1bbae9f8997d9ebd0da823850fb80917e69d239a7f7db34b4d139a5e3b02658ed26f49928e5ab40f57c9798c9ae7290c536d8378ea8b01399723aaf35f62fae7c58d08f04');
                    const videoData = response.data;
                    const videoUrl = videoData.videoDownloadLink;

                    if (!videoUrl) {
                        return api.editMessage(
                            "[ 𝗦𝗛𝗢𝗧𝗜 ]\n\n" +
                            "❌ Failed to fetch the video. Please try again.",
                            info.messageID
                        );
                    }

                    const videoPath = path.join(__dirname, 'noprefix', 'shoti.mp4');
                    const videoResponse = await axios({
                        method: 'get',
                        url: videoUrl,
                        responseType: 'stream',
                    });

                    const writer = fs.createWriteStream(videoPath);
                    videoResponse.data.pipe(writer);

                    writer.on('finish', () => {
                        api.sendMessage({
                            body: `[ 𝗦𝗛𝗢𝗧𝗜 ]\n\n` +
                                  `🎬 Title: ${videoData.title || "No Title"}\n` +
                                  `👤 Username: ${videoData.username || "Unknown"}\n\n` +
                                  `Enjoy your video! 🎥`,
                            attachment: fs.createReadStream(videoPath),
                        }, threadID, () => {
                            fs.unlinkSync(videoPath);
                        });
                    });

                    writer.on('error', () => {
                        api.editMessage(
                            "[ 𝗦𝗛𝗢𝗧𝗜 ]\n\n" +
                            "❌ An error occurred while downloading the video.",
                            info.messageID
                        );
                    });

                } catch (error) {
                    api.editMessage(
                        "[ 𝗦𝗛𝗢𝗧𝗜 𝗧𝗜𝗞𝗧𝗢𝗞 𝗩𝗜𝗗𝗘𝗢 ]\n\n" +
                        "❌ Failed to process your request. Please try again later.",
                        info.messageID
                    );
                }
            },
            messageID
        );
    },
};
