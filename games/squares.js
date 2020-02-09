const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Squares";
var shortname = "squares";

exports.newGame = function(channel, player, here) {
	let game = {
		buffer: {},
		channels: {},
		forfeit: false,
		game: shortname,
		here: here,
		highlight: [[], []],
		over: false,
		player: false,
		players: [player],
        replayData: [],
		score: [0, 0],
		started: false,
		timeStart: new Date(),
		turn: 0.5
	};
	game.channels[channel] = [];
	games.push(game);

	game.board = [];
	for (let i = 10; i--;)
	{
		let row = [];
		for (let i = 10; i--;)
		{
			row.push(false);
		}
		game.board.push(row);
	}

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
	exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be Black, and <@${game.players[1]}> will be Red!\nUse the command \"x!${shortname} rules\" if you don't know how to play the game!`, game.buffer]);
}

exports.newTourney = function(channel, player1, player2) {
	let game = {
		buffer: {},
		channels: {},
		forfeit: false,
		game: shortname,
		highlight: [[], []],
		oneChannel: here,
		over: false,
		player: false,
		players: [player1, player2],
		score: [0, 0],
		started: true,
		turn: 0.5
	};
	game.channels[channel] = [];
	games.push(game);

	let _ = false;
	game.board = [];
	for (let i = 10; i--;)
	{
		let row = [];
		for (let i = 10; i--;)
		{
			row.push(_);
		}
		game.board.push(row);
	}

	if ((Math.random() * 2 | 0) == 0) game.players.reverse();
	game.player = game.players[0];

	game.timer = {
		time: 900,
		message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
	}

	game.buffer = new Discord.Attachment(exports.drawBoard(game, 0, false), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
	exports.say(game.channels, [`A tourney match has been started between <@${game.players[0]}> and <@${game.players[1]}>!\n<@${game.players[0]}> will be Black, and <@${game.players[1]}> will be Red!`, game.buffer]);
}

exports.drawBoard = function(game, end) {
	let canvas = new Canvas.createCanvas(280, 300);
	let ctx = canvas.getContext('2d');

	ctx.drawImage(exports.Images.board, 0, 0);

	if (end === 0)
	{
		ctx.drawImage(exports.Images[["black", "red"][Math.floor(game.turn)] + "Text"], 20, 6);
		ctx.drawImage(exports.Images.turn, 76 - (19 * Math.floor(game.turn)), 4);
	}
	else
	if (end === 1)
	{
		ctx.drawImage(exports.Images[["black", "red"][game.winner] + "Text"], 20, 6);
		ctx.drawImage(exports.Images.win, 81 - (19 * Math.floor(game.turn)), 6);
	}
	else
	if (end === 2)
		ctx.drawImage(exports.Images.tie, 20, 6);

	for (let x = 0; x < 10; x++)
		for (let y = 0; y < 10; y++)
		{
			if (game.highlight[0].some(h => h[0] == x && h[1] == y))
				ctx.drawImage(exports.Images.highlight, 17 + (y * 25), 30 + (x * 25));
			else
			if (game.highlight[1].some(h => h[0] == x && h[1] == y))
				ctx.drawImage(exports.Images.squareHighlight, 17 + (y * 25), 30 + (x * 25));
			if (game.board[x][y] !== false)
				ctx.drawImage(exports.Images[["black", "red"][game.board[x][y]]], 17 + (y * 25), 30 + (x * 25));
		}

	ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[0]], 186, 3);
	ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[1]], 195, 3);
	ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[2]], 204, 3);
	ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[0]], 219, 3);
	ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[1]], 228, 3);
	ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[2]], 237, 3);

	if (end === 3) game.replayData.push(ctx);
	return canvas.toBuffer();
}

