const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Paper Soccer";
var shortname = "soccer";
  
exports.newGame = function(channel, player) {
	let game = {
		buffer: {},
		channels: {},
		forfeit: false,
		game: shortname,
		highlight: false,
		lastmove: '',
		over: false,
		player: false,
		players: [player],
		score: [0, 0],
		started: false,
		turn: 0
	};
	game.channels[channel] = [];
	games.push(game);

	game.board = {
		color: [
			[0, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 1, 0], [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 2, 0]], [0, 0, 0, 0],
			[1, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [2, 0, 0, 0],
			[1, 0, 1, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 2, 0]], [2, 0, 0, 0],
			[0, 0, 0, 0], [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[3, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [3, 0, 3, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [0, 0, 0, 0]
		],
		paths: [
			[0, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 1, 0], [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 1, 0]], [0, 0, 0, 0],
			[1, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [1, 0, 0, 0],
			[1, 0, 1, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0]], [1, 0, 0, 0],
			[0, 0, 0, 0], [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[1, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [1, 0, 1, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [0, 0, 0, 0]
		],
		ball: [5, 6]
	};

	game.timer = {
		time: 900,
		message: `It appears nobody wants to play right now, <@${player}>.`
	}
	exports.say(game.channels, [`<@${player}> is now requesting a new game of ${soccer}!`, game.buffer]);
}
  
exports.startGame = function(channel1, channel2, player2) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel1))[0];
	if (channel1 !== channel2) game.channels[channel2] = [];
	game.players[1] = player2;
	game.started = true;
  
	if ((Math.random() * 2 | 0) == 0) game.players.push(game.players.shift()); // Makes player one random instead of always the challenger
	game.player = game.players[0];
  
	game.timer = {
		time: 600,
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
		over: false,
		player: false,
		players: [player],
		score: [0, 0],
		started: false,
		turn: 0
	};
	game.channels[channel] = [];
	games.push(game);

	game.board = {
		color: [
			[0, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 1, 0], [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 2, 0]], [0, 0, 0, 0],
			[1, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [2, 0, 0, 0],
			[1, 0, 1, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 2, 0]], [2, 0, 0, 0],
			[0, 0, 0, 0], [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[3, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [3, 0, 3, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [0, 0, 0, 0]
		],
		paths: [
			[0, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 1, 0], [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 1, 0]], [0, 0, 0, 0],
			[1, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [1, 0, 0, 0],
			[1, 0, 1, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0]], [1, 0, 0, 0],
			[0, 0, 0, 0], [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[1, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [1, 0, 1, 0]], [0, 0, 0, 0],
			[0, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [0, 0, 0, 0]
		],
		ball: [5, 6]
	};
  
    if ((Math.random() * 2 | 0) == 0) game.players.reverse();
    game.player = game.players[0];
  
    game.timer = {
        time: 600,
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }
    
    game.buffer = new Discord.Attachment(exports.drawBoard(game, 0, false), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    exports.say(game.channels, [`A tourney match has been started between <@${game.players[0]}> and <@${game.players[1]}>!\n<@${game.players[0]}> will be Blue, and <@${game.players[1]}> will be Red!`, game.buffer]);
}
  
exports.drawBoard = function(game, end, highlight) {
	let canvas = new Canvas.createCanvas(235, 311);
	let ctx = canvas.getContext('2d');
	ctx.drawImage(exports.Images.board, 0, 0);

    if
    (end === 0)
    {
        ctx.drawImage(exports.Images[["blue", "red"][Math.floor(game.turn)] + "Text"], 20, 6);
        ctx.drawImage(exports.Images.turn, 76 - (19 * Math.floor(game.turn)), 4);
    }
    else
    if
    (end === 1)
    {
        ctx.drawImage(exports.Images[["blue", "red"][game.winner] + "Text"], 20, 6);
        ctx.drawImage(exports.Images.win, 81 - (19 * Math.floor(game.turn)), 6);
    }
    else
    if
    (end === 2)
    {
        ctx.drawImage(exports.Images.tie, 20, 6);
    }

	for (let y = 0; y < 12; y++)
	{
		for (let x = 0; x < 10; x++)
		{
			for (let i = 0; i < 4; i++)
			{
				if (game.board.paths[y][x][i] == 1)
				{
					ctx.drawImage(exports.Images[["blue", "red", "black"][game.board.colors[y][x][i] - 1] + "line" + i], x * 25 + 4, (y - 1) * 25 + 3);
				}
			}
		}
	}
	ctx.drawImage(exports.Images.ball, x * 25 + 1, y * 25);

	// ....

	return canvas.toBuffer();
}
  
exports.takeTurn = function(channel, Move) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	let move;
	let end = 0;
	let goagain = false;
	if (/[0-7]/.test(Move))
	{
		move = Number(Move)
	}
	else
	if (/([ns][ew]?|[ew][ns]?)/.test(Move))
	{
		move = ["n", "ne", "e", "se", "s", "sw", "w", "nw", "n", "en", "e", "es", "s", "ws", "w", "wn"].indexOf(Move) % 8
	}
	let highlight = move;
	let tempboard = JSON.parse(JSON.stringify(games.board));

	let Y = tempboard.ball[0];
	let X = tempboard.ball[1];
	let yy = [0, 0, 0, 0, 1, 1, 0, -1][move];
	let xx = [0, 0, 0, 0, 0, 1, 1, 1][move];

	// Checking for legality
	if (((move < 2 || move == 7) && Y == 1) || (move > 2 && move < 6 && Y == 9) || (move > 4 && X == 1 && ((Y == 4 && move != 5) && (Y == 6 && move != 7) && Y != 5)) || (move < 4 && move > 0 && X == 11 && ((Y == 4 && move != 3) && (Y == 6 && move != 1) && Y != 5)))
	{
		return exports.say(channel, ["Illegal Move: You cannot move the ball off of the board."]);
	}
	if (((move == 2 || move == 6) && (Y == 1 || Y == 9)) || (((move == 0 && Y > 6 && Y < 5) || (move == 4 && Y > 5 && Y < 4)) && (X == 1 || X == 11)))
	{
		return exports.say(channel, ["Illegal Move: You cannot move the ball along the edge of the field, you have to bounce off."]);
	}
	if ((move < 4 && tempboard.paths[Y][X][move] != 0) || (move > 3 && tempboard.paths[Y + yy][X - xx][move % 4] != 0)) 
	{
		return exports.say(channel, ["Illegal Move: This move will cross a path that has already been used."]);
	}

	// Move is legal
	if (move > 3) // Update board
	{
		tempboard.paths[Y + yy][X - xx][move % 4] = 1;
	}
	else
	{
		tempboard.paths[Y][X][move] = 1;
	}
	Y += YY;
	X -= XX;

	if ((X == 0 || X == 12) && (Y == 4 || Y == 5 || Y == 6))
	{ // Winner winner chicken dinner?
		end = 1;
	}
	else
	if ((Y == 1 && (X == 1 || X == 11)) || (Y == 9 && (X == 1 || X == 11)) || (Y == 1 && tempboard.paths[Y][X][3] == 1 && tempboard.paths[Y + 1][X][0] == 1 && tempboard.paths[Y + 1][X - 1][1] == 1) || (Y == 9 && tempboard.paths[Y][X][0] == 1 && tempboard.paths[Y][X][1] == 1 && tempboard.paths[Y - 1][X - 1][3] == 1) || (X == 1 && (Y == 2 || Y == 3 || Y == 7 || Y == 8) && !JSON.parse(JSON.stringify(tempboard.paths[Y][X])).splice(1, 3).includes(0)) || (X == 11 && (Y == 2 || Y == 3 || Y == 7 || Y == 8) && ![tempboard[Y - 1][X - 1][3], tempboard[Y][X - 1][2], tempboard[Y + 1][X - 1][1]].includes(0)) || (!tempboard.paths[Y][X].concat([tempboard[Y - 1][X - 1][3], tempboard[Y][X - 1][2], tempboard[Y + 1][X - 1][1], tempboard[Y + 1][X][0]]).includes(0)))
	{ // Tie game?
		end = 2;
	}
	else
	if (tempboard.paths[Y][X].includes(1) || tempboard.paths[Y - 1][X -1][move % 4] == 1 || tempboard.paths[Y][X - 1][move % 4] == 1 || tempboard.paths[Y + 1][X - 1][move % 4] == 1 || tempboard.paths[Y + 1][X][move % 4] == 1 )
	{ // Go again?
		goagain = true;
	}
	
	if (End)
	{
		break;
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
			time: 600,
			message: `Whoops, it looks like <@${game.players[game.turn]}> has run out of time, so the game is over!`
		}
	}
	else
	{
		game.over = true;
	}

	game.buffer = new Discord.Attachment(exports.drawBoard(game, end, highlight), end == 1 ? `${shortname}_${end}_${game.players[game.winner]}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
	for (let ch in game.channels)
	{
		for (let i = 0; i < game.channels[ch].length; i++)
		{
			client.channels.get(ch).messages.get(game.channels[ch][i]).delete();
		}
		game.channels[ch] = [];
	}

	exports.say(game.channels, [end == 0 ? `It is <@${game.player}>'s turn.` : end == 2 ? "Tie game, everyone loses!" : `<@${game.players[game.score[0] > game.score[1] ? 0 : 1]}> has won!`, game.buffer]);
}

exports.say = function(channels, message) {
	for (let i in channels)
	{
		client.channels.get(i).send(message[0], message[1]);
	}
}

// Images

exports.Images = {};

Canvas.loadImage("/app/assets/games/soccer/board.png").then(image => {
	exports.Images.board = image;
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