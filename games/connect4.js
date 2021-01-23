const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Connect Four";
var shortname = "connect4";

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
        lastDisplays: [],
        over: false,
        player: false,
        players: [player],
        replayData: [],
        started: false,
		timeStart: `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
		turn: 0,
		turns: 0
    };
    game.channels[channel] = [];
    games.push(game);

    game.board = [[],[],[],[],[],[],[]];

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

    if ((Math.random() * 2 | 0) == 0) game.players.reverse(); // Makes player one random instead of always the challenger
    game.player = game.players[0];

    game.timer = {
        time: 900,
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }

    game.buffer = new Discord.MessageAttachment(exports.drawBoard(game, 0), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be Blue, and <@${game.players[1]}> will be Red!\nUse the command \"x!${shortname} rules\" if you don't know how to play the game!`, game.buffer]);
}

exports.drawBoard = function(game, end) {
    let canvas = new Canvas.createCanvas(184, 195);
	let ctx = canvas.getContext("2d");
    ctx.drawImage(exports.Images.board, 0, 0);

    for (let x = 0; x < 7; x++)
        for (let y = 0; y < game.board[x].length; y++)
            ctx.drawImage(exports.Images[["blue", "red"][game.board[x][y]]], 6 + (25 * x), 30 + (25 * (5 - y)));

    if (game.highlight !== false)
    {
        if (end !== 1)
            ctx.drawImage(exports.Images.highlight, 6 + (25 * game.highlight), 30 + (25 * (6 - game.board[game.highlight].length)));
        else
            for (let i of game.highlight)
                ctx.drawImage(exports.Images.winHighlight, 6 + (25 * i[0]), 30 + (25 * (5 - i[1])));
    }

	let newCanvas = new Canvas.createCanvas(184, 195);
	let newCtx = newCanvas.getContext('2d');
	let data = ctx.getImageData(0, 0, 184, 195);
	newCtx.putImageData(data, 0, 0);
    game.replayData.push(newCtx);

    if (end == 0)
    {
        ctx.drawImage(exports.Images[["blue", "red"][game.turn] + "Text"], 9, 6);
        ctx.drawImage(exports.Images.turn, 58 - (13 * game.turn), 4);
    }
    else
    if (end == 1)
    {
        ctx.drawImage(exports.Images[["blue", "red"][game.turn] + "Text"], 9, 6);
        ctx.drawImage(exports.Images.win, 67 - (13 * game.turn), 6);
    }
    else
    if (end == 2)
		ctx.drawImage(exports.Images.tie, 9, 6);

    return canvas.toBuffer();
}

exports.takeTurn = function(channel, Move) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	game.canHaveTurn = false;

    let move = Move - 1;
	if (game.board[move].length == 6)
	{
		game.canHaveTurn = true;
        return exports.say(channel, ["Illegal move: this column is full."]);
	}

    game.board[move].push(game.turn);
    game.highlight = move;

    let end = 2;
    for (let i = 7; i--;)
    {
        if (game.board[i].length < 6)
        {
            end = 0;
            break;
        }
    }

	let e = [1, 1, 1, 0];
    let f = [-1, 0, 1, 1];
    for (let d = 0; d < 4; d++)
    {
        for (let x = 0; x < [4, 4, 4, 7][d]; x++)
        {
            for (let y = [3, 0, 0, 0][d]; y < [6, 6, 3, 3][d]; y++)
            {
                if (![
                    game.board[x][y],
                    game.board[x + (e[d] * 1)][y + (f[d] * 1)],
                    game.board[x + (e[d] * 2)][y + (f[d] * 2)],
                    game.board[x + (e[d] * 3)][y + (f[d] * 3)]
                ].some(c => c != game.turn))
                {
                    game.highlight = [
                        [x, y],
                        [x + (e[d] * 1), y + (f[d] * 1)],
                        [x + (e[d] * 2), y + (f[d] * 2)],
                        [x + (e[d] * 3), y + (f[d] * 3)]
                    ];
					end = 1;
					break;
                }
            }
        }
    }
	game.turns += 1;
    exports.nextTurn(channel, end);
}

exports.nextTurn = function(channel, end) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
    if (end == 0)
    {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
        game.timer = {
            time: 900,
            message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
        }
    }
    else
        game.winner = game.turn;
    game.buffer = new Discord.MessageAttachment(exports.drawBoard(game, end), [`${shortname}_0_${game.players[0]}vs${game.players[1]}.png`, `${shortname}_1_${game.players[game.winner]}.png`, `${shortname}_2_tie.png`][end]);
    for (let ch in game.channels)
    {
        if (client.channels.cache.get(ch).guild.members.cache.get(client.user.id).hasPermission("MANAGE_MESSAGES"))
            for (let i = 0; i < game.channels[ch].length; i++)
                client.channels.cache.get(ch).messages.cache.get(game.channels[ch][i]).delete();
		game.channels[ch] = [];
    }

    exports.say(game.channels, [[`It is <@${game.player}>'s turn.`, `<@${game.player}> has won!`, "Tie game, everyone loses!"][end], game.buffer]);
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

Canvas.loadImage("/app/assets/games/connect4/board.png").then(image => {
    exports.Images.board = image;
});
Canvas.loadImage("/app/assets/games/connect4/red.png").then(image => {
    exports.Images.red = image;
});
Canvas.loadImage("/app/assets/games/connect4/blue.png").then(image => {
    exports.Images.blue = image;
});
Canvas.loadImage("/app/assets/games/connect4/redText.png").then(image => {
    exports.Images.redText = image;
});
Canvas.loadImage("/app/assets/games/connect4/blueText.png").then(image => {
    exports.Images.blueText = image;
});
Canvas.loadImage("/app/assets/games/connect4/turn.png").then(image => {
    exports.Images.turn = image;
});
Canvas.loadImage("/app/assets/games/connect4/win.png").then(image => {
    exports.Images.win = image;
});
Canvas.loadImage("/app/assets/games/connect4/highlight.png").then(image => {
    exports.Images.highlight = image;
});
Canvas.loadImage("/app/assets/games/connect4/winHighlight.png").then(image => {
    exports.Images.winHighlight = image;
});
Canvas.loadImage("/app/assets/games/connect4/tie.png").then(image => {
    exports.Images.tie = image;
});