exports.takeTurn = function(channel, Move) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	let move = [Move.match(/[0-9]{1,2}/)[0] - 1, 'abcdefghij'.indexOf(Move.toLowerCase().match(/[a-j]/)[0])];

	if (game.board[move[0]][move[1]] !== false)
	{
		return exports.say(channel ["Illegal move: this space is not empty.", {}]);
	}
	else
	{
		game.board[move[0]][move[1]] = Math.floor(game.turn);
	}

	let end = 1;
	for (let y = 10; y--;)
	{
		for (let x = 10; x--;)
		{
			if (game.board[y][x] === false)
			{
				end = 0;
				break;
			}
		}
	}

	game.score = [0, 0];
	let highlight = [];
	for (let i = 1; i < 10; i++)
	{
		for (let x = 0; x < 10 - i; x++)
		{
			for (let y = 0; y < 10 - i; y++)
			{
				if (game.board[y][x] !== false && game.board[y][x] === game.board[y + i][x] && game.board[y][x] === game.board[y][x + i] && game.board[y][x] === game.board[y + i][x + i])
				{
					if (game.board[y][x] === 0)
					{
						game.score[0] += 1;
					}
					else
					{
						game.score[1] += 1;
					}

					if ([[y, x], [y + i, x], [y, x + i], [y + i, x + i]].some(h => h[0] == move[0] && h[1] == move[1]))
					{
						highlight = highlight.concat([[y, x], [y + i, x], [y, x + i], [y + i, x + i]]);
					}
				}
			}
		}
	}

	if (game.turn == Math.floor(game.turn))
	{
		game.highlight[0] = [move];
		game.highlight[1] = highlight
	}
	else
	{
		game.highlight[0].push(move);
		game.highlight[1] = game.highlight[1].concat(highlight);
	}

	if (end !== 0)
	{
		if (game.score[0] == game.score[1])
		{
			end = 2;
		}
		else
		{
			game.winner = game.score[0] > game.score[1] ? 0 : 1;
		}
	}

	exports.nextTurn(channel, end);
}

exports.nextTurn = function(channel, end) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	if (end == 0)
	{
		game.turn = game.turn == 1.5 ? 0 : game.turn + 0.5;
		game.player = game.players[Math.floor(game.turn)];
		game.timer = {
			time: 900,
			message: `Whoops, it looks like <@${game.players[Math.floor(game.turn)]}> has run out of time, so the game is over!`
		}
	}
	else
		game.winner = game.score[0] > game.score[1] ? 0 : 1;

	game.buffer = new Discord.Attachment(exports.drawBoard(game, end), [`squares_0_${game.players[0]}vs${game.players[1]}.png`, `squares_1_${game.players[game.winner]}.png`, `squares_2_tie.png`][end]);
	for (let ch in game.channels)
	{
		if (client.channels.get(ch).guild.members.get(client.user.id).hasPermission("MANAGE_MESSAGES"))
            for (let i = 0; i < game.channels[ch].length; i++)
                client.channels.get(ch).messages.get(game.channels[ch][i]).delete();
		game.channels[ch] = [];
	}

	if (end !== 0)
	{
		// Replay GIF will be different for this game
		// Instead of showing movement history, it'll just cycle through all the squares on the final screen and highlight them

		game.highlight = [[], []];
		game.score = [0, 0];
		exports.drawBoard(game, 3);
		for (let p = 0; p < 2; p++)
			for (let i = 1; i < 10; i++)
				for (let x = 0; x < 10 - i; x++)
					for (let y = 0; y < 10 - i; y++)
						if (game.board[y][x] === p && game.board[y][x] === game.board[y + i][x] && game.board[y][x] === game.board[y][x + i] && game.board[y][x] === game.board[y + i][x + i])
						{
							game.score[p] += 1;
							game.highlight[1] = [[y, x], [y + i, x], [y, x + i], [y + i, x + i]];
							exports.drawBoard(game, 3);
						}
		game.highlight = [[], []];
		exports.drawBoard(game, 3);
	}

	exports.say(game.channels, [end == 0 ? `It is <@${game.player}>'s turn.` : end == 2 ? "Tie game, everyone loses!" : `<@${game.players[game.winner]}> has won!`, game.buffer]);
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

exports.Images = {};

Canvas.loadImage("/app/assets/games/squares/board.png").then(image => {
	exports.Images.board = image;
});
Canvas.loadImage("/app/assets/games/squares/black.png").then(image => {
	exports.Images.black = image;
});
Canvas.loadImage("/app/assets/games/squares/red.png").then(image => {
	exports.Images.red = image;
});
Canvas.loadImage("/app/assets/games/squares/blackText.png").then(image => {
	exports.Images.blackText = image;
});
Canvas.loadImage("/app/assets/games/squares/redText.png").then(image => {
	exports.Images.redText = image;
});
Canvas.loadImage("/app/assets/games/squares/turn.png").then(image => {
	exports.Images.turn = image;
});
Canvas.loadImage("/app/assets/games/squares/win.png").then(image => {
	exports.Images.win = image;
});
Canvas.loadImage("/app/assets/games/squares/highlight.png").then(image => {
	exports.Images.highlight = image;
});
Canvas.loadImage("/app/assets/games/squares/squareHighlight.png").then(image => {
	exports.Images.squareHighlight = image;
});
Canvas.loadImage("/app/assets/games/squares/tie.png").then(image => {
	exports.Images.tie = image;
});

exports.Images.numbers = new Array(10);
for (let i = 0; i < 10; i++)
{
	Canvas.loadImage(`/app/assets/games/numbers/${i}.png`).then(image => {
		exports.Images.numbers[i] = image;
	});
}