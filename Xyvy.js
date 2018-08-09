console.log("\n".repeat(9));

const Discord = require("discord.js");
const client = new Discord.Client();

client.login(process.env.TOKEN);
client.on("ready", () => {
    console.log("Xyvybot Successfully launched~! Launching version " + commands.version);
    client.user.setPresence({
        status: "online",
        game: {
            name: "version " + commands.version + "~",
            type: "STREAMING",
            url: "https://xyvybot.herokuapp.com/"
        }
    })
});
exports.client = client;

var config = {
    DATABASE_URL: process.env.DATABASE_URL,
    HIREZ_API: process.env.HIREZ_API.split(' '),
    MAL_API: process.env.MAL_API.split(' ')
};
exports.config = config;

var commands = require("./commands.js");

client.on('message', message => {
    if (message.author.bot) {
        if (message.author.id == client.user.id) return commands.bot(message);
        else return;
    }
    if (message.content.startsWith("x!")) return commands.command(message);
    else return commands.other(message, false);
});