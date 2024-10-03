const axios = require("axios");

const emojis = ["🍒", "🍉", "🍇", "🍋", "🍊", "🍌", "🍎", "🍓", "🎉", "⭐", "💰"];
const winningEmojis = ["💰", "🍎"];

module.exports = {
  name: "roulette",
  nashPrefix: false,
  execute: async (api, event, args) => {
    const userID = event.senderID;
    const amountToBet = parseInt(args[0], 10);

    if (!amountToBet || amountToBet <= 0) {
      return api.sendMessage("Invalid bet amount. Please enter a positive number to play.", event.threadID);
    }

    try {
      const balanceResponse = await axios.get(`${global.NashBot.MONEY}check-user`, { params: { userID } });
      const userBalance = balanceResponse.data.balance;

      if (userBalance === undefined) {
        return api.sendMessage("User not found. Please register first.", event.threadID);
      }

      if (userBalance <= 0) {
        return api.sendMessage("You have no money left. Please register to get ₱1,000 or earn more to play.", event.threadID);
      }

      if (amountToBet > userBalance) {
        return api.sendMessage(`You only have ₱${userBalance}. Please enter a valid amount to bet.`, event.threadID);
      }

      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const styledResult = `🎰 ROULETTE RESULT 🎰\n\n🎲 ${randomEmoji} 🎲`;

      if (winningEmojis.includes(randomEmoji)) {
        const totalWinnings = amountToBet * 2;
        await axios.get(`${global.NashBot.MONEY}save-money`, { params: { userID, amount: totalWinnings } });
        api.sendMessage(
          `Congratulations! You hit the jackpot! You won ₱${totalWinnings}!\n\n` +
          `Balance: ₱${userBalance + totalWinnings}\n\n` +
          `${styledResult}`,
          event.threadID
        );
      } else {
        await axios.get(`${global.NashBot.MONEY}deduct-money`, { params: { userID, amount: amountToBet } });
        const newBalance = userBalance - amountToBet;

        api.sendMessage(
          `Oops! You lost ₱${amountToBet}.\n\n` +
          `Balance: ₱${newBalance <= 0 ? 0 : newBalance}\n\n` +
          `${styledResult}`,
          event.threadID
        );
      }
    } catch (error) {
      api.sendMessage("An error occurred while processing your request. Please try again later.", event.threadID);
    }
  },
};
