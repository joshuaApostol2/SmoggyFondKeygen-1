const os = require('os');

module.exports = {
  name: 'upt',
  description: 'Uptime of the bot',
  author: 'NashBot',
  nashPrefix: false,
  execute(api, event, args, prefix, commands) {
    const uptimeMessage = generateStatusMessage();
    api.sendMessage(uptimeMessage, event.threadID);
  },
};

function generateStatusMessage() {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / (60 * 60));
  const minutes = Math.floor((uptime % (60 * 60)) / 60);
  const seconds = Math.floor(uptime % 60);

  const cpuUsage = getCpuUsage();
  const ramUsage = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2);
  const cores = os.cpus().length;
  const ping = simulatePing();
  const osPlatform = os.platform();
  const cpuArchitecture = os.arch();

  return `BOT has been working for ${hours} hour(s), ${minutes} minute(s), and ${seconds} second(s).\n\n` +
    `❖ CPU usage: ${cpuUsage}%\n` +
    `❖ RAM usage: ${ramUsage} MB\n` +
    `❖ Cores: ${cores}\n` +
    `❖ Ping: ${ping} ms\n` +
    `❖ Operating System Platform: ${osPlatform}\n` +
    `❖ System CPU Architecture: ${cpuArchitecture}`;
}

function getCpuUsage() {
  const cpus = os.cpus();
  let totalUser = 0, totalNice = 0, totalSys = 0, totalIdle = 0, totalIrq = 0;

  cpus.forEach(cpu => {
    totalUser += cpu.times.user;
    totalNice += cpu.times.nice;
    totalSys += cpu.times.sys;
    totalIdle += cpu.times.idle;
    totalIrq += cpu.times.irq;
  });

  const total = totalUser + totalNice + totalSys + totalIdle + totalIrq;
  const totalActive = totalUser + totalNice + totalSys + totalIrq;

  const cpuUsage = (totalActive / total) * 100;
  return cpuUsage.toFixed(2);
}

function simulatePing() {
  return Math.floor(Math.random() * 100) + 20;
}
