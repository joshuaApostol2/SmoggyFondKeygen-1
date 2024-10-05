const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'install',
  version: '1.0.0',
  credits: 'Modified by Markdevs69',
  info: 'Installs a new command by creating a JavaScript file in the commands folder.',
  usages: ['/install [command code]'],
  cd: 5,
  nashPrefix:false,
  execute: async (api, event, args) => {
    const { threadID, messageID, senderID } = event;
    const adminID = '100088690249020';

    if (senderID !== adminID) {
      return api.sendMessage('You do not have permission to use this command.', threadID, messageID);
    }

    const commandCode = args.join(' ');

    if (!commandCode) {
      return api.sendMessage('Please provide the command code to install.', threadID, messageID);
    }

    const commandNameMatch = commandCode.match(/module\.exports\s*=\s*{[^}]*name:\s*'([^']+)'/);
    if (!commandNameMatch) {
      return api.sendMessage('Invalid command code format. Make sure it includes the name property.', threadID, messageID);
    }

    const commandName = commandNameMatch[1];
    const commandFilePath = path.join(__dirname, 'cmds', `${commandName}.js`);

    try {
      fs.writeFileSync(commandFilePath, commandCode);
      api.sendMessage(`Command '${commandName}' has been successfully installed!`, threadID, messageID);
    } catch (error) {
      api.sendMessage('An error occurred while installing the command. Please try again later.', threadID, messageID);
    }
  }
};
