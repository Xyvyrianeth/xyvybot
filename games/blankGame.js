const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "";
var shortname = "";
  
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
        replayData: [],
		score: [0, 0],
		started: false,
		turn: 0
	};
	game.channels[channel] = [];
	games.push(game);

	game.board = [];
  
	game.timer = {
		time: 900,
		message: `It appears nobody wants to play right now, <@${player}>.`
	}

	exports.say(game.channels, [`<@${player}> is now requesting a new game of ${gamename}!`, game.buffer]);
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
	exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be dark, and <@${game.players[1]}> will be light!`, game.buffer]);
}
  
exports.drawBoard = function(game, end, highlight) {
	let canvas = new Canvas.createCanvas(280, 300);
	let ctx = canvas.getContext('2d');
	  
	ctx.drawImage(exports.Images.board, 0, 0);

	// ....

    game.replayData.push(ctx);
	return canvas.toBuffer();
}
  
exports.takeTurn = function(channel, Move) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	let move = []; // [Move.match(/[0-9]{1,2}/)[0] - 1, 'abcdefghij'.indexOf(Move.toLowerCase().match(/[a-j]/)[0])];
	let highlight = move;
	  
	// Function will vary with game
	
	// .....
	  
	exports.nextTurn(channel, end, highlight);
}
  
exports.nextTurn = function(channel, end, highlight) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	if (end == 0)
	{
		game.turn = game.turn == 0 ? 1 : 0;
		game.player = game.players[game.turn];
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

Canvas.loadImage("/app/assets/games/gamename/board.png").then(image => {
	exports.Images.board = image;
});

exports.Images.numbers = new Array(10);
for (let i = 0; i < 10; i++)
{
	Canvas.loadImage(`/app/assets/games/gamename/numbers/${i}.png`).then(image => {
		exports.Images.numbers[i] = image;
	});
}