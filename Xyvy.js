var version = "3.0.1.0";

const Discord = require("discord.js"),
	  client = new Discord.Client(),
	  PG = require("pg"),
	  db = new PG.Client(process.env.DATABASE_URL);

var images = require("/app/assets/backgrounds/images.json"),
	games = {
		games: require("/app/games/games.js").games,
		minigames: require("/app/games/minigames.js").minigames,
		othello: require("/app/games/othello.js"),
		squares: require("/app/games/squares.js"),
		rokumoku: require("/app/games/rokumoku.js"),
		ttt3d: require("/app/games/3dttt.js"),
		connect4: require("/app/games/connect4.js"),
		ordo: require("/app/games/ordo.js"),
		soccer: require("/app/games/soccer.js")
	}

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
	setInterval(() => {
		client.user.setPresence({
			status: "online",
			game: {
				name: [
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
					"A new game has been added recently! Try it out!"	][Math.random() * splash.length | 0],
				type: "STREAMING",
				url: "https://twitch.tv/Xyvyrianeth"
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
	message.channel.send("```\nWhoops! It appears there was some sort of error with the database! Not sure if it's my fault or not, but Xyvy will look into it!```");
	let query = res.replace(/`/g, "\\`").length > 1500 ? "Check console" : res.replace(/`/g, "\\`");
	if (query == "Check console")
	{
		console.log(res);
		console.log("If you can't see all of this, it'll post again in one minute.");
		setTimeout(function() { console.log(res); }, 60000);
	}
	return client.guilds.cache.get("399327996076621825").channels.cache.get("478371618620571648").send(
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
			`   id,       color,      title,      titles,             background,  backgrounds,         lefty,  money,  elo1,  elo2,  elo3,  elo4,  elo5,  elo6,  elo7,  win1,  win2,  win3,  win4,  win5,  win6,  win7,  los1,  los2,  los3,  los4,  los5,  los6,  los7\n` +
			`) VALUES (\n` +
			`   '${id}',  '#2f3136',  'default',  ARRAY ['default'],  '${image}',  ARRAY ['${image}'],  true,   500,    1000,  1000,  1000,  1000,  1000,  1000,  1000,  0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0\n` +
			`)`;
	db.query(query, (err) => {
		if (err)
			return exports.sqlError(message, err, query);
	});
	return {
		id: id, color: "#aaa", title: "default", titles: ["default"], background: image, backgrounds: [image], lefty: true, money: 500,
		elo1: 1000, elo2: 1000, elo3: 1000, elo4: 1000, elo5: 1000, elo6: 1000, elo7: 1000,
		win1: 0,	win2: 0,	win3: 0,	win4: 0,	win5: 0,	win6: 0,	win7: 0,
		los1: 0,	los2: 0,	los3: 0,	los4: 0,	los5: 0,	los6: 0,	los7: 0
	};
}

client.on('message', (message) => {
	try {
		if (!message.author.bot && message.content.startsWith("x!"))
		{
			let args = message.content.split(/ +/);
			let arg = args.shift().replace("x!", '').toLowerCase();
			let cmd = Object.keys(aliases).filter(alias => aliases[alias].includes(arg))[0] || false;
			let input = args.join(' ');
			if (!cmd) return;
			return commands[cmd](arg, args, input, message);
		}

		if (message.author.bot && message.author.id == client.user.id)
			require("/app/commands/bot.js").command(message);

		if (message.author.id == "561578790837289002" || !message.author.bot)
			require("/app/commands/user.js").command(message);
	}
	catch (err)
	{
		let errs = [];
		for (let i = 0; i < error.stack.split('\n').length; i++)
		{
			if (error.stack.split('\n')[i].includes("at Client.emit"))
				break;
			else
				errs.push(error.stack.split('\n')[i]);
		}
		message.channel.send("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now!```");
		botError(message, errs);
	}
});

var aliases = {
	// Games
	"games": ["games"],
	"game": ["othello", "reversi", "squares", "rokumoku", "connect6", "connectsix", "3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe", "connectfour", "connect4", "cfour", "c4", "ordo", "soccer", "papersoccer", "psoccer"],
	"profile": ["profile", "scorecard", "prof"],
	// Minigames
	"minesweeper": ["minesweeper", "ms", "mines"],
	"iq": ["iq", "quiz", "puzzle", "iqtest", "braingame"],
	"hangman": ["hangman", "hm"],
	// Utility
	"about": ["about", "info", "bot"],
	"credits": ["credits", "acknowledgements"],
	"help": ["help", "hlep", "je;[", "geko", "helo", "halp", "hlp", "hekp", "he;p", "commands"],
	"aliases": ["aliases"],
	// Miscellaneous
	"nekos": ["nekos", "neko", "nya", "catgirl", "catgirls", "nekomimi"],
	"calc": ["calc", "calculate", "domath"],
	"graph": ["graph"],
	"ai": ["ai", "aibot", "xyvyai"],
	"botsbyxyvy": ["botsbyxyvy", "xyvybots"],
	"bug": ["reportbug", "bugreport", "bug", "report"],
	"request": ["request", "suggest", "suggestion", "requestion"],
	// NSFW
	"nsfw": ["nsfw", "hentai", "lewd", "porn"],
	// Admin-only
	"js": ["js"],
	"pg": ["pg"],
}
var commands = {
	"about": 		require("/app/commands/about.js").command,
	"ai": 			require("/app/commands/ai.js").command,
	"aliases": 		require("/app/commands/aliases.js").command,
	"botsbyxyvy": 	require("/app/commands/botsbyxyvy.js").command,
	"bug": 			require("/app/commands/bug.js").command,
	"calc": 		require("/app/commands/calc.js").command,
	"credits": 		require("/app/commands/credits.js").command,
	"game": 		require("/app/commands/game.js").command,
	"games": 		require("/app/commands/games.js").command,
	"graph": 		require("/app/commands/graph.js").command,
	"hangman": 		require("/app/commands/hangman.js").command,
	"help": 		require("/app/commands/help.js").command,
	"iq": 			require("/app/commands/iq.js").command,
	"js": 			require("/app/commands/js.js").command,
	"minesweeper": 	require("/app/commands/minesweeper.js").command,
	"nekos": 		require("/app/commands/nekos.js").command,
	"nsfw": 		require("/app/commands/nsfw.js").command,
	"pg": 			require("/app/commands/pg.js").command,
	"profile": 		require("/app/commands/profile.js").command,
	"request": 		require("/app/commands/request.js").command
};

exports.client = client;
exports.db = db;
exports.games = games;
exports.aliases = aliases;
exports.version = version;
exports.sqlError = sqlError;
exports.newUser = newUser;