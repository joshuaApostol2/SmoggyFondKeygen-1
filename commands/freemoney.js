const axios = require("axios");

const userCooldowns = {};

module.exports = {
  name: "freemoney",
  nashPrefix: false,
  execute: async (api, event) => {
    const userID = event.senderID;
    const currentTime = new Date().getTime();
    
    if (userCooldowns[userID] && currentTime - userCooldowns[userID] < 60 * 60 * 1000) {
      const timeLeft = Math.ceil((60 * 60 * 1000 - (currentTime - userCooldowns[userID])) / 60000);
      return api.sendMessage(`Please wait ${timeLeft} minutes to claim free money again.`, event.threadID);
    }

    try {
      await axios.get(`${global.NashBot.MONEY}save-money`, { params: { userID, amount: 500 } });
      api.sendMessage("You've received ₱500 free money! Come back in an hour for more.", event.threadID);
      
      userCooldowns[userID] = currentTime;
    } catch (error) {
      api.sendMessage("An error occurred. Please try again later.", event.threadID);
    }
  },
};
