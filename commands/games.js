const Discord = require("discord.js");
const { db, sqlError } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
exports.command = (cmd, args, input, message) => {
	let gms = {
		"othello": ["othello", "reversi"],
		"squares": ["squares"],
		"rokumoku": ["rokumoku", "connect6", "connectsix", "c6"],
		"ttt3d": ["3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe"],
		"connect4": ["connectfour", "connect4", "cfour", "c4"],
		"ordo": ["ordo"],
		"soccer": ["soccer", "papersoccer", "psoccer"]
	};
	if (!args[0])
	{
		return message.channel.send(
			new Discord.MessageEmbed()
				.setTitle("Available subcommands for x!games")
				.setDescription(
					"x!games `subcommand`\n" +
					"\n" +
					"`leaderboard` - View the players with the 10 highest Elos for every game or the players with the 10 highest combined Elos.\n\"x!games leaderboard `game`\"\nLeave `game` blank for general top 10 players." +
					"`stats` - View either your stats or another player's stats." +
					"`info` - A detailed information about how the Elo system works and the entire ranking system in general." +
					"`games` - A list of all the games that are a part of the ranking system and a few details about them.")
				.setColor(new Color().random())
		);
	}
	else
	if (["leaderboard", "top", "ranking", "ranks", "rank", "ranked"].includes(args[0]))
	{
		let elos = !args[1] ?			 "elo1 + elo2 + elo3 + elo4 + elo5 + elo6 + elo7" :
		gms.othello.includes(args[1]) ?	 "elo1" :
		gms.squares.includes(args[1]) ?	 "elo2" :
		gms.rokumoku.includes(args[1]) ? "elo3" :
		gms.ttt3d.includes(args[1]) ?	 "elo4" :
		gms.connect4.includes(args[1]) ? "elo5" :
		gms.ordo.includes(args[1]) ?	 "elo6" :
		gms.soccer.includes(args[1]) ?   "elo7" : false;
		if (!elos)
			return message.channel.send("Unknown game.");

		let wins = elos.replace(/elo/g, "win"),
			loss = elos.replace(/elo/g, "los"),
			query = (`SELECT\n` +
					 `	id, elos AS elo, wins AS win, loss AS los,\n` +
					 `	((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) AS ci_lower_bound\n` +
					 `FROM profiles WHERE wins + loss > 0 ORDER BY\n` +
					 `	elo DESC, ci_lower_bound DESC, id ASC\n` +
					 `LIMIT 10;\n` +

					 `SELECT\n` +
					 `	id, elos AS elo, wins AS win, loss AS los,\n` +
					 `	((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) AS ci_lower_bound\n` +
					 `FROM profiles WHERE\n` +
					 `	id = '${message.author.id}' AND wins + loss > 0;\n` +

					 `SELECT CAST(COUNT(id) + 1 AS int) AS place FROM profiles WHERE\n` +
					 `	0 < ANY (SELECT wins + loss FROM profiles WHERE id = '${message.author.id}')\n` +
					 `	AND id != '${message.author.id}'\n` +
					 `	AND wins + loss > 0\n` +
					 `	AND (\n` +
					 `		elos > ANY (SELECT elos FROM profiles WHERE id = '${message.author.id}') OR\n` +
					 `		(\n` +
					 `			elos = ANY (SELECT elos FROM profiles WHERE id = '${message.author.id}') AND\n` +
					 `			((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) > ANY\n` +
					 `			(SELECT ((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) FROM profiles WHERE id = '${message.author.id}')\n` +
					 `		)\n` +
					 `	);`).replace(/elos/g, elos).replace(/wins/g, wins).replace(/loss/g, loss);
		return db.query(query, (err, res) => {
			if (err)
				return sqlError(message, err, query);
			if (!res || res.length !== 3)
				return sqlError(message, "No res", query);
			if (res[0].rows.length > 0)
			{
				let top = [];
				for (let i = 0; i < res[0].rows.length; i++)
					top.push(res[0].rows[i]);
				let game;
				if (!args[1])
					game = "All Games"
				else
					game = ["Othello", "Squares", "Rokumoku", "3D Tic Tac Toe", "Connect Four", "Ordo", "Paper Soccer"][elos[3] - 1];

				let users = ["__`\u200b RANK \u200b|\u200b Elo \u200b|\u200b \u200b W/L \u200b \u200b|WINRATE| USER`__"];
				for (let i = 0; i < top.length; i++) {
					if (i == 0)
						top[i].place = i + 1;
					else
					if (top[i].elo == top[i - 1].elo && top[i].ci_lower_bound == top[i - 1].ci_lower_bound)
						top[i].place = top[i - 1].place;
					else
						top[i].place = i + 1;

					let place = top[i].place,
						id = top[i].id,
						elo = top[i].elo,
						win = top[i].win,
						los = top[i].los,
						w_l = win + los > 0 ? (win / (win + los) * 100).toFixed(2) + '%' : "\u200b \u200b N/A \u200b \u200b";

						users.push(`\`${"\u200b ".repeat(5 - String(place).length)}${place})|${"\u200b ".repeat(5 - String(elo).length)}${elo}|${"\u200b ".repeat(3 - String(win).length)}${win}/${los}${"\u200b ".repeat(3 - String(los).length)}|${'\u200b '.repeat(w_l !== "\u200b \u200b N/A \u200b \u200b" ? 7 - w_l.length : 0)}${w_l}|\`<@${id}>`);
				}
				if (res[1].rows.length != 0)
				{
					users.push('');
					users.push("Your rank:")
					let user = res[1].rows[0],
						place = res[2].rows[0].place,
						id = user.id,
						elo = user.elo,
						win = user.win,
						los = user.los,
						w_l = win + los > 0 ? (win / (win + los) * 100).toFixed(2) + '%' : "\u200b \u200b N/A \u200b \u200b";

					users.push(`\`${"\u200b ".repeat(5 - String(place).length)}${place})|${"\u200b ".repeat(5 - String(elo).length)}${elo}|${"\u200b ".repeat(3 - String(win).length)}${win}/${los}${"\u200b ".repeat(3 - String(los).length)}|${"\u200b ".repeat(w_l !== "\u200b \u200b N/A \u200b \u200b" ? 7 - w_l.length : 0)}${w_l}|\`<@${id}>`);
				}
				return message.channel.send(
					new Discord.MessageEmbed()
						.setTitle("Leaderboard for " + game)
						.setDescription(users.join('\n'))
						.setColor(new Color().random())
				);
			}
			else
			{
				if (!args[1])
					return message.channel.send("There are no scores. Nobody has played any game, yet.");
				else
					return message.channel.send("There are no scores for this game. Nobody has played it, yet.");
			}
		});
	}
	else
	if (["info", "about"].includes(args[0]))
	{
		return message.channel.send(
			new Discord.MessageEmbed()
				.setTitle("Information")
				.setDescription("I, Xyvyrianeth (I'm speaking through this bot), am a big fan of [abstract strategy games](https://en.wikipedia.org/wiki/Abstract_strategy_game). I like them so much I tried to create my own competetive social network in Discord that revolves around a select few of these types of games. Whether or not that dream will come true is yet to be seen, but I still have hope and am still pushing towards that goal.")
				.addField("\u200b", "Like every network of competition, there needs to be a way to evaluate who's better than who. Most PvP games, like League of Legends, have a score called attached to each player called Elo. Elo is most likely a number of some sort, and the method in which players can gain or lose Elo differs for each game. In some games, you gain Elo exclusively by winning and lose it exclusively from losing. In other games, Elo gained or lossed is based on the player's personal evaluation in a given match, and winning or losing only somewhat or doesn't affect it.")
				.addField("\u200b", "For my bot, I used a system I heard from a friend (I don't know if he made it up or heard it from somewhere else or not, but credit goes to you, ZXeta). Basically, everyone starts out with an Elo of 1000. After a game ends, the loser loses 10% of their Elo (rounded up) and it goes to the winner.\nIf the loser of a game had 1000 Elo, they lose 100, which goes to the winner.\nIf the loser had 1500 Elo, they lose 150.\nIf 5 Elo, they lose 1 (10% of 5 rounded up is 1. You stop losing Elo from losing when you have no Elo left to lose).\nWith this system, you better benefit winning against people who are supposedly better than you are. You don't gain much from beating people who aren't very good, and that applies to both Elo and your own skill of the game you suck at because you only play against other people who suck, so git gud.")
				.addField("\u200b", "Elos can be sorted either by game or totally, which is average Elo for all games (some people might only care about Othello). Everyone has their own Elo, but those numbers can sometimes end up being the same for multiple users, so instead of sorting by alphabetical order next, we'll use the [Lower bound of Wilson score confidence interval for a Bernoulli parameter](https://www.evanmiller.org/how-not-to-sort-by-average-rating.html): A user with 500 wins and 500 losses will score above someone with 5 wins and 1 loss, and the user with 5 wins and 1 loss will score above someone with 500 wins and 1000 losses. It's the perfect balance between net positive results (`wins - losses`) and average results (`wins / (wins + losses)`).\nIf two users have the same Elo *and* the same number of wins and losses, *then* we'll sort them by ID, I guess.")
				.addField("\u200b", "For now, these scores and such won't mean anything other than a way to sort out the best. Until I think enough people are playing games on my bot, I won't be forming any sort of tournaments, and Elos will never be reset. Get more people using this bot and I might change that.")
				.setColor(new Color().random())
		);
	}
	else
	if (["games"].includes(args[0]))
	{
		return message.channel.send(
			new Discord.MessageEmbed()
				.setDescription("I currently have 7 games, and plan to add more.\n\n**Games**: Othello, Squares, Rokumoku, 3D Tic-Tac-Toe, Connect Four, Ordo, Paper Soccer\n**Planned**: Rokumoku\n\nI chose these games ~~mostly because they're very simple games with very simple rules and mechanics and they're easy to calculate who won and who lost and~~ because they're easy for people to learn, easy for people to get into, easy for people to get good at. I'm never going to add Chess or Go ~~because they're both complicated in terms of mechanics and win/lose/end-game criteria and~~ because they're not easy to learn, not easy to play, not easy to become skilled at. Plus, they take ***foreverrrrrr*** to play.\n\nBefore I decide the bot is \"complete,\" I want at least 10 games. However, deciding what games I want to add to the bot is not gonna be easy, so toss me some suggestions using x!request (make sure it's an [abstract strategy game](https://en.wikipedia.org/wiki/Abstract_strategy_game) before you suggest it my way).")
				.setColor(new Color().random()));
	}
	else
	if (["history", "recent"].includes(args[0]))
	{
		let player, game, id;
		let has = {
			player: false,
			game: false,
			id: false,
			unknown: []
		};
		args.shift();
		if (args.length == 0)
			player = message.author.id;
		else
			args.forEach(arg => {
				if (Object.keys(gms).some(gm => gms[gm].includes(arg)))
					Object.keys(gms).forEach(gm => {
						if (gms[gm].includes(arg))
							game = Object.keys, has.game = true;
					});
				else
				if (/^<@!?[0-9]+>$/.test(arg) && client.users.cache.get(arg.match(/[0-9]+/)[0]) != undefined)
					player = arg.match(/[0-9]+/)[0], has.player = true;
				else
				if (/^[0-9]+$/.test(arg))
					id = arg, has.id = true;
				else
					has.unknown.push(arg);
			});
		if (has.unknown.length > 0)
			return message.channel.send("Unknown arguments: `" + has.unknown.join("`, `") + '`');

		let query = `SELECT * FROM matches\n` +
					`WHERE\n` +
					`	${has.id ? `id = '${id}'` : `'${player}' = ANY (players)${has.game ? ` AND game = '${game}'` : ''}`}\n` +
					`ORDER BY timeStart DESC\n` +
					`LIMIT 10`;

		db.query(query, (err, res) => {
			if (err)
				return sqlError(message, err, query);
			let embed = new Discord.MessageEmbed()
				.setColor(new Color().random())
				.setTitle("Game History");
			if (res.rows.length == 0)
			{
				if (has.id)
					embed.setDescription(`A game with the ID, \`${id}\`, does not exist.`);
				else
				if (has.player)
					embed.setDescription(`<@${player}> does not have a Game History.`);
				else
					embed.setDescription(`<@${player}>, you do not have a Game History.`);

			}
			else
			if (has.id)
			{
				let match = res.rows[0];
				embed.setDescription(`__**PLAYERS**__\n<@${match.players[0]}> and <@${match.players[1]}>\n\n`);
				embed.addField("\u200b", "__**GAME**__\n" + {"othello": "Othello", "squares": "Squares", "rokumoku": "Rokumoku", "ttt3d": "3D Tic Tac Toe", "connect4": "Connect Four", "ordo": "Ordo", "soccer": "Paper Soccer"}[match.game]);
				embed.addField("\u200b", `__**WINNER**__\n<@${match.winner}>`);
				if (match.game == "squares")
					embed.addField("\u200b", `[REPLAY GIF](https://cdn.discordapp.com/attachments/${match.location}/replay_${match.id}.gif)\n[FINAL SCORE COUNT](https://cdn.discordapp.com/attachments/${match.squaresreplay}/counter_${match.id}.gif)`);
				else
					embed.addField("\u200b", `[REPLAY GIF](https://cdn.discordapp.com/attachments/${match.location}/replay_${match.id}.gif)`);
				let time = new Date(match.timestart);
				embed.setFooter(`TIME: ${(time.getMonth() < 9 ? '0' : '') + (time.getMonth() + 1)}/${time.getDate()}/${time.getFullYear().toString().substring(2)} ${(time.getHours() < 10 ? '0': 0) + time.getHours()}:${(time.getMinutes() < 10 ? '0': 0) + time.getMinutes()}`);
			}
			else
			{
				let matches = [];
				gameNameLength = 0;
				res.rows.forEach(match => {
					gameName = {"othello": "Othello", "squares": "Squares", "rokumoku": "Rokumoku", "ttt3d": "3D Tic Tac Toe", "connect4": "Connect Four", "ordo": "Ordo", "soccer": "Paper Soccer"}[match.game];
					status = player == match.winner ? "Winner": "Loser ";
					let time = new Date(match.timestart);
					time = `${(time.getMonth() < 9 ? '0' : '') + (time.getMonth() + 1)}/${time.getDate()}/${time.getFullYear().toString().substring(2)} ${(time.getHours() < 10 ? '0': 0) + time.getHours()}:${(time.getMinutes() < 10 ? '0': 0) + time.getMinutes()}`;
					location = match.location;
					id = match.id;
					opponent = match.players[0] == player ? match.players[1] : match.players[0];
					matches.push([gameName, status, time, location, id, opponent, match.squarereplay]);
					if (gameName.length > gameNameLength)
						gameNameLength = gameName.length;
				});
				let hasSquares = matches.some(match => match[0] == "Squares");
				let history = [`__\`GAME${' '.repeat(gameNameLength - 4)}|STATUS|TIME          |\`\u200b${hasSquares ? "`REPLAY`\u200b` \u200b `\u200b`GIFS`" : "`REPLAY GIF`"}\u200b\`| OPPONENT\`__`];
				matches.forEach(match => {
					text =
						hasSquares ?
							match[0] == "Squares" ?
								`[\`REPLAY\`](https://cdn.discordapp.com/attachments/${match[3]}/replay_${match[4]}.gif)\`|\`[\`SCORE\`](https://cdn.discordapp.com/attachments/${match[6]}/counter_${match[4]}.gif)` :
								`\u200b\` \`[\`OPEN \u200b LINK\`](https://cdn.discordapp.com/attachments/${match[3]}/replay_${match[4]}.gif)\` \`\u200b` :
								`[\`OPEN \u200b LINK\`](https://cdn.discordapp.com/attachments/${match[3]}/replay_${match[4]}.gif)`
					history.push(`\`${match[0] + ' '.repeat(gameNameLength - match[0].length)}|${match[1]}|${match[2]}|\`${text}\`|\`<@${match[5]}>`);
				})
				embed.setDescription(`for user: <@${player}>\n\n` + history.join('\n'));
			}
			message.channel.send(embed);
		});
	}
}