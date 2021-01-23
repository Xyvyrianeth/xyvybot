const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Rokumoku";
var shortname = "rokumoku";

exports.newGame = function(channel, player, here) {
	let time = new Date();
	let game = {
		buffer: {},
		canHaveTurn: true,
		channels: {},
		forfeit: false,
		game: shortname,
		here: here,
		highlight: [],
		lastDisplays: [],
		oneChannel: here,
		over: false,
		player: false,
		players: [player],
		replayData: [],
		started: false,
		timeStart: `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
		turn: 0.5
	};
	game.channels[channel] = [];
	games.push(game);

	let _ = false;
	game.board = [];
	for (let i = 12; i--;)
	{
		let row = [];
		for (let i = 12; i--;)
		{
			row.push(_);
		}
		game.board.push(row);
	}

	game.timer = {
		time: 1800,
		message: `It appears nobody wants to play right now, <@${player}>.`
	}

	exports.say(game.channels, [`<@${player}> is now requesting a new game of ${gamename}!`, {}]);
}

exports.startGame = function(channel1, channel2, player2) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel1))[0];
	if (channel1 !== channel2)
	{
		game.channels[channel2] = [];
	}
	game.players[1] = player2;
	game.started = true;

	if ((Math.random() * 2 | 0) == 0)
	{
		game.players.reverse();
	}
	game.player = game.players[0];

	game.timer = {
		time: 900,
		message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
	}

	game.buffer = new Discord.MessageAttachment(exports.drawBoard(game, 0), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
	exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be Black, and <@${game.players[1]}> will be White!\nUse the command \"x!${shortname} rules\" if you don't know how to play the game!`, game.buffer]);
}

exports.drawBoard = function(game, end) {
	let canvas = new Canvas.createCanvas(321, 346);
	let ctx = canvas.getContext('2d');

	ctx.drawImage(exports.Images.board, 0, 0);

	console.log(end, game.highlight);

	for (let x = 0; x < 12; x++)
	{
		for (let y = 0; y < 12; y++)
		{
			for (let h = 0; h < game.highlight.length; h++)
			{
				if (game.highlight[h][0] == x && game.highlight[h][1] == y)
				{
					ctx.drawImage(exports.Images[["highlight", "winHighlight"][end]], 17 + (y * 25), 30 + (x * 25));
				}
			}
			if (game.board[x][y] !== false)
			{
				ctx.drawImage(exports.Images[["black", "white"][game.board[x][y]]], 17 + (y * 25), 30 + (x * 25));
			}
		}
	}

	let newCanvas = new Canvas.createCanvas(321, 346);
	let newCtx = newCanvas.getContext('2d');
	let data = ctx.getImageData(0, 0, 321, 346);
	newCtx.putImageData(data, 0, 0);
	game.replayData.push(newCtx);

	switch (end)
	{
		case 0:
			ctx.drawImage(exports.Images[["black", "white"][Math.floor(game.turn)] + "Text"], 20, 6);
			ctx.drawImage(exports.Images.turn, 76, 4);
			break;
		case 1:
			ctx.drawImage(exports.Images[["black", "white"][game.winner] + "Text"], 20, 6);
			ctx.drawImage(exports.Images.win, 81, 6);
			break;
		case 2:
			ctx.drawImage(exports.Images.tie, 20, 6);
			break;
	}

	return canvas.toBuffer();
}

exports.takeTurn = function(channel, Move) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	game.canHaveTurn = false;

	let move = [Move.match(/[0-9]{1,2}/)[0] - 1, 'abcdefghijkl'.indexOf(Move.toLowerCase().match(/[a-z]/)[0])];

	if (game.board[move[0]][move[1]] !== false)
	{
		game.canHaveTurn = true;
		return exports.say(channel, ["Illegal move: this space is not empty."]);
	}
	else
	{
		game.board[move[0]][move[1]] = Math.floor(game.turn);
	}

	let end = 2;
	for (let y = 12; y--;)
	{
		for (let x = 12; x--;)
		{
			if (game.board[y][x] === false)
			{
				end = 0;
				break;
			}
		}
	}

	let a = game.board;
	let b = Math.floor(game.turn);
	let e = [-1, 0, 1, 1];
	let f = [1, 1, 1, 0];
	for (let d = 0; d < 4; d++)
	{
		for (let y = [5, 0, 0, 0][d]; y < [12, 12, 7, 7][d]; y++)
		{
			for (let x = 0; x < [12, 7, 7, 12][d]; x++)
			{
				let g = [],
					h = [];
				for (let i = 0; i < 6; i++)
				{
					g.push(a[y + (e[d] * i)][x + (f[d] * i)]);
					h.push([y + (e[d] * i), x + (f[d] * i)]);
				}
				if (!g.some(c => c !== b))
				{
					game.highlight = h;
					end = 1;
					break;
				}
			}
		}
	}

	switch (end)
	{
		case 0:
			if (game.turn == Math.floor(game.turn))
			{
				game.highlight = [move];
			}
			else
			{
				game.highlight.push(move);
			}
			break;
		case 2:
			game.highlight = [];
			break;
	}

	exports.nextTurn(channel, end);
}

exports.nextTurn = function(channel, end) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	if (end == 0)
	{
		game.turn = game.turn == 1.5 ? 0 : game.turn += 0.5;
		game.player = game.players[Math.floor(game.turn)];
		game.timer = {
			time: 900,
			message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
		}
	}
	else
	if (end == 1)
	{
		game.winner = Math.floor(game.turn);
	}

	game.buffer = new Discord.MessageAttachment(exports.drawBoard(game, end), [`rokumoku_0_${game.players[0]}vs${game.players[1]}.png`, `rokumoku_1_${game.winner}.png`, 'rokumoku_2_tie.png'][end]);
	for (let ch in game.channels)
	{
		if (client.channels.cache.get(ch).guild.members.cache.get(client.user.id).hasPermission("MANAGE_MESSAGES"))
		{
			for (let i = 0; i < game.channels[ch].length; i++)
			{
				client.channels.cache.get(ch).messages.cache.get(game.channels[ch][i]).delete();
			}
		}
		game.channels[ch] = [];
	}

	exports.say(game.channels, [[`It is <@${game.player}>'s turn`, `<@${game.player}> has won!`, `Tie game, everyone loses!`][end], game.buffer]);
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

exports.Images = {};

Canvas.loadImage("/app/assets/games/rokumoku/board.png").then(image => {
	exports.Images.board = image;
});
Canvas.loadImage("/app/assets/games/rokumoku/black.png").then(image => {
	exports.Images.black = image;
});
Canvas.loadImage("/app/assets/games/rokumoku/white.png").then(image => {
	exports.Images.white = image;
});
Canvas.loadImage("/app/assets/games/rokumoku/highlight.png").then(image => {
	exports.Images.highlight = image;
});
Canvas.loadImage("/app/assets/games/rokumoku/winHighlight.png").then(image => {
	exports.Images.winHighlight = image;
});
Canvas.loadImage("/app/assets/games/rokumoku/blackText.png").then(image => {
	exports.Images.blackText = image;
});
Canvas.loadImage("/app/assets/games/rokumoku/whiteText.png").then(image => {
	exports.Images.whiteText = image;
});
Canvas.loadImage("/app/assets/games/rokumoku/turn.png").then(image => {
	exports.Images.turn = image;
});
Canvas.loadImage("/app/assets/games/rokumoku/win.png").then(image => {
	exports.Images.win = image;
});
Canvas.loadImage("/app/assets/games/rokumoku/tie.png").then(image => {
	exports.Images.tie = image;
});