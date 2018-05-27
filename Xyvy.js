console.log("\n".repeat(10));

const Discord = require("discord.js");
const client = new Discord.Client();

var config = require("./config.json");
client.login(config.TOKEN);

client.on("ready", () => {
    console.log("Xyvyjsa Successfully launched~! Launching version " + commands.version);
    commands.getOwner(client.guilds.find("id", "399327996076621825").members.find("id", "357700219825160194"));
});
exports.client = client;
exports.database = config.DATABASE_URL;

var commands = require("./commands.js");

client.on('message', message => {
    if (message.author.bot) {
        if (message.author.id == client.user.id) return commands.bot(message);
        else return;
    }
    if (message.content.startsWith("x!")) return commands.command(message);
    else return commands.other(message, false);
});