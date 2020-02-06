const Discord = require("discord.js");
const Canvas = require("canvas");
const gifEncoder = require("canvas-gif-encoder");
const fs = require("fs");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Connect Four";
var shortname = "connect4";

exports.newGame = function(channel, player, here) {
    console.log("made it here (1)");
    let encoder = new gifEncoder(184, 195);
    let stream = fs.createWriteStream(`${player}_replay.gif`);
    console.log("made it here (2)");
    encoder.createReadStream().pipe(stream);
    encoder.begin();
    console.log("made it here (3)");
    let game = {
        buffer: {},
        channels: {},
        forfeit: false,
        game: shortname,
        here: here,
        highlight: false,
        lastDisplays: [],
        over: false,
        player: false,
        players: [player],
        replayData: [encoder, `${player}_replay.gif`],
        started: false,
        turn: 0
    };
    game.channels[channel] = [];
    games.push(game);

    console.log("made it here (4)");

    game.board = [[],[],[],[],[],[],[]];

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

    if ((Math.random() * 2 | 0) == 0) game.players.reverse(); // Makes player one random instead of always the challenger
    game.player = game.players[0];

    game.timer = {
        time: 600,
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }

    game.buffer = new Discord.Attachment(exports.drawBoard(game, 0), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be Blue, and <@${game.players[1]}> will be Red!\nUse the command \"x!${shortname} rules\" if you don't know how to play the game!`, game.buffer]);
}

exports.drawBoard = function(game, end) {
    let canvas = new Canvas.createCanvas(184, 195);
	let ctx = canvas.getContext("2d");
    ctx.drawImage(exports.Images.board, 0, 0);

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

    for (let x = 0; x < 7; x++)
        for (let y = 0; y < game.board[x].length; y++)
            ctx.drawImage(exports.Images[["blue", "red"][game.board[x][y]]], 6 + (25 * x), 30 + (25 * (5 - y)));

    if (game.highlight !== false)
    {
        if (end == 0)
            ctx.drawImage(exports.Images.highlight, 6 + (25 * game.highlight), 30 + (25 * (6 - game.board[game.highlight].length)));
        else
            for (let i of game.highlight)
                ctx.drawImage(exports.Images.winHighlight, 6 + (25 * i[0]), 30 + (25 * (5 - i[1])));
    }

    game.replayData[0].addFrame(ctx, 1500);
    return canvas.toBuffer();
}

exports.takeTurn = function(channel, Move) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];

    // Function will vary with game
    let move = Move - 1;
    if (game.board[move].length == 6)
    {
        return exports.say(game.channels, ["Illegal move: this column is full.", {}]);
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

    let a = game.board;
    let b = game.turn;
    let e = [-1, 0, 1, 1];
    let f = [1, 1, 1, 0];
    for (let d = 0; d < 4; d++)
    {
        for (let x = [3, 0, 0, 0][d]; x < [6, 6, 3, 3][d]; x++)
        {
            for (let y = 0; y < [7, 3, 3, 7][d]; y++)
            {
                if (![
                    a[x][y],
                    a[x + (e[d] * 1)][y + (f[d] * 1)],
                    a[x + (e[d] * 2)][y + (f[d] * 2)],
                    a[x + (e[d] * 3)][y + (f[d] * 3)]
                ].some(c => c != b))
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

    exports.nextTurn(channel, end);
}

exports.nextTurn = function(channel, end) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
    if (end == 0)
    {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
        game.timer = {
            time: 600,
            message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
        }
    }
    else
    {
        game.winner = game.turn;
    }
    game.buffer = new Discord.Attachment(exports.drawBoard(game, end), [`${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`, `${shortname}_${end}_${game.players[game.winner]}.png`][end]);
    for (let ch in game.channels)
    {
        for (let i = 0; i < game.channels[ch].length; i++)
        {
            client.channels.get(ch).messages.get(game.channels[ch][i]).delete();
		}
		game.channels[ch] = [];
    }

    exports.say(game.channels, [[`It is <@${game.player}>'s turn.`, `<@${game.player}> has won!`, "Tie game, everyone loses!"][end], game.buffer]);
}

exports.say = function(channels, message) {
    for (let i in channels)
    {
        client.channels.get(i).send(message[0], message[1]);
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