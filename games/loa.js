const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Lines of Action";
var shortname = "loa";

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
	game.board = [
		[_, 0, 0, 0, 0, 0, 0, _],
		[1, _, _, _, _, _, _, 1],
		[1, _, _, _, _, _, _, 1],
		[1, _, _, _, _, _, _, 1],
		[1, _, _, _, _, _, _, 1],
		[1, _, _, _, _, _, _, 1],
		[1, _, _, _, _, _, _, 1],
		[_, 0, 0, 0, 0, 0, 0, _]
	];

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

	for (let x = 0; x < 8; x++)
		for (let y = 0; y < 8; y++)
			if (typeof game.board[x][y] != "boolean")
			{
				ctx.drawImage(exports.Images[["black", "white"][game.board[x][y]]], 17 + (y * 25), 30 + (x * 25));
			}

	if (highlight)
	{
		ctx.drawImage(exports.Images.to, 17 + (highlight[0][1] * 25), 30 + (highlight[0][0] * 25));
		ctx.drawImage(exports.Images.from, 17 + (highlight[1][1] * 25), 30 + (highlight[1][0] * 25));
	}

	let newCanvas = new Canvas.createCanvas(221, 246);
	let newCtx = newCanvas.getContext('2d');
	let data = ctx.getImageData(0, 0, 221, 246);
	newCtx.putImageData(data, 0, 0);
    game.replayData.push(newCtx);

    if (end === 0)
    {
        ctx.drawImage(exports.Images[["black", "white"][game.turn] + "Text"], 20, 6);
        ctx.drawImage(exports.Images.turn, 76, 4);
    }
    else
    {
        ctx.drawImage(exports.Images[["black", "white"][game.winner] + "Text"], 20, 6);
        ctx.drawImage(exports.Images.win, 81, 6);
    }

	return canvas.toBuffer();
}

