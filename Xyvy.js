var version = "3.0.0.11";

const Discord = require("discord.js"),
	  client = new Discord.Client(),
	  Canvas = require("canvas"),
	  PG = require("pg"),
	  db = new PG.Client(process.env.DATABASE_URL),
	  gifEncoder = require("canvas-gif-encoder"),
	  fs = require("fs");

var { Color } = require("/app/assets/misc/color.js"),
	{ table } = require("/app/assets/misc/table.js"),
	Profile = require("/app/assets/profile/profile.js"),
	titles = require("/app/assets/profile/titles.json"),
	images = require("/app/assets/backgrounds/images.json"),
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
exports.sqlError = (message, err, res) => {
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
		id: id,
		color: "#aaa",
		title: "default",
		titles: ["default"],
		background: image,
		backgrounds: [image],
		lefty: true,
		money: 500,
		elo1: 1000,
		elo2: 1000,
		elo3: 1000,
		elo4: 1000,
		elo5: 1000,
		elo6: 1000,
		elo7: 1000,
		win1: 0,
		win2: 0,
		win3: 0,
		win4: 0,
		win5: 0,
		win6: 0,
		win7: 0,
		los1: 0,
		los2: 0,
		los3: 0,
		los4: 0,
		los5: 0,
		los6: 0,
		los7: 0
	};
}
var timers = setInterval(() => {
	db.query("SELECT * FROM timers", (err, res) => {
		if (err)
			return exports.sqlError("Internal (var timers @ line 23)", err, "SELECT * FROM timers");

		res.rows.forEach(row => {
			if (row.time > 0)
				db.query(`UPDATE timers SET time = ${row.time - 1} WHERE id = '${row.id}'`, (err) => {
					if (err)
						exports.sqlError("Internal (var timers @ line 23 | db.query @ line 36)", err, `UPDATE timers SET time = ${row.time - 1} WHERE id = '${row.id}'`);
				});
			else
				db.query(`DELETE FROM timers WHERE id = '${row.id}'`, (err) => {
						if (err)
							exports.sqlError("Internal (var timers @ line 23 | db.query @ line 53)", err, `DELETE FROM timers WHERE id = '${row.id}'`);
				});
		});
	});
}, 1000);

Object.defineProperty(Array.prototype, 'clone', {
	value: function() {
		return JSON.parse(JSON.stringify(this));
	}
});
Object.defineProperty(Array.prototype, 'random', {
	value: function(a) {
		if (!a)
			return this[Math.random() * this.length | 0];
		else
		{
			let b = [],
				c = [];
			if (this.length < a)
				a = this.length;
			for (let i = a; i--;)
			{
				let d = Math.random() * this.length | 0;
				if (c.includes(d))
					i++;
				else
					c.push(d);
			}
			for (let i = a; i--;)
				b.push(this[c[i]]);
			return b;
		}
	}
});
Object.defineProperty(Array.prototype, 'shuffle', {
	value: function() {
		let a = this.clone(),
			b = [];
		for (let i = 0; i < this.length; i++)
		{
			let c = a[Math.random() * a.length | 0];
			b.push(c);
			a.splice(a.indexOf(c), 1);
		}
		return b;
	}
});
Object.defineProperty(Math, 'sum', {
	value: (n, a, b) => {
		n = Math.round(n),
		a = Math.round(a),
		c = 0;
		for (let i = n; i <= a; i++)
			c += b;
		return c;
	}
});
Object.defineProperty(Math, 'prod', {
	value: (n, a, b) => {
		n = Math.round(n),
		a = Math.round(a),
		c = 0;
		for (let i = n; i <= a; i++)
			c *= b;
		return c;
	}
});
Object.defineProperty(Math, 'gcd', {
	value: (a, b) => {
		if (!b)
			return a;
		else
			return Math.gcd(b, a % b);
	}
});
Object.defineProperty(Math, 'fraction', {
	value: (a, n) => {
		let num = 0,
			den = 0;
		do
		{
			den++;
			num = a * den;
		}
		while (num != Math.round(num));

		if (n == undefined)
			return [num, den, num + '/' + den];
		else
			return [num, den, num + '/' + den][n];
	}
});

