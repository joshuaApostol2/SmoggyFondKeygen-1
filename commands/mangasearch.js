const axios = require('axios');

module.exports = {
  name: 'manga-search',
  description: 'Searches for manga based on the provided title.',
  usage: '[ 🔍 𝗨𝘀𝗮𝗴𝗲 🔍 ]\n\n🔹 Example: [ 🔍 {prefix}manga-search Naruto ]',
  nashPrefix: false,
  execute(api, event, args, prefix) {
    try {
      if (!args.length) {
        const usageMessage = `
🔍 𝗠𝗮𝗻𝗴𝗮 𝗦𝗲𝗮𝗿𝗰𝗵 🔍

━━━━━━━━━━━━━━━━━━━
🔹 𝗨𝘀𝗮𝗴𝗲 🔹

🔹 Command: ${prefix}manga-search [title]

🔹 Example: ${prefix}manga-search Naruto

━━━━━━━━━━━━━━━━━━━
        `;
        api.sendMessage(usageMessage, event.threadID);
        return;
      }

      const title = encodeURIComponent(args.join(' '));
      const apiUrl = `${global.NashBot.ENDPOINT}manga-search?title=${title}`;

      api.sendMessage('🔍 Searching for manga...', event.threadID);

      axios.get(apiUrl)
        .then(response => {
          const data = response.data;
          if (data && data.length > 0) {
            let mangaResults = `
🔍 𝗠𝗮𝗻𝗴𝗮 𝗦𝗲𝗮𝗿𝗰𝗵 🔍

━━━━━━━━━━━━━━━━━━━
🔹 Results for: ${args.join(' ')}

━━━━━━━━━━━━━━━━━━━
            `;
            data.forEach(manga => {
              mangaResults += `
📖 Title: ${manga.title}
📜 Description: ${manga.description || 'N/A'}
📅 Created At: ${new Date(manga.createdAt).toLocaleDateString()}
🔄 Updated At: ${new Date(manga.updatedAt).toLocaleDateString()}
📌 Status: ${manga.status}

━━━━━━━━━━━━━━━━━━━
              `;
            });
            api.sendMessage(mangaResults, event.threadID);
          } else {
            api.sendMessage('No manga found for the provided title.', event.threadID);
          }
        })
        .catch(error => {
          console.error('Error fetching manga data:', error.message || error);
          api.sendMessage('⚠️ An error occurred while fetching the manga data.', event.threadID);
        });
    } catch (error) {
      console.error('Error executing command:', error.message || error);
      api.sendMessage('⚠️ An error occurred while executing the command.', event.threadID);
    }
  },
};