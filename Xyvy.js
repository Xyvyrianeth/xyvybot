const Discord = require("discord.js");
const client = new Discord.Client();

client.login(process.env.TOKEN);
client.on("ready", () => {
    client.guilds.get("399327996076621825").channels.get("534567279891972097").send("Version " + commands.version + " published successfully!");
    setInterval(function() {
        let splash = [
            "version " + commands.version + "!",
            "in " + client.guilds.array().length + " servers!",
            "Say \"x!help\" for a list of commands!",
            "Used by at least one person every day!",
            "You know what they say",
            "reversi and chill",
            "Shit inside me is being fixed, be patient.",
            "Currently have 4 playable games with at least 4 still in development.",
            "they don't think it be like it is, but it do",
            "Have you seen Endgame, yet?",
            "sub 2 pewdiepie",
            "I will not ever support Chess. There's already a bot for that. It's literally called Chess Bot.",
            "One day, I'll be completed.",
            "Did you know I also have an AI bot you can play games against? Use the command \"x!ai\" for an invite link!",
            "No human has ever beaten my AI bot in a game of Squares!",
            "Want your own Discord bot to do things other bots don't? Use the command \"x!botsbyxyvy\" for more information!",
            "Thanos did nothing wrong.",
            "Yo' mixtape is trash.",
            "The best bot for playing Abstract Strategy Games that I know of!",
            "Don't bother clicking this link, I never stream anything. I don't have that kind of internet.",
            "Somebody sent me a bunch of hentai one day. I have no idea why they would do such a thing. I'm a bot—I can't do anything with that. What a weird fella.",
            "If you're reading this, why?",
            "You can also play games via DMs! Someone else has to want to play somewhere else, though.",
            "Some day, I'll be a popular bot.",
            "What games do you want to see me support? Use the command \"x!request\" to lend me some suggestions!",
            "I'm trying to create a back-up system for live games, because Heroku puts me to sleep every day and it makes me forget everything. Not working so well rn.",
            "",
            "",
            "",
            ""
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
    if (message.author.bot && message.author.id == client.user.id)
    {
        return commands.bot(message);
    }
    if (message.content.startsWith("x!"))
    {
        return commands.command(message);
    }
    else
    if (message.author.id == "561578790837289002" || !message.author.bot)
    {
        return commands.other(message, false);
    }
});