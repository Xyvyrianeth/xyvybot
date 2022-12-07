import { client, db, newUser } from "../index.js";
import { Color } from "../assets/misc/color.js";
import { Games } from "./games.js";
// import gifEncoder from "../assets/misc/canvasGifEncoder.js";
// import fs from "fs";
export const Rules = {
	connect4: (await import("./rules/connect4.js")).newGame,
	latrones: (await import("./rules/latrones.js")).newGame,
	loa: (await import("./rules/loa.js")).newGame,
	ordo: (await import("./rules/ordo.js")).newGame,
	othello: (await import("./rules/othello.js")).newGame,
	rokumoku: (await import("./rules/rokumoku.js")).newGame,
	soccer: (await import("./rules/soccer.js")).newGame,
	spiderlinetris: (await import("./rules/spiderlinetris.js")).newGame,
	squares: (await import("./rules/squares.js")).newGame,
	ttt3d: (await import("./rules/ttt3d.js")).newGame,
	drawBoard: (await import("./drawBoard.js")).drawBoard,
	newGame: async (game, channel, guild, player, local, AI, interactionId) => {
		const Game = Rules[game]();
		Games.set(interactionId, Game);

		Game.id = interactionId
		Game.game = game;
		Game.players = [player]
		Game.channels = [channel];
		Game.guilds = [guild];
		Game.messages = [[]];
		Game.local = local;
		Game.name = {	"othello": "Othello", "squares": "Squares", "rokumoku": "Rokumoku", "ttt3d": "3D Tic-Tac-Toe",
						"connect4": "Connect Four", "ordo": "Ordo", "soccer": "Paper Soccer", "loa": "Lines of Action",
						"latrones": "Latrones", "spiderlinetris": "Spider Linetris" }[game];
		Game.timer = 900;

		if (AI)
		{
			Game.AI = true;
			Game.myTurn = (await import("./ai/" + game + ".js")).myTurn;
			Game.priorities = (await import("./ai/priorities.js")).priorities(Game.game);

			await Rules.startGame(Game.id, channel, guild, client.user.id);
		}
	},
	startGame: async (id, channel2, guild, player2) => {
		const Game = Games.get(id);
		const swap = ["push", "unshift"].random();

		Game.channels[swap](channel2);
		Game.guilds[swap](guild);
		Game.messages[swap]([]);
		Game.players[swap](player2)
		Game.player = Game.players[0];
		Game.started = true;
		Game.timer = 600;
		Game.end = 0;
		Game.replay = [];
		Game.turn = ["squares", "rokumoku"].includes(Game.game) ? 0.5 : 0;

		delete Game.local;

		const display = await Rules.drawBoard(Game);
		const imageName = `${Game.game}_0_${Game.id}.png`;
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png", name: "author.png" };
		const attachment = { attachment: display, name: imageName };
		const embed = {
			author: {
				name: `${Game.name} | x!${Game.game} | [Rules]`,
				icon_url: "attachment://author.png",
				url: "https://github.com/Xyvyrianeth/xyvybot_assets/wiki/" + Game.game },
			description: `The game has started!\n<@${Game.players[0]}> VS <@${Game.players[1]}>\n<@${Game.player}> goes first!`,
			image: { url: "attachment://" + imageName },
			color: new Color(Game.turnColors[Game.turn | 0]).toInt() };
		const actionRow = {
			type: 1,
			components: [
			{	type: 2, style: 5, // Link Button
				label: "Rules/How to Play",
				url: `https://github.com/Xyvyrianeth/xyvybot_assets/wiki/${Game.game}` } ] };

		if (Game.channels[0] == Game.channels[1])
		{
			const Channel = client.channels.cache.get(Game.channels[0]);
			await Channel.send({ embeds: [embed], files: [author, attachment], components: [actionRow] });
		}
		else
		{
			for (const channel of Game.channels)
			{
				const Channel = client.channels.cache.get(channel);
				await Channel.send({ embeds: [embed], files: [author, attachment], components: [actionRow] });
			}
		}

		Game.canHaveTurn = true;

		if (Game.AI && Game.player == client.user.id)
		{
			setTimeout(() => Rules.takeTurn(id, Game.myTurn()), 2500);
		}
	},
	takeTurn: async (id, message) => {
		const Game = Games.get(id);
		Game.canHaveTurn = false;

		const move = message.content;
		const error = Game.takeTurn(move);

		if (error)
		{
			await message.reply({ content: "**__Illegal Play__**\n" + error });
			return Game.canHaveTurn = true;
		}

		for (let i in Game.messages)
		{
			if (Game.messages[i].length > 0)
			{
				const Channel = client.channels.cache.get(Game.channels[i]);
				if (!Channel.permissionsFor(client.user.id).has(1n << 13n))
				{
					continue;
				}

				for (const messageId of Game.messages[index])
				{
					await Channel.messages.cache.get(messageId).delete();
				}
				Game.channels[index] = [];
			}
		}

		const display = await Rules.drawBoard(Game);
		const imageName = `${Game.game}_${Game.end}_${Game.id}.png`;
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png", name: "author.png" };
		const attachment = { attachment: display, name: imageName };
		const embed = {
			author: {
				name: `${Game.name} | x!${Game.game} | [Rules]`,
				icon_url: "attachment://author.png",
				url: "https://github.com/Xyvyrianeth/xyvybot_assets/wiki/" + Game.game },
			description: `<@${Game.players[0]}> VS <@${Game.players[1]}>\n\n${Game.endMessage()}`,
			image: { url: "attachment://" + imageName },
			color: new Color(Game.turnColors[Game.turn | 0]).toInt() };

		if (Game.channels[0] == Game.channels[1])
		{
			await client.channels.cache.get(Game.channels[0]).send({ embeds: [embed], files: [author, attachment] });
		}
		else
		{
			for (const channel of Game.channels)
			{
				await client.channels.cache.get(channel).send({ embeds: [embed], files: [author, attachment] });
			}
		}

		if (Game.end == 0)
		{
			if (Game.AI && Game.player == client.user.id)
			{
				setTimeout(() => Rules.takeTurn(id, Game.myTurn()), 2500);
			}
			else
			{
				Game.timer = 600;
				Game.canHaveTurn = true;
			}
		}
		else
		{
			await Rules.endGame(Game.id);
		}
	},
	endGame: async (id) => {
		const Game = Games.get(id);

		if (Game.players.includes(client.user.id))
		{
			const result = {
				player: Game.players[[1, 0][Game.players.indexOf(client.user.id)]],
				winner: Game.winner,
				game: ["othello", "squares", "rokumoku", "ttt3d", "connect4", "ordo", "soccer", "loa", "latrones", "spiderlinetris"].indexOf(Game.game) };
			const selectQuery =
				`SELECT *\n` +
				`FROM profiles\n` +
				`WHERE id = '${result.player}';`;

			const { rows } = await db.query(selectQuery);
			const user = rows[0] || await newUser(result.player);

			if (result.player == result.winner)
			{
				user.wins[result.game]++;
				Game.booty = user.elos[result.game] < 1000 ? 100 : user.elos[result.game] > 10000 ? 10 : Math.floor((1000 / user.elos[result.game]) * 100);
				user.elos[result.game] += Game.booty;
			}
			else
			if (result.winner == client.user.id)
			{
				user.loss[result.game]++;
				Game.booty = 0;
			}
			else
			{
				user.ties[result.game]++;
				Game.booty = 0;
			}
			user.money += 1000;

			const updateQuery =
				`UPDATE profiles\n` +
				`SET\n` +
				`	wins[${result.game + 1}] = ${user.wins[result.game]},\n` +
				`	loss[${result.game + 1}] = ${user.loss[result.game]},\n` +
				`	ties[${result.game + 1}] = ${user.ties[result.game]},\n` +
				`	elos[${result.game + 1}] = ${user.elos[result.game]},\n` +
				`	money = ${user.money}\n` +
				`WHERE id = '${user.id}';`;

			await db.query(updateQuery);
		}
		else
		if (Game.end == 1)
		{
			const result = {
				winner: Game.players[Game.winner],
				loser: Game.players[[1, 0][Game.winner]],
				game: ["othello", "squares", "rokumoku", "ttt3d", "connect4", "ordo", "soccer", "loa", "latrones", "spiderlinetris"].indexOf(Game.game) };
			const selectQuery =
				`SELECT *\n` +
				`FROM profiles\n` +
				`WHERE id = '${result.winner}' OR id = '${result.loser}';`;

			const { rows } = await db.query(selectQuery);
			const winner = rows.find(row => row.id == result.winner) || await newUser(result.winner);
			const loser = rows.find(row => row.id == result.loser) || await newUser(result.loser);

			if (loser.elos[result.game] > winner.elos[result.game])
			{
				loser.money += 25;
				winner.money += 100;
			}
			if (loser.elos[result.game] == winner.elos[result.game])
			{
				loser.money += 50;
				winner.money += 75;
			}
			if (loser.elos[result.game] < winner.elos[result.game])
			{
				loser.money += 75;
				winner.money += 50;
			}
			Game.booty = Math.ceil(loser.elos[result.game] / 10);

			const updateQuery =
				`UPDATE profiles\n` +
				`SET\n` +
				`	elos[${result.game + 1}] = ${winner.elos[result.game] + Game.booty},\n` +
				`	wins[${result.game + 1}] = ${winner.wins[result.game] + 1},\n` +
				`	money = ${winner.money}\n` +
				`WHERE id = '${winner.id}';\n\n` +
				`UPDATE profiles\n` +
				`SET\n` +
				`	elos[${result.game + 1}] = ${loser.elos[result.game] - Game.booty},\n` +
				`	loss[${result.game + 1}] = ${loser.loss[result.game] + 1},\n` +
				`	money = ${loser.money}\n` +
				`WHERE id = '${loser.id}';`;

			await db.query(updateQuery);
		}
		else
		{
			const result = {
				players: Game.players,
				game: ["othello", "squares", "rokumoku", "ttt3d", "connect4", "ordo", "soccer", "loa", "latrones", "spiderlinetris"].indexOf(Game.game) };
			const selectQuery =
				`SELECT *\n` +
				`FROM profiles\n` +
				`WHERE id = '${result.players[0]}' OR id = '${result.players[1]}';`;

			const { rows } = await db.query(selectQuery);
			const player1 = rows.find(row => row.id == result.players[0]) || await newUser(result.players[0]);
			const player2 = rows.find(row => row.id == result.players[1]) || await newUser(result.players[1]);

			player1.money += 50;
			player2.money += 50;
			Game.booty = 0;

			const updateQuery =
				`UPDATE profiles\n` +
				`SET\n` +
				`	ties[${result.game + 1}] = ${player1.ties[result.game] + 1}`
				`	money = ${player1.money}\n` +
				`WHERE id = '${player1.id}';\n` +
				`\n` +
				`UPDATE profiles\n` +
				`SET\n` +
				`	ties[${result.game + 1}] = ${player2.ties[result.game] + 1}`
				`	money = ${player2.money}\n` +
				`WHERE id = '${player2.id}';`;

			await db.query(updateQuery);
		}

		const recordQuery =
			`INSERT INTO matches (id, game, players, winner, booty, replay)\n` +
			`VALUES ('${Game.id}', '${Game.game}', ARRAY['${Game.players[0]}', '${Game.players[1]}'], '${Game.players[Game.winner]}', ${Game.booty}, ARRAY${JSON.stringify(Game.replay).replace(/"/g, "'")});`;
		await db.query(recordQuery);

		Games.delete(Game.id);
	}
};