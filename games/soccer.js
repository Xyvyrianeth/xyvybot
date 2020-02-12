const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Paper Soccer";
var shortname = "soccer";

exports.newGame = function(channel, player, here) {
	let time = new Date();
	let game = {
		buffer: {},
		canHaveTurn: true,
		channels: {},
		forfeit: false,
		game: shortname,
		here: here,
		highlight: false,
		player: false,
		players: [player],
        replayData: [],
		started: false,
		timeStart: `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
		turn: 0
	};
	game.channels[channel] = [];
	games.push(game);

	game.board = {
		color: [
			[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 2, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 0], [0, 0, 0, 0]],
			[[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]],
			[[2, 0, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
		],
		paths: [
			[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 1, 0], [0, 0, 0, 0]],
			[[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]],
			[[1, 0, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0]],
			[[0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [1, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
		],
		ball: [5, 6]
	};

	game.timer = {
		time: 1800,
		message: `It appears nobody wants to play right now, <@${player}>.`
	}
	exports.say(game.channels, [`<@${player}> is now requesting a new game of ${gamename}!`, game.buffer]);
}

exports.startGame = function(channel1, channel2, player2) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel1))[0];
	if (channel1 !== channel2) game.channels[channel2] = [];
	game.players[1] = player2;
	game.started = true;

	if ((Math.random() * 2 | 0) == 0) game.players.push(game.players.shift());
	game.player = game.players[0];

	game.timer = {
		time: 900,
		message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
	}

	game.buffer = new Discord.Attachment(exports.drawBoard(game, 0, false), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
	exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be Blue, and <@${game.players[1]}> will be Red!`, game.buffer]);
}

