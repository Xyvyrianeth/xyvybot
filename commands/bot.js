const Discord = require("discord.js"),
	  gifEncoder = require("canvas-gif-encoder"),
	  fs = require("fs"),
	{ db, client } = require("/app/Xyvy.js");
var { games } = require("/app/Xyvy.js"),
	titles = require("/app/assets/profile/titles.json");
exports.command = (message) => {
	if (message.attachments.array().length != 0)
	{
		let img = message.attachments.array()[0].name;
		if (/^(connect4|squares|othello|rokumoku|ttt3d|ordo|soccer)_(0_[0-9]+vs[0-9]+|1_[0-9]+|2_tie)\.png$/.test(img))
		{
			game = games.games.filter(game => game.channels.hasOwnProperty(message.channel.id))[0];
			end = img.match(/_[0-2]_/)[0].substring(1, 2);
			game.canHaveTurn = true;
			if (end === '0')
				return game.channels[message.channel.id].push(message.id);
			let result = false,
				Game = img.match(/^(connect4|squares|othello|rokumoku|ttt3d|ordo|soccer)/g)[0],
				query = `INSERT INTO matches (id, game, location, players, winner, timestart, squarereplay)\n` +
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
						"soccer": [311, 235]	}[Game],
					stream1 = fs.createWriteStream("replay_" + message.id + ".gif"),
					encoder1 = new gifEncoder(dimensions[0], dimensions[1]);

				encoder1.createReadStream().pipe(stream1);
				encoder1.begin();
				encoder1.addFrame(game.replayData[0], 2500);
				for (let f = 1; f <  game.replayData.length - 1; f++)
					encoder1.addFrame(game.replayData[f], 500);
					encoder1.addFrame(game.replayData[game.replayData.length - 1], 5000)
					encoder1.end();
				setTimeout(() => {
					let attachment1 = new Discord.MessageAttachment(`replay_${message.id}.gif`, `replay_${message.id}.gif`),
						embed1 = new Discord.MessageEmbed()
							.setTitle("Replay GIF:")
							.attachFiles(attachment1)
							.setImage(`attachment://replay_${message.id}.gif`)
							.setFooter("Match ID: " + message.id)
							.setDescription(`<@${game.players[0]}> VS <@${game.players[1]}>\nWinner: ` + (game.winner == undefined ? "No one" : "<@" + game.players[game.winner] + ">"));
					message.channel.send(embed1);
				}, 5000);
				if (Game == "squares")
				{
					let stream2 = fs.createWriteStream("counter_" + message.id + ".gif"),
						encoder2 = new gifEncoder(280, 300);

					encoder2.createReadStream().pipe(stream2);
					encoder2.begin();
					encoder2.addFrame(game.squareCounterData[0], 2500);
					for (let f = 1; f <  game.squareCounterData.length - 1; f++)
						encoder2.addFrame(game.squareCounterData[f], 350);
						encoder2.addFrame(game.squareCounterData[game.squareCounterData.length - 1], 2500)
						encoder2.end();
					setTimeout(() => {
						let attachment2 = new Discord.MessageAttachment(`counter_${message.id}.gif`, `counter_${message.id}.gif`),
							embed2 = new Discord.MessageEmbed()
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
					game: JSON.stringify(["othello", "squares", "rokumoku", "ttt3d", "connect4", "ordo", "soccer"].indexOf(game.game) + 1)
				};
				if (result.game == 1 || result.game == 2)
					result.score = game.winner == 0 ? game.score : game.score.reverse();
				if (result.game == 4 || result.game == 5)
					result.turns = game.turns;
				if (result.game == 7)
					result.highest = game.winner == 0 ? game.highest : game.highest.reverse();
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
					let wp, lp;

					if (res.rows.length == 0)
						wp = newUser(result.winner, message),
						lp = newUser(result.loser, message);
					else
					if (res.rows.length == 2)
						wp = res.rows.find(x => x.id == result.winner),
						lp = res.rows.find(x => x.id == result.loser);
					else
					if (res.rows[0].id == result.winner)
						lp = newUser(result.loser, message),
						wp = res.rows[0];
					else
					if (res.rows[0].id == result.loser)
						lp = res.rows[0],
						wp = newUser(result.winner, message);

					if (lp["elo" + result.game] > wp["elo" + result.game])
						lp.money += 25,
						wp.money += 100;
					if (lp["elo" + result.game] == wp["elo" + result.game])
						lp.money += 50,
						wp.money += 75;
					if (lp["elo" + result.game] < wp["elo" + result.game])
						lp.money += 75,
						wp.money += 50;

					// Titles
					let wt = [];
					let lt = [];
					// General
					for (let i = 0; i < 8; i++)
						if (wp.elo1 + wp.elo2 + wp.elo3 + wp.elo4 + wp.elo5 + wp.elo6 + wp.elo7 >= [15E3, 2E4, 25E3, 3E4, 4E4, 5E4, 75E3, 1E5][i] && !wp.titles.includes(["15k_elo", "20k_elo", "25k_elo", "30k_elo", "40k_elo", "50k_elo", "75k_elo", "100kelo"][i]))
							wt.push(["15k_elo", "20k_elo", "25k_elo", "30k_elo", "40k_elo", "50k_elo", "75k_elo", "100kelo"][i]);
					for (let i = 0; i < 8; i++)
						if (wp.win1 + wp.win2 + wp.win3 + wp.win4 + wp.win5 + wp.win6 + wp.win7 + wp.los1 + wp.los2 + wp.los3 + wp.los4 + wp.los5 + wp.los6 + wp.los7 >= [50, 75, 100, 200, 300, 400, 500, 1E3] && !wp.titles.includes(["50_game", "75_game", "100game", "200game", "300game", "400game", "500game", "1k_game"][i]))
							wt.push(["50_game", "75_game", "100game", "200game", "300game", "400game", "500game", "1k_game"][i]);
					for (let i = 0; i < 8; i++)
						if (lp.elo1 + lp.elo2 + lp.elo3 + lp.elo4 + lp.elo5 + lp.elo6 + lp.elo7 <= [2500, 2E3, 1500, 1E3, 750, 500, 250, 0][i] && !lp.titles.includes(["2500elo", "2000elo", "1500elo", "1000elo", "750_elo", "500_elo", "250_elo", "eloGone"][i]))
							lt.push(["2500elo", "2000elo", "1500elo", "1000elo", "750_elo", "500_elo", "250_elo", "eloGone"][i]);
					for (let i = 0; i < 8; i++)
						if (lp.win1 + lp.win2 + lp.win3 + lp.win4 + lp.win5 + lp.win6 + lp.win7 + lp.los1 + lp.los2 + lp.los3 + lp.los4 + lp.los5 + lp.los6 + lp.los7 >= [50, 75, 100, 200, 300, 400, 500, 1E3] && !lp.titles.includes(["50_game", "75_game", "100game", "200game", "300game", "400game", "500game", "1k_game"][i]))
							wt.push(["50_game", "75_game", "100game", "200game", "300game", "400game", "500game", "1k_game"][i]);
					// Game Specific
					if (wp["elo" + result.game] >= 2000 && !wp.titles.includes(`2elo${result.game}_1`))
					{
						wt.push(`2elo${result.game}_1`);
						if (result.game == 1 || result.game == 2)
							wt.push(`2elo${result.game}_2`);
					}
					if (wp["win" + result.game] + wp["los" + result.game] >= 100)
					{
						wt.push(`100g${result.game}_1`);
						if (relult.game == 1 || result.game == 2)
							wt.push(`100g${result.game}_2`);
					}
					// Othello
					if (result.game == 1 && result.score[1] == 0 && !wp.titles.includes("cap_all"))
						wt.push("cap_all");
					// Squares
					if (result.game == 2 && lp.id == "561578790837289002" && !wp.titles.includes("beatXAI"))
						wt.push("beatXAI");
					// Rokumoku
					// 3D Tic Tac Toe
					if (result.game == 4 && result.turns <= 8)
					{
						if (!wp.titles.includes("winsIn4"))
							wt.push("winsIn4");
						if (!lp.titles.includes("aCasual"))
							lt.push("aCasual");
					}
					// Connect 4
					if (result.game == 5 && lp.id == "238916443402534914" && !wp.titles.includes("beatRDB"))
						wt.push("beatRDB");
					if (result.game == 5 && result.turns <= 8)
					{
						if (!wp.titles.includes("winsIn4"))
							wt.push("winsIn4");
						if (!lp.titles.includes("aCasual"))
							lt.push("aCasual");
					}
					// Ordo
					// Paper Soccer
					if (result.game == 7 && result.highest[0] >= 10 && !wp.titles.includes(""))
						wt.push("10moves");
					if (result.game == 7 && result.highest[1] >= 10 && !lp.titles.includes(""))
						lt.push("10moves");

					let booty = Math.ceil(lp["elo" + result.game] / 10),
						query = `UPDATE profiles\n` +
							`SET\n` +
							`   elo${result.game} = ${wp["elo" + result.game] + booty},\n` +
							`   win${result.game} = ${wp["win" + result.game] + 1},\n` +
							`   money = ${wp.money},\n` +
							`   titles = ARRAY${JSON.stringify(wp.titles.concat(wt)).replace(/"/g, "'")}\n` +
							`WHERE id = '${wp.id}';\n` +
							`\n` +
							`UPDATE profiles\n` +
							`SET\n` +
							`   elo${result.game} = ${lp["elo" + result.game] - booty},\n` +
							`   los${result.game} = ${lp["los" + result.game] + 1},\n` +
							`   money = ${lp.money},\n` +
							`   titles = ARRAY${JSON.stringify(lp.titles.concat(lt)).replace(/"/g, "'")}\n` +
							`WHERE id = '${lp.id}';`
					db.query(query, (err) => {
						if (err)
							return exports.sqlError(message, err, query);
					});
					if (wt.length > 0)
					{
						let text = '';
						for (let i = 0; i < wt.length; i++)
							text += `[${titles[wt[i]]}](${wt[i]})\n`
						client.users.cache.get(wp.id).send(
							`You've just received ${wt.length == 1 ? "this title" : "the following titles"} to use for your \`x!profile\`:\n` +
							"```md\n" +
							text +
							"```\n" +
							"Use the command `x!profile titles` to see all your owned titles.");
					}
					if (lt.length > 0)
					{
						let text = '';
						for (let i = 0; i < lt.length; i++)
							text += `[${titles[lt[i]]}](${lt[i]})\n`
						client.users.cache.get(lp.id).send(
							`You've just received ${wt.length == 1 ? "this title" : "the following titles"} to use for your \`x!profile\`:\n` +
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