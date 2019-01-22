const Discord = require("discord.js");
const client = new Discord.Client();

client.login(process.env.TOKEN);
client.on("ready", () => {
    client.guilds.get("399327996076621825").channels.get("534567279891972097").send("Version " + commands.version + " published successfully!");
    setInterval(function() {
        let splash = [
            "version " + commands.version + "!",
            "in " + client.guilds.array().length + " servers!",
            "x!help",
            "Used by at least one person every day!",
            "You know what they say"
        ].concat(require("/app/stuffs/holidays.js").holidays(new Date()));
        client.user.setPresence({
            status: "online",
            game: {
                name: splash[Math.random() * splash.length | 0],
                type: "STREAMING",
                url: "https://twitch.tv/Xyvyrianeth"
            }
        });
    }, 15000);
});
exports.client = client;

var config = {
    DATABASE_URL: process.env.DATABASE_URL,
    HIREZ_API: process.env.HIREZ_API.split(' '),
    MAL_API: process.env.MAL_API.split(' ')
};
exports.config = config;

var commands = require("/app/commands.js");

client.on('message', message => {
    if (message.author.bot) {
        if (message.author.id == client.user.id) return commands.bot(message);
        else return;
    }
    if (message.content.startsWith("x!")) return commands.command(message);
    else return commands.other(message, false);
});