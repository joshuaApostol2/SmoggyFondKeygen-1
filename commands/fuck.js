const { resolve, join } = require("path");
const fs = require("fs");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
    name: "fuck",
    description: "Generate meme images",
    version: "2.0.0",
    credits: "developer",//mod by joshua apostol
    usages: "[tag]",
    cooldown: 5,
    nashPrefix: false,
    execute: async (api, event, args) => {
        const dirMaterial = resolve(__dirname, 'cache', 'canvas');
        const imagePath = resolve(dirMaterial, 'fuck.png');

        if (!fs.existsSync(dirMaterial)) {
            fs.mkdirSync(dirMaterial, { recursive: true });
        }

        if (!fs.existsSync(imagePath)) {
            const response = await axios.get('https://i.ibb.co/TW9Kbwr/images-2022-08-14-T183542-356.jpg', {
                responseType: 'arraybuffer'
            });
            fs.writeFileSync(imagePath, response.data);
        }

        const { senderID } = event;
        const mention = Object.keys(event.mentions)[0] || null;

        if (!mention) {
            return api.sendMessage("Please tag 1 person", event.threadID, event.messageID);
        }

        try {
            const tag = await api.getUserInfo(mention);
            const one = senderID;
            const two = mention;
            const generatedImagePath = await makeImage({ one, two });

            api.sendMessage({
                body: `U*g Sge pa! ${tag[mention].name}`,
                mentions: [{ tag: tag[mention].name, id: mention }],
                attachment: fs.createReadStream(generatedImagePath)
            }, event.threadID, () => {
                if (fs.existsSync(generatedImagePath)) {
                    fs.unlinkSync(generatedImagePath);
                }
            }, event.messageID);
        } catch (error) {
            api.sendMessage(`An error occurred: ${error.message}`, event.threadID, event.messageID);
        }
    }
};

async function makeImage({ one, two }) {
    const __root = join(__dirname, "cache", "canvas");

    if (!fs.existsSync(__root)) {
        fs.mkdirSync(__root, { recursive: true });
    }

    let batgiam_img = await jimp.read(join(__root, "fuck.png"));
    let pathImg = join(__root, `tromcho_${one}_${two}.png`);
    let avatarOne = join(__root, `avt_${one}.png`);
    let avatarTwo = join(__root, `avt_${two}.png`);

    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: 'arraybuffer'
    })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: 'arraybuffer'
    })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    batgiam_img.composite(circleOne.resize(100, 100), 20, 300).composite(circleTwo.resize(150, 150), 100, 20);

    let raw = await batgiam_img.getBufferAsync("image/png");

    fs.writeFileSync(pathImg, raw);
    fs.unlinkSync(avatarOne);
    fs.unlinkSync(avatarTwo);

    return pathImg;
}

async function circle(image) {
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
}
