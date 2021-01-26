const Discord = require("discord.js"),
	  client = new Discord.Client(),
	  PG = require("pg"),
	  db = new PG.Client(process.env.DATABASE_URL),
	  package = require("/app/package.json"),
	  { Color } = require("/app/assets/misc/color.js");
exports.client = client;
exports.db = db;

	var version = package.version + ".1";
exports.version = version;

require("/app/assets/prototypes/math.js");
require("/app/assets/prototypes/array.js");

var images = require("/app/assets/backgrounds/images.json"),
	games = {
		games: 	   require("/app/games/games.js").games,
		minigames: require("/app/games/minigames.js").minigames,
		othello:   require("/app/games/othello.js"),
		squares:   require("/app/games/squares.js"),
		rokumoku:  require("/app/games/rokumoku.js"),
		ttt3d:     require("/app/games/3dttt.js"),
		connect4:  require("/app/games/connect4.js"),
		ordo:      require("/app/games/ordo.js"),
		soccer:    require("/app/games/soccer.js"),
		loa:       require("/app/games/loa.js"),
		latrones:  require("/app/games/latrones.js")
	};
exports.games = games;

client.login(process.env.TOKEN);
client.on("ready", () => {
	client.user.setPresence({
		status: "online",
		activity: {
			name: "version " + version + "!",
			type: "STREAMING",
			url:  "https://twitch.tv/Xyvyrianeth"
		}
	});
	setInterval(() => {
		client.user.setPresence({
			status: "online",
			activity: {
				name: [
					"Version " + version + "!",
					"in " + client.guilds.cache.array().length + " servers!",
					"Say \"x!help\" for a list of commands!",
					"Used by at least one person every day!",
					"Reversi and Chill",
					"I currently have 7 playable games, and I want to add more. Suggest your favorite Abstract Strategy Game with the command \"x!request\"!",
					"What games do you want to see me support? Use the command \"x!request\" to send me some suggestions!",
					"they don't think it be like it is, but it do",
					"I will never support Chess. There's already a bot for that. It's literally called Chess Bot.",
					"One day, I'll be completed.",
					"Did you know I also have an AI bot you can play games against? Use the command \"x!ai\" for an invite link!",
					"No human has ever beaten my AI bot in a game of Squares!",
					// "Want your own Discord bot to do things other bots don't? Use the command \"x!botsbyxyvy\" for more information!",
					"The best bot for playing a specific collection of Abstract Strategy Games that I know of!",
					"You can also play games via DMs! Someone else has to want to play somewhere else, though.",
					"Some day, I'll be a popular bot.",
					"Ever heard of the game Ordo?",
					"Adding Go would be a mistake because there's no guaranteed end to it. It just goes on and on until both players decide they're done or somebody dies.",
					"I'm setting up a public server for tourneys 'n' shit for these games. Look forward to it!",
					"Use the command x!invite to add me to your own server!" ].random(),
				type: "STREAMING",
				url:  "https://twitch.tv/Xyvyrianeth"
			}
		});
	}, 30000);
});
db.connect();

