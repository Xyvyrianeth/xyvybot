const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Latrones";
var shortname = "latrones";

exports.newGame = function(channel, player) {
    let time = new Date();
	let game = {
		buffer: {},
		canHaveTurn: true,
		channels: {},
		forfeit: false,
		game: shortname,
		highlight: false,
		jump: false,
		lastmove: '',
		over: false,
		phase: 1,
		pieces: 0,
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
	for (x = 0; x < 8; x++)
	{
		let X = [];
		for (y = 0; y < 8; y++)
			X.push(_);
		game.board.push(X);
	}

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

	game.buffer = new Discord.MessageAttachment(exports.drawBoard(game, 0, []), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
	exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be dark, and <@${game.players[1]}> will be light!`, game.buffer]);
}

exports.drawBoard = function(game, end, highlight) {
	let canvas = new Canvas.createCanvas(221, 271);
	let ctx = canvas.getContext('2d');

	ctx.drawImage(exports.Images.board, 0, 0);

	for (let x = 0; x < 8; x++)
		for (let y = 0; y < 8; y++)
			if (typeof game.board[x][y] != "boolean")
			{
				if (typeof game.board[x][y] == "number")
					ctx.drawImage(exports.Images[["black", "white"][game.board[x][y]] + "Free"], 17 + (y * 25), 30 + (x * 25));
				else
					ctx.drawImage(exports.Images[["black", "white"][game.board[x][y][0]] + "Blocked"], 17 + (y * 25), 30 + (x * 25));
			}
	for (let h of highlight)
		ctx.drawImage(exports.Images[["to", "from", "capture", "free"][h[2]]], 17 + (h[0]), 30 + (h[1]));

	ctx.drawImage(exports.Images["phase" + game.phase], [23, 25][game.phase - 1], 250);

	let newCanvas = new Canvas.createCanvas(221, 246);
	let newCtx = newCanvas.getContext('2d');
	let data = ctx.getImageData(0, 0, 221, 246);
	newCtx.putImageData(data, 0, 0);
	game.replayData.push(newCtx);

	if (end == 0)
    {
        ctx.drawImage(exports.Images[["black", "white"][game.turn] + "Text"], 55, 6);
        ctx.drawImage(exports.Images.turn, 111, 4);
    }
    else
    {
        ctx.drawImage(exports.Images[["black", "white"][game.winner] + "Text"], 61, 6);
        ctx.drawImage(exports.Images.win, 122, 6);
    }

	return canvas.toBuffer();
}

exports.takeTurn = function(channel, Move) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	let highlight = [];
	game.canHaveTurn = false;

	let inBounds = (crd) => {
		return crd[0] >= 0 && crd[1] >= 0 && crd[0] <= 7 && crd[1] <= 7;
	}
	let isPiece = (crd, piece, trapped) => {
		if (typeof game.board[crd[0]][crd[1]] == "boolean" && piece == 3) return true;
		if (typeof game.board[crd[0]][crd[1]] == "number" && piece == game.board[crd[0]][crd[1]]) return true;
		if (typeof game.board[crd[0]][crd[1]] == "array" && piece == game.board[crd[0]][crd[1]][0] && trapped) return true;
		return false;
	}
	let getDir = (crd, dir, dis) => {
		return [crd[0] + (dis * [-1, 0, 1, 0][dir]), crd[1] + (dis * [0, 1, 0, -1][dir])];
	}

	if (game.phase == 1)
	{
		if (/^([1-8][a-h]|[a-h][1-8])$/i.test(Move))
		{
			let move = [Move.match(/[1-8]{1}/)[0] - 1, 'abcdefgh'.indexOf(Move.toLowerCase().match(/[a-j]/)[0]), 0];

			if (!isPiece(move, 3))
				return exports.say(channel, ["Illegal play: That space is not vacant."]);

			game.board[move[0]][move[1]] = game.turn;
			game.turn = [1, 0][game.turn];
			game.pieces++;
			if (game.pieces == 32)
				game.phase = 2;

			highlight.push(move);
		}
		else
		if (/^([1-8][a-h]|[a-h][1-8]) (up|right|down|left|north|south|east|west|[urdlnsew])$/i.test(Move) || /^(up|right|down|left|north|south|east|west|[urdlnsew])$/i.test(Move))
			return exports.say(channel, ["Illegal play: You cannot move pieces yet."]);
		else
		if (/^(end|stop)$/i.test(Move))
			return exports.say(channel, ["Illegal play: You can't end your turn before starting it. You have to place a piece somewhere."]);
	}
	else
	{
		if (game.jump)
		{
			if (["end", "stop"].includes(Move))
				game.jump = false;
			else
			if (!/^(|([1-8][a-h]|[a-h][1-8]) )(up|right|down|left|north|south|east|west|[urdlnsew])$/i.test(Move))
				return exports.say(channel, ["Illegal play: You are in a multi-jump. You can only move the piece highlighted green or end your turn by saying \"end\"."]);
			else
			{
				if (/^([1-8][a-h]|[a-h][1-8]) (up|right|down|left|north|south|east|west|[urdlnsew])$/i.test(Move))
				{
					let move = [Move.split(' ')[0].match(/[1-8]{1}/)[0] - 1, 'abcdefgh'.indexOf(Move.split(' ')[0].toLowerCase().match(/[a-j]/)[0])];
					if (move[0] != game.jump[0][0] && move[1] != game.jump[0][1])
						return exports.say(channel, ["Illegal play: You cannot move that piece right now. During a multi-jump, you can only move the piece highlighted green or end your turn by saying \"end\"."])
				}
				let dir = { "up":    0, "right": 1, "down":  2, "left": 3,
					        "north": 0, "east":  1, "south": 2, "west": 3,
					        "u":     0, "r":     1, "d":     2, "l":    3,
							"n":     0, "e":     1, "s":     2, "w":    3 }[Move.match(/(up|right|down|left|north|south|east|west|[urdlnsew])$/i)[0]];
				if (!game.jump[1].includes(dir))
					return exports.say(channel, ["Illegal play: You cannot move the active piece in that direction."]);

				let pos0 = [game.jump[0][0], game.jump[0][1]];
				let pos1 = getDir(game.jump[0], dir, 2);

				for (let d = 0; d < 2; d++)
				{
					let r = [2, 3, 0, 1][d];
					let dir1 = getDir(pos1, d, 1);
					let dir2 = getDir(pos1, d, 2);
					let rir1 = getDir(pos1, r, 1);
					let rir2 = getDir(pos1, r, 2);
					if (inBounds(dir1) && isPiece(dir1, [1, 0][game.turn]) && inBounds(rir1) && isPiece(rir1, [1, 0][game.turn]) && ((!inBounds(dir2) || !isPiece(dir2, game.turn)) && (!inBounds(rir2) || !isPiece(rir2, game.turn))))
						return exports.say(channel, ["Illegal play: This move would put this piece in a trapped position."]);
				}

				game.board[game.jump[0][0]][game.jump[0][1]] = false;
				game.board[pos1[0]][pos1[1]] = game.turn;
				highlight.push([game.jump[0][0], game.jump[0][1], 0]);
				highlight.push([pos1[0], pos1[1], 1]);

				let dirs = [];
				for (let d = 0; d < 4; d++)
				{
					let dir1 = getDir(pos1, d, 1);
					let dir2 = getDir(pos1, d, 2);
					if (d == [2, 3, 0, 1][dir])
						continue;
					if (!inBounds(dir2))
						continue;
					if (isPiece(dir1, 3))
						continue;
					if (!isPiece(dir2, 3))
						continue;
					dirs.push(d);
				}
				if (dirs.length > 0)
					game.jump = [pos, dirs];
				else
					game.jump = false;

				for (let d = 0; d < 4; d++)
				{
					if (dirs.includes(d))
						continue;

					let dir1 = getDir(pos1, d, 1);
					let dir2 = getDir(pos1, d, 2);
					if (inBounds(dir1) && isPiece(dir1, [1, 0][game.turn]) && isPiece(dir2, game.turn))
					{
						game.board[dir1[0]][dir1[1]] = [[1, 0][game.turn], d % 2];
						highlight.push([dir1[0], dir1[1], 2]);

						for (let D = 0; D < 4; D++)
						{
							let DIR = getDir(dir1, D, 1);
							if (inBounds(DIR) && isPiece(DIR, game.turn, true) && game.board[DIR[0]][DIR[1]][1] == D % 2)
							{
								game.board[DIR[0]][DIR[1]] = game.turn;
								highlight.push([DIR[0], DIR[1], 3]);
							}
						}
					}
				}
				for (let d = 0; d < 4; d++)
				{
					let dir1 = getDir(pos0, d, 1);
					if (inBounds(dir1) && isPiece(dir1, [1, 0][game.turn], true) && game.board[dir1[0]][dir1[1]][1] == d % 2)
					{
						game.board[dir1[0]][dir1[1]] = [1, 0][game.turn];
						highlight.push([dir1[0], dir1[1], 3]);
					}
				}
			}
		}
		else
		if (/^([1-8][a-h]|[a-h][1-8]) (up|right|down|left|north|south|east|west|[urdlnsew])$/i.test(Move))
		{
			let move0 = [Move.split(' ')[0].match(/[1-8]{1}/)[0] - 1, 'abcdefgh'.indexOf(Move.split(' ')[0].toLowerCase().match(/[a-j]/)[0])];
			if (!isPiece(move0, 3))
			{
				if (isPiece(move0, game.turn, true))
					return exports.say(channel, ["Illegal play: That piece is trapped and cannot be moved until it is freed."]);
				else
				if (!isPiece(move0, game.turn))
					return exports.say(channel, ["Illegal play: You do not own the piece in that space."]);
			}
			else
				return exports.say(channel, ["Illegal play: That space is empty."]);
			let dir = { "up":    0, "right": 1, "down":  2, "left": 3,
						"north": 0, "east":  1, "south": 2, "west": 3,
						"u":     0, "r":     1, "d":     2, "l":    3,
						"n":     0, "e":     1, "s":     2, "w":    3 }[Move.match(/(up|right|down|left|north|south|east|west|[urdlnsew])$/i)[0]];
			let move1 = getDir(move0, dir, 1);
			let move2 = getDir(move0, dir, 2);
			if (inBounds(move1) && isPiece(move1, 3))
			{
				for (let d = 0; d < 2; d++)
				{
					let r = [2, 3, 0, 1][d];
					let dir1 = getDir(move1, d, 1);
					let dir2 = getDir(move1, d, 2);
					let rir1 = getDir(move1, r, 1);
					let rir2 = getDir(move1, r, 2);
					if (inBounds(dir1) && isPiece(dir1, [1, 0][game.turn]) && inBounds(rir1) && isPiece(rir1, [1, 0][game.turn]) && ((!inBounds(dir2) || !isPiece(dir2, game.turn)) && (!inBounds(rir2) || !isPiece(rir2, game.turn))))
						return exports.say(channel, ["Illegal play: This move would put this piece in a trapped position."]);
				}

				game.board[move0[0]][move0[1]] = false;
				game.board[move1[0]][move1[1]] = game.turn;

				for (let d = 0; d < 4; d++)
				{
					let dir1 = getDir(move1, d, 1);
					let dir2 = getDir(move1, d, 2);
					if (inBounds(dir1) && isPiece(dir1, [1, 0][game.turn]) && isPiece(dir2, game.turn))
					{
						game.board[dir1[0]][dir1[1]] = [[1, 0][game.turn], d % 2];
						highlight.push([dir1[0], dir1[1], 2]);

						for (let D = 0; D < 4; D++)
						{
							let DIR = getDir(dir1, D, 1);
							if (inBounds(DIR) && isPiece(DIR, game.turn, true) && game.board[DIR[0]][DIR[1]][1] == D % 2)
							{
								game.board[DIR[0]][DIR[1]] = game.turn;
								highlight.push([DIR[0], DIR[1], 3]);
							}
						}
					}
				}
				for (let d = 0; d < 4; d++)
				{
					let dir1 = getDir(move0, d, 1);
					if (inBounds(dir1) && isPiece(dir1, [1, 0][game.turn], true) && game.board[dir1[0]][dir1[1]][1] == d % 2)
					{
						game.board[dir1[0]][dir1[1]] = [1, 0][game.turn];
						highlight.push([dir1[0], dir1[1], 3]);
					}
				}
			}
			else
			if (inBounds(move2) && !isPiece(move1, 3) && isPiece(move2, 3))
			{
				game.board[move0[0]][move0[1]] = false;
				game.board[move2[0]][move2[1]] = game.turn;

				for (let d = 0; d < 4; d++)
				{
					let dir1 = getDir(move2, d, 1);
					let dir2 = getDir(move2, d, 2);
					if (inBounds(dir1) && isPiece(dir1, [1, 0][game.turn]) && isPiece(dir2, game.turn))
					{
						game.board[dir1[0]][dir1[1]] = [[1, 0][game.turn], d % 2];
						highlight.push([dir1[0], dir1[1], 2]);

						for (let D = 0; D < 4; D++)
						{
							let DIR = [dir1[0] + [-1, 0, 1, 0][D], dir1[1] + [0, 1, 0, -1][D]];
							if (inBounds(DIR) && isPiece(DIR, game.turn, true) && game.board[DIR[0]][DIR[1]][1] == D % 2)
							{
								game.board[DIR[0]][DIR[1]] = game.turn;
								highlight.push([DIR[0], DIR[1], 3]);
							}
						}
					}
				}
				for (let d = 0; d < 4; d++)
				{
					let dir1 = [move0[0] + [-1, 0, 1, 0][d], move0[1] + [0, 1, 0, -1][d]];
					if (inBounds(dir1) && isPiece(dir1, [1, 0][game.turn], true) && game.board[dir1[0]][dir1[1]][1] == d % 2)
					{
						game.board[dir1[0]][dir1[1]] = [1, 0][game.turn];
						highlight.push([dir1[0], dir1[1], 3]);
					}
				}
			}
		}
		else
		if (/^([1-8][a-h]|[a-h][1-8]) (remove|capture)$/i.test(Move))
		{
			let piece = [Move.split(' ')[0].match(/[1-8]{1}/)[0] - 1, 'abcdefgh'.indexOf(Move.split(' ')[0].toLowerCase().match(/[a-j]/)[0])];
			if (isPiece(piece, [1, 0][game.turn], true))
			{
				game.board[piece[0]][piece[1]] = false;
				highlight.push([piece[0], piece[1], 2]);
			}
			else
			if (isPiece(piece, game.turn, true))
				return exports.say(channel, ["Illegal play: You cannot remove your own trapped pieces from the game."]);
			else
			if (isPiece(piece, [1, 0][game.turn]))
				return exports.say(channel, ["Illegal play: That piece is not trapped and cannot be removed."]);
			else
			if (isPiece(piece, game.turn))
				return exports.say(channel, ["Illegal play: You cannot remove your own pieces from the game."]);
			else
			if (isPiece(piece, 3))
				return exports.say(channel, ["Illegal play: There is no piece there to be removed."]);
		}

		let end = 0;
		let pieceCount = [0, 0];
		let trapCount = [0, 0];
		for (let x = 0; x < 8; x++)
			for (let y = 0; y < 8; y++)
			{
				if (typeof game.board[x][y] == "number")
					pieceCount[game.board[x][y]]++;
				if (typeof game.board[x][y] == "array")
				{
					pieceCount[game.board[x][y][0]]++;
					trapCount[game.board[x][y][0]]++;
				}
			}

		if (pieceCount.includes(1))
			end = 1, game.winner = [1, 0][pieceCount.indexOf(1)];
		if (pieceCount[[1, 0][game.turn]] == trapCount[[1, 0][game.turn]])
			end = 2, game.winner = game.turn;

		let hasMove = false;
		for (let x = 0; x < 8; x++)
			for (let y = 0; y < 8; y++)
			{
				if (isPiece([x, y], [1, 0][game.turn]))
				for (let d = 0; d < 4; d++)
				{
					let xy1 = getDir([x, y], d, 1);
					let xy2 = getDir([x, y], d, 2);
					if (isPiece(xy1, 3) && !isPiece(xy2, 3))
					{
						hasMove = true;
						break;
					}
				}
				if (isPiece([x, y], game.turn, true))
				{
					hasMove = true;
					break;
				}
			}
		if (!hasMove)
			end = 3, game.winner = game.turn;

		if (end == 0)
		{
			game.turn = [1, 0][game.turn];
			game.player = game.players[game.turn];
		}
	}

	exports.nextTurn(channel, end, highlight);
}

exports.nextTurn = function(channel, end, highlight) {
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	if (end == 0)
	{
		game.timer = {
			time: 600,
			message: `Whoops, it looks like <@${game.players[game.turn]}> has run out of time, so the game is over!`
		}
	}

	game.buffer = new Discord.MessageAttachment(exports.drawBoard(game, end, highlight), end == 0 ? `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png` : `${shortname}_${end}_${game.players[game.winner]}.png`);
	for (let ch in game.channels)
	{
		if (client.channels.cache.get(ch).guild.members.cache.get(client.user.id).hasPermission("MANAGE_MESSAGES"))
			for (let i = 0; i < game.channels[ch].length; i++)
				client.channels.cache.get(ch).messages.cache.get(game.channels[ch][i]).delete();
		game.channels[ch] = [];
	}

	exports.say(game.channels, [end == 0 ? `It is <@${game.player}>'s turn.${game.jump ? "\nSince you have just jumped a piece, you can either continue your turn by jumping more pieces with the green highlighted piece or end you turn by saying \"end\"." : ''}` : `<@${game.players[game.winner]}> has won ${["by removing all but one of their opponent's pieces", "by trapping all of their opponent's pieces", "because their opponent cannot make a legal move"][end - 1]}!`, game.buffer]);
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

Canvas.loadImage(`/app/assets/games/${shortname}/board.png`).then(image => {
	exports.Images.board = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/blackText.png`).then(image => {
	exports.Images.blackText = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/whiteText.png`).then(image => {
	exports.Images.whiteText = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/turn.png`).then(image => {
	exports.Images.turn = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/win.png`).then(image => {
	exports.Images.win = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/whiteFree.png`).then(image => {
	exports.Images.whiteFree = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/blackFree.png`).then(image => {
	exports.Images.blackFree = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/whiteBlocked.png`).then(image => {
	exports.Images.whiteBlocked = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/blackBlocked.png`).then(image => {
	exports.Images.blackBlocked = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/to.png`).then(image => {
	exports.Images.to = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/from.png`).then(image => {
	exports.Images.from = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/phase1.png`).then(image => {
	exports.Images.phase1 = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/phase2.png`).then(image => {
	exports.Images.phase2 = image;
});