client.on('message', (message) => {
    if (message.author.bot && message.author.id == client.user.id)
    {
		if (message.attachments.array().length != 0)
		{
			let img = message.attachments.first().filename;
			if (/^(connect4|squares|othello|rokumoku|ttt3d|ordo|soccer)_(0_[0-9]+vs[0-9]+|1_[0-9]+|2_tie)\.png$/.test(img))
			{
				let game = games.games.filter(game => game.channels.hasOwnProperty(message.channel.id))[0];
				game.canHaveTurn = true;
				let end = img.match(/_[0-2]_/)[0].substring(1, 2);
				if (end === '0')
					return game.channels[message.channel.id].push(message.id);
				let result = false;

				let Game = img.match(/^(connect4|squares|othello|rokumoku|ttt3d|ordo|soccer)/g)[0];
				let query = `INSERT INTO matches (id, game, location, players, winner, timestart, squarereplay)\n` +
							`VALUES ('${message.id}', '${Game}', '${message.channel.id}/blank', ARRAY['${game.players[0]}', '${game.players[1]}'], '${game.players[game.winner]}', '${game.timeStart}', 'false')`;
				db.query(query, err => {
					if (err)
						return exports.sqlError(message, err, query);

					// Replay Creation
					let dimensions = {
						"connect4": [184, 195],
						"ttt3d": [316, 230],
						"squares": [280, 300],
						"othello": [221, 246],
						"rokumoku": [321, 346],
						"ordo": [271, 246],
						"soccer": [311, 235]
					}[Game];
					let encoder1 = new gifEncoder(dimensions[0], dimensions[1]);
					let stream1 = fs.createWriteStream("replay_" + message.id + ".gif");
					encoder1.createReadStream().pipe(stream1);
					encoder1.begin();
					encoder1.addFrame(game.replayData[0], 2500);
					for (let f = 1; f <  game.replayData.length - 1; f++)
						encoder1.addFrame(game.replayData[f], 500);
					encoder1.addFrame(game.replayData[game.replayData.length - 1], 5000)
					encoder1.end();
					setTimeout(() => {
						let attachment1 = new Discord.MessageAttachment(`replay_${message.id}.gif`, `replay_${message.id}.gif`);
						let embed1 = new Discord.MessageEmbed()
							.setTitle("Replay GIF:")
							.attachFiles(attachment1)
							.setImage(`attachment://replay_${message.id}.gif`)
							.setFooter("Match ID: " + message.id)
							.setDescription(`<@${game.players[0]}> VS <@${game.players[1]}>\nWinner: <@${game.players[game.winner]}>`);
						message.channel.send(embed1);
					}, 5000);
					if (Game == "squares")
					{
						let encoder2 = new gifEncoder(dimensions[0], dimensions[1]);
						let stream2 = fs.createWriteStream("counter_" + message.id + ".gif");
						encoder2.createReadStream().pipe(stream2);
						encoder2.begin();
						encoder2.addFrame(game.squareCounterData[0], 2500);
						for (let f = 1; f <  game.squareCounterData.length - 1; f++)
							encoder2.addFrame(game.squareCounterData[f], 350);
						encoder2.addFrame(game.squareCounterData[game.squareCounterData.length - 1], 2500)
						encoder2.end();
						setTimeout(() => {
							let attachment2 = new Discord.MessageAttachment(`counter_${message.id}.gif`, `counter_${message.id}.gif`);
							let embed2 = new Discord.MessageEmbed()
								.setTitle("Final Square Count:")
								.attachFiles(attachment2)
								.setImage(`attachment://counter_${message.id}.gif`)
								.setFooter("Match ID: " + message.id);
							message.channel.send(embed2);
						}, 5000);
					}
				});

				if (end == 1)
					result = {
						winner: game.players[game.winner],
						loser: game.players[[1, 0][game.winner]],
						game: JSON.stringify(["othello", "squares", "rokumoku", "ttt3d", "connect4", "ordo", "soccer"].indexOf(game.game) + 1),
						score: game.score
					};
				if (end != 0)
					games.games.forEach((game, index) => {
						if (game.channels.hasOwnProperty(message.channel.id))
						{
							delete games.games[index];
							games.games.splice(index, 1);
						}
					});

				if (result)
					db.query(`SELECT *\n` + `FROM profiles\n` + `WHERE id = '${result.winner}' OR id = '${result.loser}'`, (err, res) => {
						if (err)
							return exports.sqlError(message, err, `SELECT *\n` + `FROM profiles\n` + `WHERE id = '${result.winner}' OR id = '${result.loser}'` );
						let wins;
						let lose;

						if (res.rows.length == 0)
							wins = newUser(result.winner, message),
							lose = newUser(result.loser, message);
						else
						if (res.rows.length == 2)
							wins = res.rows.find(x => x.id == result.winner),
							lose = res.rows.find(x => x.id == result.loser);
						else
						if (res.rows[0].id == result.winner)
							lose = newUser(result.loser, message),
							wins = res.rows[0];
						else
						if (res.rows[0].id == result.loser)
							lose = res.rows[0],
							wins = newUser(result.winner, message);

						if (lose["elo" + result.game] > wins["elo" + result.game])
							lose.money += 25,
							wins.money += 100;
						if (lose["elo" + result.game] == wins["elo" + result.game])
							lose.money += 50,
							wins.money += 75;
						if (lose["elo" + result.game] < wins["elo" + result.game])
							lose.money += 75,
							wins.money += 50;

						// Titles
						let wits = [];
						if (wins["elo" + result.game] >= 2000 && !wins.titles.includes("2k_elo" + result.game))
						{
							wits.push("2k_elo" + result.game);
							if (result.game == 1)
								wits.push("2k_ELO1");
						}
						if (result.game == 5 && lose.id == "238916443402534914" && !wins.titles.includes("beatRDB"))
							wits.push("beatRDB");
						if (result.game == 2 && lose.id == "561578790837289002" && !wins.titles.includes("beatXAI"))
							wits.push("beatXAI");
						for (let i = 0; i < 8; i++)
							if (wins.elo1 + wins.elo2 + wins.elo3 + wins.elo4 + wins.elo5 + wins.elo6 + wins.elo7 >= [15E3, 2E4, 25E3, 3E4, 4E4, 5E4, 75E3, 1E5][i] && !wins.titles.includes(["15k_elo", "20k_elo", "25k_elo", "30k_elo", "40k_elo", "50k_elo", "75k_elo", "100kelo"][i]))
								wits.push(["15k_elo", "20k_elo", "25k_elo", "30k_elo", "40k_elo", "50k_elo", "75k_elo", "100kelo"][i]);

						let lits = [];
						for (let i = 0; i < 8; i++)
							if (lose.elo1 + lose.elo2 + lose.elo3 + lose.elo4 + lose.elo5 + lose.elo6 + lose.elo7 <= [2500, 2E3, 1500, 1E3, 750, 500, 250, 0][i] && !lose.titles.includes(["2500elo", "2000elo", "1500elo", "1000elo", "750_elo", "500_elo", "250_elo", "eloGone"][i]))
								lits.push(["2500elo", "2000elo", "1500elo", "1000elo", "750_elo", "500_elo", "250_elo", "eloGone"][i]);


						let booty = Math.ceil(lose["elo" + result.game] / 10),
							query = `UPDATE profiles\n` +
								`SET\n` +
								`   elo${result.game} = ${wins["elo" + result.game] + booty},\n` +
								`   win${result.game} = ${wins["win" + result.game] + 1},\n` +
								`   money = ${wins.money},\n` +
								`   titles = ARRAY${JSON.stringify(wins.titles.concat(wits)).replace(/"/g, "'")}\n` +
								`WHERE id = '${wins.id}';\n` +
								`\n` +
								`UPDATE profiles\n` +
								`SET\n` +
								`   elo${result.game} = ${lose["elo" + result.game] - booty},\n` +
								`   los${result.game} = ${lose["los" + result.game] + 1},\n` +
								`   money = ${lose.money},\n` +
								`   titles = ARRAY${JSON.stringify(lose.titles.concat(lits)).replace(/"/g, "'")}\n` +
								`WHERE id = '${lose.id}';`
						db.query(query, (err) => {
							if (err)
								return exports.sqlError(message, err, query);
						});
						if (wits.length > 0)
						{
							let text = '';
							for (let i = 0; i < wits.length; i++)
								text += `[${titles[wits[i]]}](${wits[i]})\n`
							client.users.cache.get(wins.id).send(
								"You've just received the following titles to use for your `x!profile`:\n" +
								"```md\n" +
								text +
								"```\n" +
								"Use the command `x!profile titles` to see all your owned titles.");
						}
						if (lits.length > 0)
						{
							let text = '';
							for (let i = 0; i < lits.length; i++)
								text += `[${titles[lits[i]]}](${lits[i]})\n`
							client.users.cache.get(lose.id).send(
								"You've just received the following titles to use for your `x!profile`:\n" +
								"```md\n" +
								text +
								"```");
						}
					});
			}
		}
		else
		if (games.games.some(game => game.channels.hasOwnProperty(message.channel.id)))
		{
			let game = games.games.filter(game => game.channels.hasOwnProperty(message.channel.id))[0];
			if (/<@[0-9]+> is now requesting a new game of (Connect 4|Squares|Othello|Rokumoku|3D Tic Tac Toe|Ordo|Paper Soccer)!/.test(message.content) || message.content.startsWith("Illegal move:") || message.content == "This is a singleton move, please use the singleton move format!")
				game.channels[message.channel.id].push(message.id);
		}
		else
		if (message.embeds.length > 0)
		{
			message.embeds.forEach(embed => {
				if (embed.title == "Replay GIF:")
				{
					let query = `UPDATE matches SET location = '${message.channel.id}/${embed.image.url.split('/')[5]}' WHERE id = '${embed.footer.text.match(/[0-9]+$/)[0]}'`;
					db.query(query, err => { if (err) return exports.sqlError(message, err, query); });
				}
				if (embed.title == "Final Square Count:")
				{
					let query = `UPDATE matches SET squareReplay = '${message.channel.id}/${embed.image.url.split('/')[5]}' WHERE id = '${embed.footer.text.match(/[0-9]+$/)[0]}'`;
					db.query(query, err => { if (err) return exports.sqlError(message, err, query); });
				}
			});
		}
    }
    if (message.content.startsWith("x!"))
    {
		let args = message.content.split(/ +/);
		let arg = args.shift().replace("x!", '').toLowerCase();
		let cmd = Object.keys(aliases).filter(alias => aliases[alias].includes(arg))[0] || false;
		let input = args.join(' ');
		if (!cmd)
			return;
		try
		{
			return commands[cmd](arg, args, input, message);
		}
		catch (error)
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
    }
    else
    if (message.author.id == "561578790837289002" || !message.author.bot)
    {
		if (message.author.bot && message.author.id !== "561578790837289002")
			return;

		if (message.channel.type == "dm" && Array.from(message.attachments).length > 0)
		{
			images = Array.from(message.attachments).map(m => m[1].url);
			client.guilds.cache.get("399327996076621825").channels.cache.get("537098266685472788").send(`Images from user <@${message.author.id}>: \n${images.join('\n')}`);
		}
		if (games.games.some((game) => game.channels.hasOwnProperty(message.channel.id) && game.started && game.canHaveTurn))
		{
			let game = games.games.filter((game) => game.channels.hasOwnProperty(message.channel.id))[0];
			if (message.author.id == game.player && {
				"squares": /^([a-j] ?(10|[1-9])|(10|[1-9]) ?[a-j])$/i,
				"othello": /^([a-h][1-8]|[1-8][a-h])$/i,
				"rokumoku": /^([a-s] ?1?[0-9]+|1?[0-9]+ ?[a-s])$/i,
				"connect4": /^[1-7]$/,
				"ttt3d": /^[1-4] ?([1-4] ?[a-d]|[a-d] ?[1-4])$/i,
				"ordo": /^(([a-j][1-8] [a-j][1-8]|[1-8][a-j] [1-8][a-j])|([a-j][1-8]-[a-j][1-8]|[1-8][a-j]-[1-8][a-j]) (up|right|down|left|[urdl]) [1-9])$/i,
				"soccer": /^([0-7]|([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?))$/i
			}[game.game].test(message.content))
			{
				if (message.channel.type !== "dm" && message.channel.guild.members.cache.get(client.user.id).hasPermission("MANAGE_MESSAGES"))
					setTimeout(() => message.delete(), 1000);
				try
				{
					return games[game.game].takeTurn(message.channel.id, message.content);
				}
				catch (error)
				{
					games.games.forEach((game, index) => {
						if (game.channels.hasOwnProperty(message.channel.id))
						{
							for (let channel in game.channels)
								client.channels.cache.get(channel).send("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now!\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough!```");
							delete game;
							return games.games.splice(index, 1);
						}
					});
					let errs = [];
					for (let i = 0; i < error.stack.split('\n').length; i++)
					{
						if (error.stack.split('\n')[i].includes("at Client.emit"))
							break;
						else
							errs.push(error.stack.split('\n')[i]);
					}
					return client.channels.cache.get("467902250128506880").send(botError(message, errs));
				}
			}
			if (["board", "showboard"].includes(message.content))
				return message.channel.send(`It is <@${game.player}>'s turn.`, game.buffer);
		}
		if (games.minigames.some((minigame) => minigame.type == "iq" && minigame.channel == message.channel.id && message.content.toUpperCase() == minigame.ans))
		{
			games.minigames.forEach((minigame, index) => {
				if (minigame.type == "iq" && minigame.channel == message.channel.id && message.content.toUpperCase() == minigame.ans)
				{
					minigame.embeds.win.fields[0].value = minigame.embeds.win.fields[0].value.replace("$WINNER$", `<@!${message.author.id}>`);
					minigame.embeds.win.addField("\u200b", "Completed in `" + (minigame.sTime - minigame.timer) + "` seconds", true);
					message.channel.send(minigame.embeds.win);
					delete games.minigames[index];
					games.minigames.splice(index, 1);
				}
			});
		}
		if (games.minigames.some((minigame) => minigame.type == "hangman" && minigame.channel == message.channel.id && ((/^[a-z0-9]$/i.test(message.content) && !minigame.guesses.includes(message.content.toUpperCase())) || message.content.toUpperCase() == minigame.ans.join('').replace(/[\u0300-\u036f]/g, ''))))
		{
			let guess = message.content.toUpperCase();
			games.minigames.forEach((minigame, index) => {
				if (minigame.type == "hangman" && minigame.channel == message.channel.id)
				{
					let embed = new Discord.MessageEmbed()
						.setTitle("Hangman");
					if (/^[a-z0-9]$/i.test(message.content) && !minigame.guesses.includes(guess))
					{
						minigame.guesses.push(guess);
						if (minigame.ans.some(a => a.replace(/[\u0300-\u036f]/g, '') == message.content.toUpperCase()))
						{
							for (let letter in minigame.ans)
								if (minigame.ans[letter].replace(/[\u0300-\u036f]/g, '') == guess && minigame.right[letter] == '\u200b \u200b \u200b \u200b')
									minigame.right[letter] = minigame.ans[letter];
							if (!minigame.right.includes('\u200b \u200b \u200b \u200b'))
							{
								let display = [];
								for (let i = 0; i < minigame.ans.length; i++)
								{
									if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/.test(minigame.ans[i])) display.push("__" + minigame.ans[i] + "__");
									else display.push(minigame.ans[i]);
								}
								embed.addField(guess + " is in the word!", `<@!${message.author.id}> has finished the word!\n**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\``);
								embed.setColor(new Color(46, 204, 113).toHexa());
								delete games.minigames[index];
								games.minigames.splice(index, 1);
							}
							else
							{
								let display = [];
								for (let i = 0; i < minigame.right.length; i++)
								{
									if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/i.test(minigame.right[i])) display.push("__" + minigame.right[i] + "__");
									else display.push(minigame.right[i]);
								}
								embed.addField(guess + " is in the word!", `**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\`\nWrong guesses${(minigame.tries == 7 ? "" : " left")}: \`${minigame.tries}\``);
								embed.setColor(new Color(52, 152, 219).toHexa());
								minigame.timer = 180;
							}
						}
						else
						{
							minigame.tries--;
							if (minigame.tries == 0)
							{
								let display = [];
								for (let i = 0; i < minigame.ans.length; i++)
								{
									if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/.test(minigame.ans[i])) display.push("__" + minigame.ans[i] + "__");
									else display.push(minigame.ans[i]);
								}
								embed.addField(guess + " is not in the word!", `You guessed incorrectly too many times!\n**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\``);
								embed.setColor(new Color(231, 76, 60).toHexa());
								delete games.minigames[index];
								games.minigames.splice(index, 1);
							}
							else
							{
								let display = [];
								for (let i = 0; i < minigame.right.length; i++)
								{
									if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/.test(minigame.right[i])) display.push("__" + minigame.right[i] + "__");
									else display.push(minigame.right[i]);
								}
								embed.addField(guess + " is not in the word!", `**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\`\nWrong guesses${(minigame.tries == 7 ? "" : " left")}: \`${minigame.tries}\``);
								embed.setColor(new Color(214, 196, 15).toHexa());
								minigame.timer = 180;
							}
						}
					}
					else
					{
						let display = [];
						for (let i = 0; i < minigame.ans.length; i++)
						{
							if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/.test(minigame.ans[i])) display.push("__" + minigame.ans[i] + "__");
							else display.push(minigame.ans[i]);
						}
						embed.addField("Solved!", `<@!${message.author.id}> has solved the word!\n**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\``);
						embed.setColor(new Color(46, 204, 113).toHexa());
						delete games.minigames[index];
						games.minigames.splice(index, 1);
					}
					message.channel.send(embed);
				}
			});
		}
    }
});

exports.client = client;
exports.db = db;
exports.minigames = require("/app/games/minigames.js").minigames;
exports.aliases = aliases;
exports.version = version;
exports.Images = {
	graph: null,
	avatar: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png",
	AIvatar: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/AI.png",
	minesweeper: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/minesweeper.png",
	nekosLife: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/nekos_life.png"
};
Canvas.loadImage("/app/assets/misc/graph.png").then(image => {
	exports.Images.graph = image;
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