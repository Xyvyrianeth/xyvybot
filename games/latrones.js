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
		ctx.drawImage(exports.Images[["to", "from", "capture", "free"][h[2]]], 17 + (h[1] * 25), 30 + (h[0] * 25));

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
	let game = games.filter(game => game.channels.hasOwnProperty(channel))[0],
		highlight = [];
	game.canHaveTurn = false;

	let isPiece = (crd, piece, trapped) => {
		if (crd[0] < 0 || crd[1] < 0 || crd[0] > 7 || crd[1] > 7) return piece == 4;
		if (typeof game.board[crd[0]][crd[1]] == "boolean" && piece == 3 && !trapped) return true;
		if (typeof game.board[crd[0]][crd[1]] == "number" && piece == game.board[crd[0]][crd[1]] && !trapped) return true;
		if (typeof game.board[crd[0]][crd[1]] == "object" && piece == game.board[crd[0]][crd[1]][0] && trapped) return true;
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
			game.player = game.players[game.turn];
			game.pieces++;
			if (game.pieces == 32)
				game.phase = 2;

			highlight.push(move);
		}
		else
		if (/(up|right|down|left|north|south|east|west|[urdlnsew])$/i.test(Move))
			return exports.say(channel, ["Illegal play: You cannot move pieces yet."]);
		else
		if (/(remove|capture|cap|delete)$/i.test(Move))
			return exports.say(channel, ["Illegal play: You cannot capture pieces yet."]);
		else
		if (/^(end|stop)$/i.test(Move))
			return exports.say(channel, ["Illegal play: You have to take your turn. Otherwise, just say \"x!latrones forfeit\"."]);
	}
	else
	{
		if (/^(([1-8][a-h]|[a-h][1-8]) |)(up|right|down|left|north|south|east|west|[urdlnsew])$/i.test(Move))
		{
			let move0 = game.jump ? game.jump[0] : [Move.split(' ')[0].match(/[1-8]{1}/)[0] - 1, 'abcdefgh'.indexOf(Move.split(' ')[0].toLowerCase().match(/[a-j]/)[0])],
				dir = { "up":    0, "right": 1, "down":  2, "left": 3,
						"north": 0, "east":  1, "south": 2, "west": 3,
						"u":     0, "r":     1, "d":     2, "l":    3,
						"n":     0, "e":     1, "s":     2, "w":    3 }[Move.match(/(up|right|down|left|north|south|east|west|[urdlnsew])$/i)[0]];

			if (!/^([1-8][a-h]|[a-h][1-8])/i.test(Move))
			{
				if (!game.jump)
					if (/^(up|right|down|left|north|south|east|west|[urdlnsew])$/i.test(Move))
						return exports.say(channel, ["Illegal play: Please specify which piece you want to move in that direction."]);
			}
			else
			{
				if (game.jump)
				{
					let move = [Move.split(' ')[0].match(/[1-8]{1}/)[0] - 1, 'abcdefgh'.indexOf(Move.split(' ')[0].toLowerCase().match(/[a-j]/)[0])];
					if (move[0] != move0[0] || move[1] != move0[1])
						return exports.say(channel, ["Illegal play: You cannot move that piece right now. During a multi-jump, you can only move the piece highlighted green or end your turn by saying \"end\"."]);
				}
				else
				{
					if (!isPiece(move0, game.turn))
					{
						if (isPiece(move0, game.turn, true))
							return exports.say(channel, ["Illegal play: That piece is trapped and cannot be moved until it is freed."]);
						if (isPiece(move0, [1, 0][game.turn]))
							return exports.say(channel, ["Illegal play: That piece is not yours to move."]);
						if (isPiece(move0, [1, 0][game.turn], true))
							return exports.say(channel, [`Illegal play: That piece is not yours, but it is trapped!\nYou can capture it by saying "${Move.split(' ')[0]} capture"`]);
						if (isPiece(move0, 3))
							return exports.say(channel, ["Illegal play: You do not have a piece in that space."]);
					}
				}
			}

			let move1 = getDir(move0, dir, 1),
				move2 = getDir(move0, dir, 2),
				move3 = getDir(move0, dir, 3),
				move4 = getDir(move0, dir, 4);

			if (isPiece(move1, 4) || (!isPiece(move1, 3) && isPiece(move2, 4)))
				return exports.say(channel, ["Illegal play: That would move this piece off the board."]);
			if (!isPiece(move1, 3) && !isPiece(move2, 3))
				return exports.say(channel, ["Illegal play: There are pieces blocking that move."]);

			if (isPiece(move1, 3))
			{
				if (game.jump)
					return exports.say(channel, ["Illegal play: There is not a piece you can jump in that direction."]);

				let D = (dir + 1) % 2,
					R = D + 2;
				let dir1 = getDir(move1, D, 1),
					dir2 = getDir(move1, D, 2),
					rir1 = getDir(move1, R, 1),
					rir2 = getDir(move1, R, 2);
				if (isPiece(dir1, [1, 0][game.turn]) && isPiece(rir1, [1, 0][game.turn]) && !isPiece(dir2, game.turn) && !isPiece(rir2, game.turn))
					return exports.say(channel, ["Illegal play: That move would put this piece in a trapped position."]);

				game.board[move0[0]][move0[1]] = false;
				game.board[move1[0]][move1[1]] = game.turn;
				highlight.push([move0[0], move0[1], 1]);
				highlight.push([move1[0], move1[1], 0]);

				for (let d = 0; d < 4; d++)
				{
					let dir1 = getDir(move1, d, 1);
					let dir2 = getDir(move1, d, 2);
					if (isPiece(dir1, [1, 0][game.turn]) && isPiece(dir2, game.turn))
					{
						game.board[dir1[0]][dir1[1]] = [[1, 0][game.turn], d % 2];
						highlight.push([dir1[0], dir1[1], 2]);

						for (let D = 0; D < 4; D++)
						{
							let DIR = getDir(dir1, D, 1);
							if (isPiece(DIR, game.turn, true) && game.board[DIR[0]][DIR[1]][1] == D % 2)
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
					if (isPiece(dir1, [1, 0][game.turn], true) && game.board[dir1[0]][dir1[1]][1] == d % 2)
					{
						game.board[dir1[0]][dir1[1]] = [1, 0][game.turn];
						highlight.push([dir1[0], dir1[1], 3]);
					}
				}
			}
			else
			if (!isPiece(move1, 3) && isPiece(move2, 3))
			{
				if (game.jump)
				{
					if (game.jump[1][dir] == 1)
						return exports.say(channel, ["Illegal play: You cannot backtrack on a multi-jump."]);
					if (game.jump[1][dir] == 2)
						return exports.say(channel, ["Illegal play: That would move this piece off the board."]);
					if (game.jump[1][dir] == 3)
						return exports.say(channel, ["Illegal play: There is not a piece you can jump in that direction."]);
					if (game.jump[1][dir] == 4)
						return exports.say(channel, ["Illegal play: There are pieces blocking a jump in that direction."]);
					if (game.jump[1][dir] == 5)
						return exports.say(channel, ["Illegal play: That jump would put this piece in a trapped position."]);
				}

				let D1 = (dir + 1) % 2,
					R1 = D1 + 2;
				let Dir1 = getDir(move2, D1, 1),
					Dir2 = getDir(move2, D1, 2),
					Rir1 = getDir(move2, R1, 1),
					Rir2 = getDir(move2, R1, 2);

				if ((isPiece(move1, [1, 0][game.turn]) && isPiece(move3, [1, 0][game.turn]) && !isPiece(move4, game.turn)) || isPiece(Dir1, [1, 0][game.turn]) && isPiece(Rir1, [1, 0][game.turn]) && !isPiece(Dir2, game.turn) && !isPiece(Rir2, game.turn))
					return exports.say(channel, ["Illegal play: That move would put this piece in a trapped position."]);

				game.board[move0[0]][move0[1]] = false;
				game.board[move2[0]][move2[1]] = game.turn;
				highlight.push([move2[0], move2[1], 0]);

				let dirs = [0, 0, 0, 0];
				for (let d = 0; d < 4; d++)
				{
					let dir1 = getDir(move2, d, 1),
						dir2 = getDir(move2, d, 2),
						dir3 = getDir(move2, d, 3),
						dir4 = getDir(move2, d, 4);
					let D2 = (d + 1) % 2,
						R2 = D2 + 1;
					let DIR1 = getDir(dir2, D2, 1),
						DIR2 = getDir(dir2, D2, 2),
						RIR1 = getDir(dir2, R2, 1),
						RIR2 = getDir(dir2, R2, 2);
					if (d == [2, 3, 0, 1][dir])
						dirs[d] = 1;
					else
					if (isPiece(dir2, 4))
						dirs[d] = 2
					else
					if (isPiece(dir1, 3))
						dirs[d] = 3;
					else
					if (!isPiece(dir2, 3))
						dirs[d] = 4;
					else
					if (isPiece(dir1, [1, 0][game.turn]) && isPiece(dir3, [1, 0][game.turn]) && !isPiece(dir4, game.turn))
						dirs[d] = 5;
					else
					if (isPiece(DIR1, [1, 0][game.turn]) && isPiece(RIR1, [1, 0][game.turn]) && !isPiece(DIR2, game.turn) && !isPiece(RIR2, game.turn))
						dirs[d] = 5;
				}
				if (dirs.includes(0))
				{
					if (game.jump)
						game.jump = [move2, dirs, game.jump[2].concat([move0[0], move0[1], 1])];
					else
						game.jump = [move2, dirs, [move0[0], move0[1], 1]];

					highlight = highlight.concat(game.jump[2]);
				}
				else
				{
					game.jump = false;
					highlight.push([move0[0], move0[1], 1]);
				}

				for (let d = 0; d < 4; d++)
				{
					let dir1 = getDir(move2, d, 1),
						dir2 = getDir(move2, d, 2);
					if (isPiece(dir1, [1, 0][game.turn]) && isPiece(dir2, game.turn))
					{
						game.board[dir1[0]][dir1[1]] = [[1, 0][game.turn], d % 2];
						highlight.push([dir1[0], dir1[1], 2]);

						for (let D = 0; D < 4; D++)
						{
							let DIR = [dir1[0] + [-1, 0, 1, 0][D], dir1[1] + [0, 1, 0, -1][D]];
							if (isPiece(DIR, game.turn, true) && game.board[DIR[0]][DIR[1]][1] == D % 2)
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
					if (isPiece(dir1, [1, 0][game.turn], true) && game.board[dir1[0]][dir1[1]][1] == d % 2)
					{
						game.board[dir1[0]][dir1[1]] = [1, 0][game.turn];
						highlight.push([dir1[0], dir1[1], 3]);
					}
				}
			}
		}
		else
		if (/^([1-8][a-h]|[a-h][1-8]) (remove|capture|cap|delete)$/i.test(Move))
		{
			let piece = [Move.split(' ')[0].match(/[1-8]{1}/)[0] - 1, 'abcdefgh'.indexOf(Move.split(' ')[0].toLowerCase().match(/[a-j]/)[0]), 2];
			if (isPiece(piece, [1, 0][game.turn], true))
			{
				game.board[piece[0]][piece[1]] = false;
				highlight.push [piece];
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
		else
		if (/^([1-8][a-h]|[a-h][1-8])$/i.test(Move))
			return exports.say(channel, ["Illegal play: Please specify which direction you wish to move that piece."]);
		else
		if (/^(end|stop)$/i.test(Move))
		{
			if (game.jump)
				game.jump = false;
			else
				return exports.say(channel, ["Illegal play: You have to take your turn. Otherwise, just say \"x!latrones forfeit\"."]);
		}

		let end = 0,
			pieceCount = [0, 0],
			trapCount = [0, 0];
		for (let x = 0; x < 8; x++)
		{
			for (let y = 0; y < 8; y++)
			{
				if (isPiece([x, y], 0)) pieceCount[0]++;
				if (isPiece([x, y], 1)) pieceCount[1]++;
				if (isPiece([x, y], 0, true)) trapCount[0]++;
				if (isPiece([x, y], 1, true)) trapCount[0]++;
			}
		}

		let hasMove = false;
		for (let x = 0; x < 8; x++)
		{
			for (let y = 0; y < 8; y++)
			{
				if (isPiece([x, y], [1, 0][game.turn]))
				{
					for (let d = 0; d < 4; d++)
					{
						let xy1 = getDir([x, y], d, 1),
							xy2 = getDir([x, y], d, 2),
							xy3 = getDir([x, y], d, 3),
							xy4 = getDir([x, y], d, 4);

						if (isPiece(xy1, 3))
						{
							let D = (d + 1) % 2,
								R = D + 1,
								DIR1 = getDir(xy1, D, 1),
								DIR2 = getDir(xy1, D, 2),
								RIR1 = getDir(xy1, R, 1),
								RIR2 = getDir(xy1, R, 2);
							if (!(isPiece(DIR1, game.turn) && isPiece(RIR1, game.turn) && !isPiece(DIR2, [1, 0][game.turn]) && !isPiece(RIR2, [1, 0][game.turn])))
							{
								hasMove = true;
								break;
							}
						}
						if (!isPiece(xy1, 3) && isPiece(xy2, 3) && (!isPiece(xy3, game.turn) || (isPiece(xy3, game.turn) && isPiece(xy4, [1, 0][game.turn]))))
						{
							let D = (d + 1) % 2,
								R = D + 1,
								DIR1 = getDir(xy2, D, 1),
								DIR2 = getDir(xy2, D, 2),
								RIR1 = getDir(xy2, R, 1),
								RIR2 = getDir(xy2, R, 2);
							if (!(isPiece(DIR1, game.turn) && isPiece(RIR1, game.turn) && !isPiece(DIR2, [1, 0][game.turn]) && !isPiece(RIR2, [1, 0][game.turn])))
							{
								hasMove = true;
								break;
							}
						}
					}
				}
				else
				if (isPiece([x, y], game.turn, true))
				{
					hasMove = true;
					break;
				}
			}
		}

		if (pieceCount[0] == 1)
			end = 1,
			game.winner = 1;
		else
		if (pieceCount[1] == 1)
			end = 1,
			game.winner = 0;
		else
		if (pieceCount[[1, 0][game.turn]] == trapCount[[1, 0][game.turn]])
			end = 2,
			game.winner = game.turn;
		else
		if (!hasMove)
			end = 3,
			game.winner = game.turn;
		else
		if (!game.jump)
			game.turn = [1, 0][game.turn],
			game.player = game.players[game.turn];
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
Canvas.loadImage(`/app/assets/games/${shortname}/phase1.png`).then(image => {
	exports.Images.phase1 = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/phase2.png`).then(image => {
	exports.Images.phase2 = image;
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
Canvas.loadImage(`/app/assets/games/${shortname}/capture.png`).then(image => {
	exports.Images.capture = image;
});
Canvas.loadImage(`/app/assets/games/${shortname}/free.png`).then(image => {
	exports.Images.free = image;
});