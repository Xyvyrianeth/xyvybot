const Discord = require("discord.js");
const client = new Discord.Client();

client.login(process.env.TOKEN);
client.on("ready", () => {
    client.user.setPresence({
        status: "online",
        game: {
            name: "version " + commands.version + "!",
            type: "STREAMING",
            url: "https://twitch.tv/Xyvyrianeth"
        }
    });
    setInterval(function() {
        let splash = [
            "version " + commands.version + "!",
            "in " + client.guilds.cache.array().length + " servers!",
            "Say \"x!help\" for a list of commands!",
            "Used by at least one person every day!",
            "You know what they say",
            "reversi and chill",
            "Shit inside me is being fixed, be patient.",
            "I currently have 7 playable games, with at least 1 still in the planning stage. Suggest your favorite Abstract Strategy Game with the command \"x!request\"!",
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
            "Somebody sent me a bunch of hentai one day. I have no idea why they would do such a thing. I'm a bot. I can't do anything with that. What a weird fella.",
            "If you're reading this, why?",
            "You can also play games via DMs! Someone else has to want to play somewhere else, though.",
            "Some day, I'll be a popular bot.",
            "What games do you want to see me support? Use the command \"x!request\" to lend me some suggestions!",
            "I'm trying to create a back-up system for live games, because Heroku puts me to sleep every day and it makes me forget everything. Not working so well rn.",
            "Ever heard of the game Ordo?",
            "Adding Go would be a mistake because there's no guaranteed end to it. It just goes on and on until both players decide they're done.",
            "fuck movies",
            "I'm setting up a public server for tourneys 'n' shit for these games (it'll actually become public once all the games I want are added and the back-up system works). Look forward to it!",
            "Now try Ordo!",
            "A new game has been added recently! Try it out!"
        ];
        client.user.setPresence({
            status: "online",
            game: {
                name: splash[Math.random() * splash.length | 0],
                type: "STREAMING",
                url: "https://twitch.tv/Xyvyrianeth"
            }
        });
    }, 30000);
});
exports.client = client;

var config = {
    DATABASE_URL: process.env.DATABASE_URL,
    HIREZ_API: process.env.HIREZ_API.split(' '),
    MAL_API: process.env.MAL_API.split(' ')
};
exports.config = config;

var commands = require("/app/commands.js"); /*

var reactions = [];
setInterval(function() {
    reactions.forEach((m, i) => {
        if (new Date().getTime() - m[1].createdTimestamp >= 5 * 60 * 1000)
        {
            delete reactions[i];
            reactions.splice(i, 1);
        }
    });
}, 1000);
function messageReaction(reaction) {
    if (reaction.message.channel.id == "540749591084269568" && reaction.count >= 2)
    {
        let starboard = reaction.message.guild.channels.find("name", "pins");
        if (starboard == null)
        {
            return;
        }
        if (reaction.count)
        {

        }
    }
}
client.on('messageReactionAdd', messageReaction);
client.on('messageReactionRemove', messageReaction);

var reactions = [];
setInterval(function() {
    reactions.forEach((m, i) => {
        if (new Date().getTime() - m[1].createdTimestamp >= 5 * 60 * 1000)
        {
            delete reactions[i];
            reactions.splice(i, 1);
        }
    });
}, 1000);
function messageReaction(reaction) {
    if (reaction.message.channel.id == "540749591084269568" && reaction.count >= 2)
    {
        let starboard = reaction.message.guild.channels.find("name", "pins");
        if (starboard == null)
        {
            return;
        }
        if (reaction.count)
        {

        }
    }
}
client.on('messageReactionAdd', messageReaction);
client.on('messageReactionRemove', messageReaction); */

client.on('message', message => {
    if (message.author.bot && message.author.id == client.user.id)
    { /*
        if (message.channel.name == "pins")
        {
            reactions.push([messagemessage]);
        }
        else
        { */
            return commands.bot(message);
        // }
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

/*

function messageReaction(message) {
    console.log(message);
    if (message.message.channel.id == "540749591084269568")
    {
        client.channels.get("540749591084269568").send("A message reaction has been added or removed in this channel")
    }
}
client.on('messageReactionAdd', messageReaction);
client.on('messageReactionRemove', messageReaction); */