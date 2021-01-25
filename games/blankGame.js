const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "";
var shortname = "";

exports.newGame = function(channel, player) {
    let time = new Date();
	let game = {
		buffer: {},
		canHaveTurn: true,
		channels: {},
		forfeit: false,
		game: shortname,
		highlight: false,
		lastmove: '',
		over: false,
		player: false,
		players: [player],
        replayData: [],
		started: false,
		timeStart: `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
		turn: 0
	};
	game.channels[channel] = [];
	games.push(game);

	let _ = false;
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

	game.buffer = new Discord.MessageAttachment(exports.drawBoard(game, 0, false), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
	exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be dark, and <@${game.players[1]}> will be light!`, game.buffer]);
}

exports.drawBoard = function(game, end, highlight) {
	let canvas = new Canvas.createCanvas(221, 246);
	let ctx = canvas.getContext('2d');

	ctx.drawImage(exports.Images.board, 0, 0);

	// Custom

	return canvas.toBuffer();
}

exports.takeTurn = function(channel, Move) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	game.canHaveTurn = false;

	// Custom

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
		game.winner = game.turn;
	}

	game.buffer = new Discord.MessageAttachment(exports.drawBoard(game, end, highlight), end == 1 ? `${shortname}_${end}_${game.players[game.winner]}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
	for (let ch in game.channels)
	{
		if (client.channels.cache.get(ch).guild.members.cache.get(client.user.id).hasPermission("MANAGE_MESSAGES"))
			for (let i = 0; i < game.channels[ch].length; i++)
				client.channels.cache.get(ch).messages.cache.get(game.channels[ch][i]).delete();
		game.channels[ch] = [];
	}

	exports.say(game.channels, [end == 0 ? `It is <@${game.player}>'s turn.` : `<@${game.players[game.winner]}> has won ${["by combining all of their pieces into a single group", "by only having one piece left, which counts as a single group"][end - 1]}!`, game.buffer]);
}

exports.say = function(channels, message) {
    if (typeof channels == "string") {
        client.channels.cache.get(channels).send(message[0], message[1]);
    }
    else
    {
        for (let i in channels)
        {
            client.channels.cache.get(i).send(message[0], message[1]);
        }
    }
}

// Images

exports.Images = {};

Canvas.loadImage(`/app/assets/games/${gamename}/board.png`).then(image => {
	exports.Images.board = image;
});