exports.newTourney = function(channel, player1, player2) {
	let game = {
		buffer: {},
		channels: {},
		forfeit: false,
		game: shortname,
		highlight: false,
		lastmove: '',
		player: false,
		players: [player1, player2],
		started: false,
		timeStart: new Date(),
		turn: 0
	};
	game.channels[channel] = [];
	games.push(game);

	game.board = {
		color: [
			[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 2, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 0], [0, 0, 0, 0]],
			[[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]],
			[[2, 0, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
		],
		paths: [
			[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 1, 0], [0, 0, 0, 0]],
			[[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]],
			[[1, 0, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0]],
			[[0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [1, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
		],
		ball: [5, 6]
	};

	if ((Math.random() * 2 | 0) == 0) game.players.reverse();
	game.player = game.players[0];

	game.timer = {
		time: 900,
		message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
	}

	game.buffer = new Discord.Attachment(exports.drawBoard(game, 0, false), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
	exports.say(game.channels, [`A tourney match has been started between <@${game.players[0]}> and <@${game.players[1]}>!\n<@${game.players[0]}> will be Blue, and <@${game.players[1]}> will be Red!`, game.buffer]);
}

exports.drawBoard = function(game, end, highlight) {
	let canvas = new Canvas.createCanvas(311, 235);
	let ctx = canvas.getContext('2d');

	ctx.drawImage(exports.Images.board, 0, 0);

	let lines = new Canvas.createCanvas(311, 235);
	let ltx = lines.getContext('2d');
	for (let y = 0; y <= 10; y++)
		for (let x = 0; x <= 12; x++)
			for (let i = 0; i < 4; i++)
				if (game.board.paths[y][x][i] == 1)
					ltx.drawImage(exports.Images[["blue", "red", "black"][game.board.color[y][x][i] - 1] + "line" + i], x * 25 + 4, (y - 1) * 25 + 3);
	let data = ltx.getImageData(0, 0, 311, 235);
	for (let i = 0; i < data.data.length; i += 4)
	{
		if (data.data[i] != 0 && data.data[i + 2] == 0)
			data.data[i] = 255;
		else
		if (data.data[i + 2] != 0 && data.data[i] == 0)
			data.data[i + 2] = 255;
		else
		if (data.data[i] != 0 && data.data[i + 2] != 0)
			data.data[i] = 150,
			data.data[i + 2] = 150;
		data.data[i + 3] *= 4;
	}
	ltx.putImageData(data, 0, 0);

	ctx.drawImage(lines, 0, 0);
	ctx.drawImage(exports.Images.ball, game.board.ball[1] * 25 + 1, game.board.ball[0] * 25);

	// ....

	let newCanvas = new Canvas.createCanvas(311, 235);
	let newCtx = newCanvas.getContext('2d');
	let data = ctx.getImageData(0, 0, 311, 235);
	newCtx.putImageData(data, 0, 0);
    game.replayData.push(newCtx);

	if (end === 0)
	{
		ctx.drawImage(exports.Images[["blue", "red"][game.turn] + "Text"], 20, 6);
		ctx.drawImage(exports.Images.turn, 76 - (19 * Math.floor(game.turn)), 4);
	}
	else
	{
		ctx.drawImage(exports.Images[["blue", "red"][game.winner] + "Text"], 20, 6);
		ctx.drawImage(exports.Images.win, 81 - (19 * game.turn), 6);
	}

	return canvas.toBuffer();
}

exports.takeTurn = function(channel, Move) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	game.canHaveTurn = false;

	let move;
	let end = 0;
	let goagain = false;
	if (/[0-7]/.test(Move))
	{
		move = Number(Move)
	}
	else
	if (/([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?)/.test(Move))
	{
		move = [	"north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest",
					"n", "ne", "e", "se", "s", "sw", "w", "nw",
					"north", "eastnorth", "east", "eastsouth", "south", "westsouth", "west", "westnorth",
					"n", "en", "e", "es", "s", "ws", "w", "wn",
					"up", "upright", "right", "downright", "down", "downleft", "left", "upleft",
					"u", "ur", "r", "dr", "d", "dl", "l", "ul",
					"up", "rightup", "right", "rightdown", "down", "leftdown", "left", "leftup",
					"u", "ru", "r", "rd", "d", "ld", "l", "lu"].indexOf(Move.replace(/\s{1,}/, '')) % 8
	}
	let highlight = move;
	let tempboard = JSON.parse(JSON.stringify(game.board));

	let Y = tempboard.ball[0];
	let X = tempboard.ball[1];
	let yy = [-1, -1, 0, 1, 1, 1, 0, -1][move];
	let xx = [0, 1, 1, 1, 0, -1, -1, -1][move];

	// Checking for legality
	if (((move < 2 || move == 7) && Y == 1) || (move > 2 && move < 6 && Y == 9) || (move > 4 && X == 1 && ((Y == 4 && move != 5) && (Y == 6 && move != 7) && Y != 5)) || (move < 4 && move > 0 && X == 11 && ((Y == 4 && move != 3) && (Y == 6 && move != 1) && Y != 5)))
	{
		game.canHaveTurn = true;
		return exports.say(channel, ["Illegal Move: You cannot move the ball off of the board."]);
	}
	game.canHaveTurn = true;
	if (((move == 2 || move == 6) && (Y == 1 || Y == 9)) || (((move == 0 && (Y > 6 || Y < 5)) || (move == 4 && (Y > 5 || Y < 4))) && (X == 1 || X == 11)) || (X == 11 && (Y == 4 || Y == 6) && move == 2) || (X == 1 && (Y == 4 || Y == 6) && move == 6))
	{
		game.canHaveTurn = true;
		return exports.say(channel, ["Illegal Move: You cannot move the ball along the edge of the board, you have to bounce off."]);
	}
	if ((move < 4 && tempboard.paths[Y][X][move] != 0) || (move > 3 && tempboard.paths[Y + yy][X + xx][move % 4] != 0))
	{
		game.canHaveTurn = true;
		return exports.say(channel, ["Illegal Move: This move will cross a path that has already been used."]);
	}

	Y += yy;
	X += xx;

	if (tempboard.paths[Y][X].includes(1) || tempboard.paths[Y + 1][X][0] == 1 || tempboard.paths[Y + 1][X - 1][1] == 1 || tempboard.paths[Y][X - 1][2] == 1 || tempboard.paths[Y - 1][X - 1][3] == 1)
	{ // Go again? (Checking this before actually updating the paths so that I don't have to add extra steps to ignore the path that was just created)
		goagain = true;
	}

	if (move > 3)
	{ // Update board
		tempboard.paths[Y][X][move % 4] = 1;
		tempboard.color[Y][X][move % 4] = game.turn + 1;
	}
	else
	{
		tempboard.paths[Y - yy][X - xx][move] = 1;
		tempboard.color[Y - yy][X - xx][move] = game.turn + 1;
	}
	// Update ball position
	tempboard.ball[0] = Y;
	tempboard.ball[1] = X;

	if ((X == 0 || X == 12) && (Y == 4 || Y == 5 || Y == 6))
	{ // Winner winner chicken dinner?
		end = 1;
		game.winner = game.turn;
	}
	else
	if ((Y == 1 && (X == 1 || X == 11)) || (Y == 9 && (X == 1 || X == 11)) || (Y == 1 && tempboard.paths[Y][X][3] == 1 && tempboard.paths[Y + 1][X][0] == 1 && tempboard.paths[Y + 1][X - 1][1] == 1) || (Y == 9 && tempboard.paths[Y][X][0] == 1 && tempboard.paths[Y][X][1] == 1 && tempboard.paths[Y - 1][X - 1][3] == 1) || (X == 1 && (Y == 2 || Y == 3 || Y == 7 || Y == 8) && !JSON.parse(JSON.stringify(tempboard.paths[Y][X])).splice(1, 3).includes(0)) || (X == 11 && (Y == 2 || Y == 3 || Y == 7 || Y == 8) && ![tempboard.paths[Y - 1][X - 1][3], tempboard.paths[Y][X - 1][2], tempboard.paths[Y + 1][X - 1][1]].includes(0)) || (!tempboard.paths[Y][X].concat([tempboard.paths[Y - 1][X - 1][3], tempboard.paths[Y][X - 1][2], tempboard.paths[Y + 1][X - 1][1], tempboard.paths[Y + 1][X][0]]).includes(0)))
	{ // Game ended because ball became immovable?
		end = 2;
		game.winner = [1, 0][game.turn];
	}

	game.board = tempboard;
	// .....

	exports.nextTurn(channel, end, highlight, goagain);
}

exports.nextTurn = function(channel, end, highlight, goagain) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	if (end == 0)
	{
		if (!goagain)
		{
			game.turn = game.turn == 0 ? 1 : 0;
			game.player = game.players[game.turn];
		}
		game.timer = {
			time: 900,
			message: `Whoops, it looks like <@${game.players[game.turn]}> has run out of time, so the game is over!`
		}
	}

	game.buffer = new Discord.Attachment(exports.drawBoard(game, end, highlight), [`soccer_0_${game.players[0]}vs${game.players[1]}.png`, `soccer_1_${game.players[game.winner]}.png`, `soccer_1_${game.players[game.winner]}.png`][end]);
	for (let ch in game.channels)
	{
		if (client.channels.get(ch).guild.members.get(client.user.id).hasPermission("MANAGE_MESSAGES"))
            for (let i = 0; i < game.channels[ch].length; i++)
                client.channels.get(ch).messages.get(game.channels[ch][i]).delete();
		game.channels[ch] = [];
	}

	exports.say(game.channels, [[`It is <@${game.player}>'s turn.`, `<@${game.players[game.winner]}> has won!`, `<@${game.players[game.winner]}> has won because <@${game.player}> got the ball stuck!`][end], game.buffer]);
}

exports.say = function(channels, message) {
    if (typeof channels == "string") {
        client.channels.get(channels).send(message[0], message[1]);
    }
    else
    {
        for (let i in channels)
        {
            client.channels.get(i).send(message[0], message[1]);
        }
    }
}

// Images

exports.Images = {};

Canvas.loadImage("/app/assets/games/soccer/board.png").then(image => {
	exports.Images.board = image;
});
Canvas.loadImage("/app/assets/games/soccer/ball.png").then(image => {
	exports.Images.ball = image;
});
Canvas.loadImage("/app/assets/games/soccer/blackline0.png").then(image => {
	exports.Images.blackline0 = image;
});
Canvas.loadImage("/app/assets/games/soccer/blackline1.png").then(image => {
	exports.Images.blackline1 = image;
});
Canvas.loadImage("/app/assets/games/soccer/blackline2.png").then(image => {
	exports.Images.blackline2 = image;
});
Canvas.loadImage("/app/assets/games/soccer/blackline3.png").then(image => {
	exports.Images.blackline3 = image;
});
Canvas.loadImage("/app/assets/games/soccer/blueline0.png").then(image => {
	exports.Images.blueline0 = image;
});
Canvas.loadImage("/app/assets/games/soccer/blueline1.png").then(image => {
	exports.Images.blueline1 = image;
});
Canvas.loadImage("/app/assets/games/soccer/blueline2.png").then(image => {
	exports.Images.blueline2 = image;
});
Canvas.loadImage("/app/assets/games/soccer/blueline3.png").then(image => {
	exports.Images.blueline3 = image;
});
Canvas.loadImage("/app/assets/games/soccer/redline0.png").then(image => {
	exports.Images.redline0 = image;
});
Canvas.loadImage("/app/assets/games/soccer/redline1.png").then(image => {
	exports.Images.redline1 = image;
});
Canvas.loadImage("/app/assets/games/soccer/redline2.png").then(image => {
	exports.Images.redline2 = image;
});
Canvas.loadImage("/app/assets/games/soccer/redline3.png").then(image => {
	exports.Images.redline3 = image;
});
Canvas.loadImage("/app/assets/games/soccer/blueText.png").then(image => {
	exports.Images.blueText = image;
});
Canvas.loadImage("/app/assets/games/soccer/redText.png").then(image => {
	exports.Images.redText = image;
});
Canvas.loadImage("/app/assets/games/soccer/tie.png").then(image => {
	exports.Images.tie = image;
});
Canvas.loadImage("/app/assets/games/soccer/turn.png").then(image => {
	exports.Images.turn = image;
});
Canvas.loadImage("/app/assets/games/soccer/win.png").then(image => {
	exports.Images.win = image;
});