const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "tiktok-search",
  version: "1.0.0",
  role: 0,
  credits: "Mark Hitsuraan",
  info: "TikTok search",
  usages: ['/tiktok-search [search query]'],
  cd: 5,
  nashPrefix: true,
  execute: async (api, event, args) => {
    const { threadID, messageID } = event;

    try {
      const searchQuery = args.join(" ");
      if (!searchQuery) {
        return api.sendMessage("Usage: /tiktok-search [search query]", threadID, messageID);
      }

      api.sendMessage("Searching, please wait...", threadID);

      const response = await axios.get(`${global.NashBot.MARK}api/tiksearch?search=${encodeURIComponent(searchQuery)}`);
      const videos = response.data.data.videos;

      if (!videos || videos.length === 0) {
        return api.sendMessage("No videos found for the given search query.", threadID, messageID);
      }

      const videoData = videos[0];
      const videoUrl = videoData.play;

      const message = `𝗧𝗶𝗸𝗧𝗼𝗸 𝗿𝗲𝘀𝘂𝗹𝘁𝘀:\n\n𝗣𝗼𝘀𝘁 𝗯𝘆: ${videoData.author.nickname}\n𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${videoData.author.unique_id}\n\n𝗧𝗶𝘁𝘁𝗹𝗲: ${videoData.title}`;

      const filePath = path.join(__dirname, `/cache/tiktok_video.mp4`);
      const writer = fs.createWriteStream(filePath);

      const videoResponse = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream'
      });

      videoResponse.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage(
          { body: message, attachment: fs.createReadStream(filePath) },
          threadID,
          () => fs.unlinkSync(filePath),
          messageID
        );
      });

      writer.on('error', (err) => {
        console.error('Error writing video file:', err);
        api.sendMessage("An error occurred while processing the video download.", threadID, messageID);
      });
    } catch (error) {
      console.error('Error:', error);
      api.sendMessage("An error occurred while processing the request.", threadID, messageID);
    }
  }
};
