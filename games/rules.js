import { Xyvybot, dataBase, gameCount } from "../index.js";
import { Color } from "../assets/misc/color.js";
import { Games } from "./Games.js";
import { deleteMessage, newUser } from "../index/discordFunctions.js";
const BUTTON_STYLE = { BLUE: 1, GREY: 2, GREEN: 3, RED: 4, LINK: 5 };
const COMPONENT_TYPE = { ACTION_ROW: 1, BUTTON: 2, DROP_MENU: 3 };

export const Rules = {
	games: {
		connect4: (await import("./games/connect4.js")).newGame,
		latrones: (await import("./games/latrones.js")).newGame,
		loa: (await import("./games/loa.js")).newGame,
		ordo: (await import("./games/ordo.js")).newGame,
		othello: (await import("./games/othello.js")).newGame,
		rokumoku: (await import("./games/rokumoku.js")).newGame,
		soccer: (await import("./games/soccer.js")).newGame,
		spiderlinetris: (await import("./games/spiderlinetris.js")).newGame,
		squares: (await import("./games/squares.js")).newGame,
		ttt3d: (await import("./games/ttt3d.js")).newGame,
	},
	AI: {
		connect4: (await import("./AI/connect4.js")).myTurn,
		latrones: (await import("./AI/latrones.js")).myTurn,
		loa: (await import("./AI/loa.js")).myTurn,
		ordo: (await import("./AI/ordo.js")).myTurn,
		othello: (await import("./AI/othello.js")).myTurn,
		rokumoku: (await import("./AI/rokumoku.js")).myTurn,
		soccer: (await import("./AI/soccer.js")).myTurn,
		spiderlinetris: (await import("./AI/spiderlinetris.js")).myTurn,
		squares: (await import("./AI/squares.js")).myTurn,
		ttt3d: (await import("./AI/ttt3d.js")).myTurn,
	},
	AIPriorities: (await import("./AIPriorities.js")).priorities,
	drawBoard: (await import("./drawBoard.js")).drawBoard,
	newGame: async (game, channelId, guild, userId, local, AI, interactionId) => {
		const Game = Rules.games[game]();

		Game.id = interactionId
		Game.game = game;
		Game.players = [userId]
		Game.channels = [channelId];
		Game.guilds = [guild];
		Game.messages = [[]];
		Game.highlight = [];
		Game.local = local;
		Game.name = {
			"othello": "Othello", "squares": "Squares", "rokumoku": "Rokumoku", "ttt3d": "3D Tic-Tac-Toe",
			"connect4": "Connect Four", "ordo": "Ordo", "soccer": "Paper Soccer", "loa": "Lines of Action",
			"latrones": "Latrones", "spiderlinetris": "Spider Linetris" }[game];
		Game.timer = 900;

		if (AI)
		{
			Game.AI = true;
			Game.myTurn = Rules.AI[game];
			Game.priorities = Rules.AIPriorities(Game.game);

			await Rules.startGame(Game.id, channelId, guild, Xyvybot.user.id);
		}

		Games.set(interactionId, Game);
	},
	startGame: async (id, channel2, guild, player2) => {
		const Game = Games.get(id);
		const swap = ["push", "unshift"].random();

		if (Game.channels[0] !== channel2)
		{
			Game.channels[swap](channel2);
			Game.guilds[swap](guild);
			Game.messages[swap]([]);
		}
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
				name: `${Game.name} | [Click for Rules]`,
				icon_url: "attachment://author.png",
				url: "https://github.com/Xyvyrianeth/xyvybot_assets/wiki/" + Game.game },
			description: `The game has started!\n<@${Game.players[0]}> VS <@${Game.players[1]}>\n<@${Game.player}> goes first!`,
			image: { url: "attachment://" + imageName },
			color: new Color(Game.turnColors[Game.turn | 0]).toInt() };
		const actionRow = {
			type: COMPONENT_TYPE.ACTION_ROW,
			components: [
			{	type: COMPONENT_TYPE.BUTTON, style: BUTTON_STYLE.LINK,
				label: "Rules/How to Play",
				url: `https://github.com/Xyvyrianeth/xyvybot_assets/wiki/${Game.game}` } ] };

		await Game.channels.forEach(async channelId => {
			const Channel = await Xyvybot.channels.fetch(channelId);
			await Channel.send({ embeds: [embed], files: [author, attachment], components: [actionRow] });
		});

		Game.canHaveTurn = true;

		if (Game.AI && Game.player == Xyvybot.user.id)
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

		Game.messages.forEach(async (messages, index) => {
			const channelId = Game.channels[index];
			const Channel = await Xyvybot.channels.fetch(channelId);
			messages.forEach(async messageId => {
				const Message = Channel.messages.fetch(messageId);
				await deleteMessage(Message);
			});
		});

		const display = await Rules.drawBoard(Game);
		const imageName = `${Game.game}_${Game.end}_${Game.id}.png`;
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png", name: "author.png" };
		const attachment = { attachment: display, name: imageName };
		const embed = {
			author: {
				name: `${Game.name} | [Click for Rules]`,
				icon_url: "attachment://author.png",
				url: "https://github.com/Xyvyrianeth/xyvybot_assets/wiki/" + Game.game },
			description: `<@${Game.players[0]}> VS <@${Game.players[1]}>\n\n${Game.endMessage()}`,
			image: { url: "attachment://" + imageName },
			color: new Color(Game.turnColors[Game.turn | 0]).toInt() };

		Game.channels.forEach(async channelId => {
			const Channel = await Xyvybot.channels.fetch(channelId);
			Channel.send({ embeds: [embed], files: [author, attachment] });
		});

		if (Game.end == 0)
		{
			if (Game.AI && Game.player == Xyvybot.user.id)
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

		if (Game.players.includes(Xyvybot.user.id))
		{
			const result = {
				player: Game.players[[1, 0][Game.players.indexOf(Xyvybot.user.id)]],
				winner: Game.winner,
				game: ["othello", "squares", "rokumoku", "ttt3d", "connect4", "ordo", "soccer", "loa", "latrones", "spiderlinetris"].indexOf(Game.game) };
			const selectQuery =
				`SELECT *\n` +
				`FROM profiles\n` +
				`WHERE id = '${result.player}';`;

			const { rows } = await dataBase.query(selectQuery);
			const user = rows[0] || await newUser(result.player);

			if (result.player == result.winner)
			{
				user.wins[result.game] = Number(user.wins[result.game]) + 1;
				user.win = Math.sum(0, gameCount, user.wins);
				Game.booty = user.elos[result.game] < 1000 ? 100 : user.elos[result.game] >= 2000 ? 10 : 190 - Math.round(user.elos[result.game] / (100 / 9));
				user.elos[result.game] = Number(user.elos[result.game]) + Game.booty;
				user.elo = Math.sum(0, gameCount, user.elos);
			}
			else
			if (result.winner == Xyvybot.user.id)
			{
				user.loss[result.game] = Number(user.loss[result.game]) + 1;
				user.los = Math.sum(0, gameCount, user.loss);
				Game.booty = 10;
				user.elos[result.game] = Number(user.elos[result.game]) - Game.booty;
				user.elo = Math.sum(0, gameCount, user.elos);
			}
			else
			{
				user.ties[result.game] = Number(user.ties[result.game]) + 1;
				user.tie = Math.sum(0, gameCount, user.ties);
				Game.booty = 0;
			}
			user.money += 1000;

			const updateQuery =
				`UPDATE profiles\n` +
				`SET\n` +
				`	wins = ARRAY[${user.wins.join(',')}],\n` +
				`	win = ${user.win},\n` +
				`	loss = ARRAY[${user.loss.join(',')}],\n` +
				`	los = ${user.los},\n` +
				`	ties = ARRAY[${user.ties.join(',')}],\n` +
				`	tie = ${user.tie},\n` +
				`	elos = ARRAY[${user.elos.join(',')}],\n` +
				`	elo = ${user.elo},\n` +
				`	money = ${user.money}\n` +
				`WHERE id = '${user.id}';`;
			await dataBase.query(updateQuery);
		}
		else
		if (Game.end == 1)
		{
			const result = {
				winner: Game.players[Game.winner],
				losser: Game.players[[1, 0][Game.winner]],
				game: ["othello", "squares", "rokumoku", "ttt3d", "connect4", "ordo", "soccer", "loa", "latrones", "spiderlinetris"].indexOf(Game.game) };
			const selectQuery =
				`SELECT *\n` +
				`FROM profiles\n` +
				`WHERE id = '${result.winner}' OR id = '${result.losser}';`;

			const { rows } = await dataBase.query(selectQuery);
			const winner = rows.find(row => row.id == result.winner) || await newUser(result.winner);
			const loser = rows.find(row => row.id == result.losser) || await newUser(result.losser);

			if (loser.elos[result.game] > winner.elos[result.game])
			{
				winner.money = Number(winner.money) + 100;
				loser.money = Number(loser.money) + 25;
			}
			if (loser.elos[result.game] == winner.elos[result.game])
			{
				winner.money = Number(winner.money) + 75;
				loser.money = Number(loser.money) + 50;
			}
			if (loser.elos[result.game] < winner.elos[result.game])
			{
				winner.money = Number(winner.money) + 50;
				loser.money = Number(loser.money) + 75;
			}

			Game.booty = Math.ceil(loser.elos[result.game] / 10);
			winner.elos[result.game] = Number(winner.elos[result.game]) + Game.booty;
			winner.elo = Math.sum(0, gameCount, winner.elos);
			winner.wins[result.game] = Number(winner.wins[result.game]) + 1;
			winner.win = Math.sum(0, gameCount, winner.wins);
			loser.elos[result.game] = Number(loser.elos[result.game]) - Game.booty;
			loser.elo = Math.sum(0, gameCount, loser.elos);
			loser.loss[result.game] = Number(loser.loss[result.game]) + 1;
			loser.los = Math.sum(0, gameCount, loser.loss);

			const updateQuery =
				`UPDATE profiles\n` +
				`SET\n` +
				`	elos = ARRAY[${winner.elos.join(',')}],\n` +
				`	elo = ${winner.elo},\n` +
				`	wins = ARRAY[${winner.wins.join(',')}],\n` +
				`	win = ${winner.win},\n` +
				`	money = ${winner.money}\n` +
				`WHERE id = '${winner.id}';\n\n` +
				`UPDATE profiles\n` +
				`SET\n` +
				`	elos = ARRAY[${loser.elos.join(',')}],\n` +
				`	elo = ${loser.elo},\n` +
				`	loss = ARRAY[${loser.loss.join(',')}],\n` +
				`	los = ${loser.los},\n` +
				`	money = ${loser.money}\n` +
				`WHERE id = '${loser.id}';`;
			await dataBase.query(updateQuery);
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

			const { rows } = await dataBase.query(selectQuery);
			const player1 = rows.find(row => row.id == result.players[0]) || await newUser(result.players[0]);
			const player2 = rows.find(row => row.id == result.players[1]) || await newUser(result.players[1]);
			player1.ties[result.game] = Number(player1.ties[result.game]) + 1;
			player1.tie = Math.sum(0, gameCount, player1.ties);
			player2.ties[result.game] = Number(player2.ties[result.game]) + 1;
			player2.tie = Math.sum(0, gameCount, player2.ties);

			const updateQuery =
				`UPDATE profiles\n` +
				`SET\n` +
				`	ties = ARRAY[${player1.ties.join(',')}],\n` +
				`	tie = ${player1.tie},\n` +
				`	money = ${Number(player1.money) + 50}\n` +
				`WHERE id = '${player1.id}';\n` +
				`\n` +
				`UPDATE profiles\n` +
				`SET\n` +
				`	ties = ARRAY[${player2.ties.join(',')}],\n` +
				`	tie = ${player2.tie},\n` +
				`	money = ${Number(player2.money) + 50}\n` +
				`WHERE id = '${player2.id}';`;
			await dataBase.query(updateQuery);
		}

		const recordQuery =
			`INSERT INTO history (id, game, players, winner, booty, replay)\n` +
			`VALUES ('${Game.id}', '${Game.game}', '{"${Game.players[0]}", "${Game.players[1]}"}', '${Game.players[Game.winner]}', ${Game.booty}, '${Game.replay.join('.')}');`;

		await dataBase.query(recordQuery);
		Games.delete(Game.id);
	}
};