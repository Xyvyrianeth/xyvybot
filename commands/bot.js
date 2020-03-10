const Discord = require("discord.js"),
	  gifEncoder = require("canvas-gif-encoder"),
	  fs = require("fs");
var { games, db, client } = require("/app/Xyvy.js"),
	titles = require("/app/assets/profile/titles.json");
exports.command = (message) => {
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
				let stream1 = fs.createWriteStream("replay_" + message.id + ".gif");
				let encoder1 = new gifEncoder(dimensions[0], dimensions[1]);
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
					let stream2 = fs.createWriteStream("counter_" + message.id + ".gif");
					let encoder2 = new gifEncoder(dimensions[0], dimensions[1]);
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