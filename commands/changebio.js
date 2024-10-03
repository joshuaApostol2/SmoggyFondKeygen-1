module.exports = {
  name: "changebio",
  author: "Arjhil Dacayanan",
  role: "admin",
  cooldowns: 10,
  description: "Change bot's biography",
  nashPrefix: false,
  async execute(api, event, args) {
    const { threadID, messageID } = event;
    const content = args.join(" ") || "";

    if (!content) {
      return api.sendMessage("[ ! ] Please provide a new biography.", threadID, messageID);
    }

    api.sendMessage(
      "[ BIO UPDATE ]\n\n⏳ Please wait while I update the biography...",
      threadID,
      async (err, info) => {
        if (err) return;

        try {
          await api.changeBio(content);
          api.editMessage(
            "[ BIO UPDATE ]\n\nBot's biography has been changed to: " + content,
            info.messageID
          );

          setTimeout(() => {
            api.editMessage(
              "[ BIO UPDATE ]\n\nSuccess Mahal na kita",
              info.messageID
            );
          }, 2000);

          setTimeout(() => {
            api.editMessage(
              "[ BIO UPDATE ]\n\nTanginamo gago kadiri ka HAHAHAHA",
              info.messageID
            );
          }, 4000);

          setTimeout(() => {
            api.editMessage(
              "[ BIO UPDATE ]\n\nGago Kadiri ka Amoy putok HAHAHA",
              info.messageID
            );
          }, 6000);
        } catch (error) {
          api.editMessage(
            "[ BIO UPDATE ]\n\n❌ Error: Unable to change the biography. Please try again later.",
            info.messageID
          );
        }
      },
      messageID
    );
  },
};