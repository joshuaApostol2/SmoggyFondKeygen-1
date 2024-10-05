const {
  createCanvas,
  loadImage
} = require('canvas');
const fs = require('fs-extra');
const axios = require('axios');

module.exports = {
  name: 'condolence',
  description: 'RIP memes',
  author: 'Markdevs69',//converted by joshua Apostol
  nashPrefix: true,
  execute: async (api, event, args, prefix) => {
    const { senderID, messageID, threadID } = event;
    let pathImg = __dirname + '/cache/background.png';
    let pathAvt1 = __dirname + '/cache/Avtmot.png';

    // Fetching user info using the Graph API
    var id = Object.keys(event.mentions)[0] || event.senderID;
    var name;

    try {
      let userInfo = await axios.get(`https://graph.facebook.com/${id}?fields=name&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
      name = userInfo.data.name;
    } catch (error) {
      name = 'User'; // Fallback if user name can't be fetched
    }

    var background = [
      'https://i.imgur.com/5T5g2iU.jpg'
    ];
    var rd = background[Math.floor(Math.random() * background.length)];

    let getAvtmot = (
      await axios.get(
        `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: 'arraybuffer' }
      )
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, 'utf-8'));

    let getbackground = (
      await axios.get(`${rd}`, {
        responseType: 'arraybuffer',
      })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(getbackground, 'utf-8'));

    let baseImage = await loadImage(pathImg);
    let baseAvt1 = await loadImage(pathAvt1);

    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext('2d');
    ctx.drawImage(baseImage, 4, 2, canvas.width, canvas.height);
    ctx.font = '400 26px Times New Roman';
    ctx.fillStyle = '#FFA500';
    ctx.textAlign = 'start';

    const lines = await wrapText(ctx, name, 1160);
    ctx.fillText(lines.join('\n'), 100, 680);
    ctx.beginPath();

    ctx.drawImage(baseAvt1, 150, 120, 180, 233);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(pathAvt1);

    return api.sendMessage(
      { attachment: fs.createReadStream(pathImg) },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  }
};

const wrapText = (ctx, text, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText('W').width > maxWidth) return resolve(null);
    const words = text.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
};
