console.log("\n".repeat(10));

const Discord = require("discord.js");
const client = new Discord.Client();

client.login(process.env.TOKEN);

client.on("ready", () => {
    console.log("Xyvyjsa Successfully launched~! Launching version " + commands.version);
    commands.getOwner(client.guilds.find("id", "399327996076621825").members.find("id", "357700219825160194"));
});

var commands = require("./commands.js");

client.on('message', message => {
    if (message.author.bot) {
        if (message.author.id == client.user.id) return commands.bot(message);
        else return;
    }
    if (message.content.startsWith("x!")) return commands.command(message);
    else return commands.other(message, false);
});

exports.client = client;
exports.creds = {
    DATABASE_URL: process.env.DATABASE_URL,
    HIREZ_API: process.env.HIREZ_API.split(' '),
    MAL_API: process.env.MAL_API.split(' ')
};