exports.takeTurn = function(channel, Move) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	game.canHaveTurn = false;

	let dir = [ "north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest",
		"n", "ne", "e", "se", "s", "sw", "w", "nw",
		"north", "eastnorth", "east", "eastsouth", "south", "westsouth", "west", "westnorth",
		"n", "en", "e", "es", "s", "ws", "w", "wn",
		"up", "upright", "right", "downright", "down", "downleft", "left", "upleft",
		"u", "ur", "r", "dr", "d", "dl", "l", "ul",
		"up", "rightup", "right", "rightdown", "down", "leftdown", "left", "leftup",
		"u", "ru", "r", "rd", "d", "ld", "l", "lu" ].indexOf(Move.split(' ')[1].toLowerCase().replace(/\s{1,}/, '')) % 8;
	let from = [
		Move.split(' ')[0].match(/[1-8]{1}/)[0] - 1,
		'abcdefgh'.indexOf(Move.split(' ')[0].toLowerCase().match(/[a-j]/)[0]),
		[-1, -1, 0, 1, 1, 1, 0, -1][dir],
		[0, 1, 1, 1, 0, -1, -1, -1][dir] ];

	if (typeof game.board[from[0]][from[1]] == "boolean" || game.board[from[0]][from[1]] != game.turn)
		return exports.say(channel, ["Illegal move: you do not have a piece in that space."]);

	// Count how many pieces are in the line of movement
	let count = 1;
	for (let f = 1; f < 8; f++)
	{
		let F = [from[0] + (f * from[2]), from[1] + (f + from[3])];
		let B = [from[0] - (f * from[2]), from[1] - (f + from[3])];
		if (F[0] >= 0 && F[0] < 8 && F[1] >= 0 && F[1] < 8 && typeof game.board[F[0]][F[1]] != "boolean")
			count++;
		if (B[0] >= 0 && B[0] < 8 && B[1] >= 0 && B[1] < 8 && typeof game.board[B[0]][B[1]] != "boolean")
			count++;
	}

	// Is the space takeable
	if ((from[0] + (count * from[2])) <= 0 || (from[0] + (count * from[2])) > 7 || (from[1] + (count * from[3])) <= 0 || (from[1] + (count * from[3])) > 7)
		return exports.say(channel, ["Illegal move: this move will take the piece off the edge of the board."]);
	let to = [from[0] + (count * from[2]), from[1] + (count * from[3])];
	if (typeof game.board[to[0]][to[1]] != "boolean" && game.board[to[0]][to[1]] == game.turn)
		return exports.say(channel, ["Illegal move: one of your own pieces already occupies that space."]);

	// Is anything blocking the path
	let jumpingoverenemypieces = false;
	for (let i = 0; i < count; i++)
		if (typeof game.board[from[0] + (i * from[2])][from[1] + (i * from[3])] != "boolean" && game.board[from[0] + (i * from[2])][from[1] + (i * from[3])] != game.turn)
		{
			jumpingoverenemypieces = true;
			break;
		}
	if (jumpingoverenemypieces)
		return exports.say(channel, ["Illegal move: you cannot jump over enemy pieces."]);

	// Move is now legal, check for win
	game.board[to[0]][to[1]] = game.turn;
	game.board[from[0]][from[1]] = false;
	let end = 0;

	// All pieces connected?
	let pieceCount = 0;
	for (x = 0; x < 8; x++)
		for (y = 0; y < 8; y++)
			if (typeof game.board[x][y] != "boolean" && game.board[x][y] != game.turn)
				pieceCount++;
	let queue = [to];
	let confirmed = [];
	let groupCount = 0;
	do {
		for (i = 0; i < queue.length; i++)
		{
			a = queue.shift();
			confirmed.push(a);
			groupCount++;
			for (d = 0; d < 8; d++)
			{
				dir = [
					a[0] + [-1, -1, 0, 1, 1, 1, 0, -1][d],
					a[1] + [0, 1, 1, 1, 0, -1, -1, -1][d]
				];
				if (typeof game.board[dir[0]][dir[1]] != "boolean" && game.board[dir[0]][dir[1]] == game.turn && queue.some(a => a[0] == dir[0] && a[1] == dir[1]) && confirmed.some(a => a[0] == dir[0] && a[1] == dir[1]))
					queue.push(dir);
			}
		}
	} while (queue.length != 0);
	if (groupCount == pieceCount)
		end = 1;

	// Only one enemy piece left?
	let EnemyPieceCount = 0;
	for (x = 0; x < 8; x++)
		for (y = 0; y < 8; y++)
			if (typeof game.board[x][y] != "boolean" && game.board[x][y] != game.turn)
				EnemyPieceCount++;
	if (EnemyPieceCount == 1)
		end = 2;

	let highlight = [to, from];

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
		if (end == 1)
			game.winner = game.turn;
		if (end == 2)
			game.winner = [1, 0][game.turn];
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

Canvas.loadImage("/app/assets/games/loa/board.png").then(image => {
	exports.Images.board = image;
});
Canvas.loadImage("/app/assets/games/loa/black.png").then(image => {
    exports.Images.black = image;
});
Canvas.loadImage("/app/assets/games/loa/white.png").then(image => {
    exports.Images.white = image;
});
Canvas.loadImage("/app/assets/games/loa/to.png").then(image => {
    exports.Images.to = image;
});
Canvas.loadImage("/app/assets/games/loa/from.png").then(image => {
    exports.Images.from = image;
});
Canvas.loadImage("/app/assets/games/loa/blackText.png").then(image => {
    exports.Images.blackText = image;
});
Canvas.loadImage("/app/assets/games/loa/whiteText.png").then(image => {
    exports.Images.whiteText = image;
});
Canvas.loadImage("/app/assets/games/loa/turn.png").then(image => {
    exports.Images.turn = image;
});
Canvas.loadImage("/app/assets/games/loa/win.png").then(image => {
    exports.Images.win = image;
});
Canvas.loadImage("/app/assets/games/loa/tie.png").then(image => {
    exports.Images.tie = image;
});