botError = (message, err) => {
	return client.channels.cache.get("467902250128506880").send(
		`\`\`\`Server: ${message.channel.guild.name} (${message.channel.guild.id})\n` +
		`Channel: ${message.channel.name} (${message.channel.id})\`\`\`\n` +
		`\`\`\`User errored on:\`\`\`<@${message.author.id}>\n\n` +
		`\`\`\`\n` +
		`Message sent:\`\`\`\`\`\`\n` +
		`${message.content.replace(/`/g, "\\\`")}\`\`\`\n` +
		`\`\`\`\n` +
		`${err.join("\n")}\`\`\``);
}
sqlError = (message, err, res) => {
	let error = new Discord.MessageEmbed()
		.setAuthor("Xyvybot", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png")
		.setDescription("SQL error encountered.");
	message.channel.send({error});
	let query = res.replace(/`/g, "\\`").length > 1500 ? "Check console" : res.replace(/`/g, "\\`");
	if (query == "Check console")
	{
		console.log(res);
		console.log("If you can't see all of this, it'll post again in one minute.");
		setTimeout(function() { console.log(res); }, 60000);
	}
	client.channels.cache.get("478371618620571648").send(
		`\`\`\`Server: ${message.channel.guild.name} (${message.channel.guild.id})\n` +
		`Channel: ${message.channel.name} (${message.channel.id})\`\`\`\n` +
		`\`\`\`\n` +
		`Query:\`\`\`\`\`\`sql\n` +
		`${query}\`\`\`\n` +
		`\`\`\`\n` +
		`${err}\`\`\``);
}
newUser = (id, message) => {
	let image = images.ids.random(),
		query =
			`INSERT INTO profiles (\n` +
			`   id, color, title, background, backgrounds, lefty, money, elo1, elo2, elo3, elo4, elo5, elo6, elo7, elo8, elo9, win1, win2, win3, win4, win5, win6, win7, win8, win9, los1, los2, los3, los4, los5, los6, los7, los8, los9\n` +
			`) VALUES (\n` +
			`   '${id}', '#2f3136', 'Casual Gamer', '${image}', ARRAY ['${image}'], ${images.display.right.includes(image) ? false : true}, 500, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0\n` +
			`)`;
	db.query(query, (err) => {
		if (err)
			exports.sqlError(message, err, query);
	});
	return {
		id: id, color: "#aaa", title: "Casual Gamer", background: image, backgrounds: [image], lefty: images.display.right.includes(image) ? false : true, money: 500,
		elo1: 1000, elo2: 1000, elo3: 1000, elo4: 1000, elo5: 1000, elo6: 1000, elo7: 1000, elo8: 1000, elo9: 1000,
		win1: 0,    win2: 0,    win3: 0,    win4: 0,    win5: 0,    win6: 0,    win7: 0,    win8: 0,    win9: 0,
		los1: 0,    los2: 0,    los3: 0,    los4: 0,    los5: 0,    los6: 0,    los7: 0,    los8: 0,    los9: 0
	};
}
exports.sqlError = sqlError;
exports.newUser = newUser;

client.on('message', (message) => {
	try {
		if (message.author.id == "561578790837289002" || !message.author.bot)
		{
			if (message.content.startsWith("x!"))
			{
				let args = message.content.split(/ +/),
					arg = args.shift().replace("x!", '').toLowerCase(),
					cmd = Object.keys(aliases).filter(alias => aliases[alias].includes(arg))[0] || false,
					input = args.join(' ');
				if (!cmd) return;
				return commands[cmd](arg, args, input, message);
			}
			else
				require("/app/commands/user.js").command(message);
		}
		if (message.author.id == client.user.id)
			require("/app/commands/bot.js").command(message);
	}
	catch (err)
	{
		let errs = [];
		for (let i = 0; i < err.stack.split('\n').length; i++)
		{
			if (err.stack.split('\n')[i].includes("at Client.emit"))
				break;
			else
				errs.push(err.stack.split('\n')[i]);
		}
		if ((message.author.id == "561578790837289002" || !message.author.bot) && message.content.startsWith("x!"))
		{
			message.channel.send(new Discord.MessageEmbed()
				.setAuthor("Xyvybot", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png")
				.setTitle("Error on command: x!" + message.content.split(' ')[0].substring(2))
				.setDescription("Well, I appear to have made an error somewhere. Don't worry, though, these things usually get fixed pretty soon.")
				.setColor(new Color().random()));
			botError(message, errs);
		}
	}
});

var aliases = {
	// Games
	"profile": ["profile", "prof", "stats", "statistics"],
	"top": ["top", "leaderboard", "leaderboards", "lb", "rank", "ranks", "ranking", "rankings"],
	"history": ["history", "recent"],
	"game": [
		"othello", "reversi",
		"squares",
		"rokumoku", "rm", "rokum", "rmoku", "connect6", "connectsix", "c6", "csix",
		"3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe",
		"connectfour", "connect4", "cfour", "c4",
		"ordo",
		"soccer", "papersoccer", "psoccer",
		"linesofaction", "loa", "lines",
		"latrones", "ludus", "latrunculi" ],
	// Minigames
	"minesweeper": ["minesweeper", "ms", "mines"],
	"iq": ["iq", "quiz", "puzzle", "iqtest", "braingame"],
	"hangman": ["hangman", "hm"],
	// Utility
	"help": ["help", "hlep", "je;[", "geko", "helo", "halp", "hlp", "hekp", "he;p", "commands"],
	"invite": ["invite"],
	"aliases": ["aliases"],
	"bug": ["reportbug", "bugreport", "bug", "report"],
	"request": ["request", "suggest", "suggestion", "requestion"],
	// Miscellaneous
	"nekos": ["nekos", "neko", "nya", "catgirl", "catgirls", "nekomimi"],
	"calc": ["calc", "calculate", "domath"],
	"graph": ["graph"],
	"about": ["about", "info", "bot"],
	"credits": ["credits", "acknowledgements"],
	"ai": ["ai", "aibot", "xyvyai"],
	// NSFW
	"nsfw": ["nsfw", "hentai", "lewd", "porn"],
	// Admin-only
	"js": ["js"],
	"pg": ["pg"],
};
var commands = {
	"about":		require("/app/commands/about.js").command,
	"ai":			require("/app/commands/ai.js").command,
	"aliases":		require("/app/commands/aliases.js").command,
	"bug":			require("/app/commands/bug.js").command,
	"calc":			require("/app/commands/calc.js").command,
	"credits":		require("/app/commands/credits.js").command,
	"game":			require("/app/commands/game.js").command,
	"graph":		require("/app/commands/graph.js").command,
	"hangman":		require("/app/commands/hangman.js").command,
	"history":		require("/app/commands/history.js").command,
	"help":			require("/app/commands/help.js").command,
	"invite":		require("/app/commands/invite.js").command,
	"iq":			require("/app/commands/iq.js").command,
	"js":			require("/app/commands/js.js").command,
	"minesweeper":	require("/app/commands/minesweeper.js").command,
	"nekos":		require("/app/commands/nekos.js").command,
	"nsfw":			require("/app/commands/nsfw.js").command,
	"pg":			require("/app/commands/pg.js").command,
	"profile":		require("/app/commands/profile.js").command,
	"request":		require("/app/commands/request.js").command,
	"top":			require("/app/commands/top.js").command
};
exports.aliases = aliases;