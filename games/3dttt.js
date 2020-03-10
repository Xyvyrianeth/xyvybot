const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "3D Tic Tac Toe";
var shortname = "ttt3d";

exports.newGame = function(channel, player, here) {
    let time = new Date();
    let game = {
        buffer:  {},
		canHaveTurn: true,
        channels: {},
        forfeit:  false,
        game: shortname,
        here: here,
        lastDisplays: [],
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

    game.board = {
        '1': {
            'A': [false, false, false, false],
            'B': [false, false, false, false],
            'C': [false, false, false, false],
            'D': [false, false, false, false],
        },
        '2': {
            'A': [false, false, false, false],
            'B': [false, false, false, false],
            'C': [false, false, false, false],
            'D': [false, false, false, false],
        },
        '3': {
            'A': [false, false, false, false],
            'B': [false, false, false, false],
            'C': [false, false, false, false],
            'D': [false, false, false, false],
        },
        '4': {
            'A': [false, false, false, false],
            'B': [false, false, false, false],
            'C': [false, false, false, false],
            'D': [false, false, false, false],
        }
    };

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
        message: "Whoops, it looks like <@" + game.players[0] + "> has run out of time, so the game is over!"
    }

    game.buffer = new Discord.MessageAttachment(exports.drawBoard(game, 0, false, true), `${shortname}_0.png`);
    exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be **X**, and <@${game.players[1]}> will be **O**!\nUse the command \"x!${shortname} rules\" if you don't know how to play the game!`, game.buffer]);
}

exports.drawBoard = function(game, end, highlight, firstDisp) {
    let canvas = new Canvas.createCanvas(316, 230);
    let ctx = canvas.getContext('2d');

    ctx.drawImage(exports.Images.board, 0, 0);

    for (let x = 0; x < 4; x++)
        for (let y = 0; y < 4; y++)
            for (let z = 0; z < 4; z++)
            {
                if (game.board[x + 1][(y + 10).toString(14).toUpperCase()][z] !== false)
                    ctx.drawImage(exports.Images[game.board[x + 1][(y + 10).toString(14).toUpperCase()][z].toUpperCase()], [7, 145, 55, 193][x] + (y * 8) + (z * 20), [6, 54, 102, 150][x] + (y * 16));

                if (end === 0 && highlight !== false && (x + 1) + (y + 10).toString(14).toUpperCase() + z == highlight)
                    ctx.drawImage(exports.Images[game.board[x + 1][(y + 10).toString(14).toUpperCase()][z].toUpperCase() + "Highlight"], [7, 145, 55, 193][x] + (y * 8) + (z * 20), [6, 54, 102, 150][x] + (y * 16));
                else
                if (end === 1 && highlight.includes((x + 1) + (y + 10).toString(14).toUpperCase() + z))
                    ctx.drawImage(exports.Images[game.board[x + 1][(y + 10).toString(14).toUpperCase()][z].toUpperCase() + "WinHighlight"], [7, 145, 55, 193][x] + (y * 8) + (z * 20), [6, 54, 102, 150][x] + (y * 16));
            }

	let newCanvas = new Canvas.createCanvas(316, 230);
	let newCtx = newCanvas.getContext('2d');
	let data = ctx.getImageData(0, 0, 316, 230);
	newCtx.putImageData(data, 0, 0);
	game.replayData.push(newCtx);

    if (end === 0 || end === 1)
    {
        ctx.drawImage(exports.Images["XO"[game.turn] + "text"], 140, 10);
        ctx.drawImage(exports.Images[["turn", "win"][end]], 167 + (10 * end), 10 + (2 * end));
    }
    else
    if (end === 2)
        ctx.drawImage(exports.Images.tie, 140, 10);

    if (firstDisp)
        ctx.drawImage(exports.Images.firstDisp, 72, 193);

    return canvas.toBuffer();
}

exports.takeTurn = function(channel, move) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
	game.canHaveTurn = false;

    let X = move.match(/[1-4]/g)[0];
    let Y = move.match(/[a-d]/i)[0].toUpperCase();
    let Z = move.match(/[1-4]/g)[1] - 1;
    let XO = 'XO'[game.turn];

    if (game.board[X][Y][Z] !== false)
    {
		game.canHaveTurn = true;
        return exports.say(game.channels, ["Illegal move: this space is not empty.", {}]);
    }
    else
    {
        game.board[X][Y][Z] = XO;
    }

    let end = 2;
    for (let x = 0; x < 4; x++)
    {
        for (let y = 0; y < 4; y++)
        {
            for (let z = 0; z < 4; z++)
            {
                if (game.board[x + 1][(y + 10).toString(14).toUpperCase()][z] == false)
                {
                    end = 0;
                    break;
                }
            }
        }
    }

    let wins = [
        [['1', 'A', 0], ['1', 'A', 1], ['1', 'A', 2], ['1', 'A', 3]],
        [['1', 'B', 0], ['1', 'B', 1], ['1', 'B', 2], ['1', 'B', 3]],
        [['1', 'C', 0], ['1', 'C', 1], ['1', 'C', 2], ['1', 'C', 3]],
        [['1', 'D', 0], ['1', 'D', 1], ['1', 'D', 2], ['1', 'D', 3]],
        [['2', 'A', 0], ['2', 'A', 1], ['2', 'A', 2], ['2', 'A', 3]],
        [['2', 'B', 0], ['2', 'B', 1], ['2', 'B', 2], ['2', 'B', 3]],
        [['2', 'C', 0], ['2', 'C', 1], ['2', 'C', 2], ['2', 'C', 3]],
        [['2', 'D', 0], ['2', 'D', 1], ['2', 'D', 2], ['2', 'D', 3]],
        [['3', 'A', 0], ['3', 'A', 1], ['3', 'A', 2], ['3', 'A', 3]],
        [['3', 'B', 0], ['3', 'B', 1], ['3', 'B', 2], ['3', 'B', 3]],
        [['3', 'C', 0], ['3', 'C', 1], ['3', 'C', 2], ['3', 'C', 3]],
        [['3', 'D', 0], ['3', 'D', 1], ['3', 'D', 2], ['3', 'D', 3]],
        [['4', 'A', 0], ['4', 'A', 1], ['4', 'A', 2], ['4', 'A', 3]],
        [['4', 'B', 0], ['4', 'B', 1], ['4', 'B', 2], ['4', 'B', 3]],
        [['4', 'C', 0], ['4', 'C', 1], ['4', 'C', 2], ['4', 'C', 3]],
        [['4', 'D', 0], ['4', 'D', 1], ['4', 'D', 2], ['4', 'D', 3]],

        [['1', 'A', 0], ['1', 'B', 0], ['1', 'C', 0], ['1', 'D', 0]],
        [['1', 'A', 1], ['1', 'B', 1], ['1', 'C', 1], ['1', 'D', 1]],
        [['1', 'A', 2], ['1', 'B', 2], ['1', 'C', 2], ['1', 'D', 2]],
        [['1', 'A', 3], ['1', 'B', 3], ['1', 'C', 3], ['1', 'D', 3]],
        [['2', 'A', 0], ['2', 'B', 0], ['2', 'C', 0], ['2', 'D', 0]],
        [['2', 'A', 1], ['2', 'B', 1], ['2', 'C', 1], ['2', 'D', 1]],
        [['2', 'A', 2], ['2', 'B', 2], ['2', 'C', 2], ['2', 'D', 2]],
        [['2', 'A', 3], ['2', 'B', 3], ['2', 'C', 3], ['2', 'D', 3]],
        [['3', 'A', 0], ['3', 'B', 0], ['3', 'C', 0], ['3', 'D', 0]],
        [['3', 'A', 1], ['3', 'B', 1], ['3', 'C', 1], ['3', 'D', 1]],
        [['3', 'A', 2], ['3', 'B', 2], ['3', 'C', 2], ['3', 'D', 2]],
        [['3', 'A', 3], ['3', 'B', 3], ['3', 'C', 3], ['3', 'D', 3]],
        [['4', 'A', 0], ['4', 'B', 0], ['4', 'C', 0], ['4', 'D', 0]],
        [['4', 'A', 1], ['4', 'B', 1], ['4', 'C', 1], ['4', 'D', 1]],
        [['4', 'A', 2], ['4', 'B', 2], ['4', 'C', 2], ['4', 'D', 2]],
        [['4', 'A', 3], ['4', 'B', 3], ['4', 'C', 3], ['4', 'D', 3]],

        [['1', 'A', 0], ['2', 'A', 0], ['3', 'A', 0], ['4', 'A', 0]],
        [['1', 'A', 1], ['2', 'A', 1], ['3', 'A', 1], ['4', 'A', 1]],
        [['1', 'A', 2], ['2', 'A', 2], ['3', 'A', 2], ['4', 'A', 2]],
        [['1', 'A', 3], ['2', 'A', 3], ['3', 'A', 3], ['4', 'A', 3]],
        [['1', 'B', 0], ['2', 'B', 0], ['3', 'B', 0], ['4', 'B', 0]],
        [['1', 'B', 1], ['2', 'B', 1], ['3', 'B', 1], ['4', 'B', 1]],
        [['1', 'B', 2], ['2', 'B', 2], ['3', 'B', 2], ['4', 'B', 2]],
        [['1', 'B', 3], ['2', 'B', 3], ['3', 'B', 3], ['4', 'B', 3]],
        [['1', 'C', 0], ['2', 'C', 0], ['3', 'C', 0], ['4', 'C', 0]],
        [['1', 'C', 1], ['2', 'C', 1], ['3', 'C', 1], ['4', 'C', 1]],
        [['1', 'C', 2], ['2', 'C', 2], ['3', 'C', 2], ['4', 'C', 2]],
        [['1', 'C', 3], ['2', 'C', 3], ['3', 'C', 3], ['4', 'C', 3]],
        [['1', 'D', 0], ['2', 'D', 0], ['3', 'D', 0], ['4', 'D', 0]],
        [['1', 'D', 1], ['2', 'D', 1], ['3', 'D', 1], ['4', 'D', 1]],
        [['1', 'D', 2], ['2', 'D', 2], ['3', 'D', 2], ['4', 'D', 2]],
        [['1', 'D', 3], ['2', 'D', 3], ['3', 'D', 3], ['4', 'D', 3]],

        [['1', 'A', 0], ['1', 'B', 1], ['1', 'C', 2], ['1', 'D', 3]],
        [['2', 'A', 0], ['2', 'B', 1], ['2', 'C', 2], ['2', 'D', 3]],
        [['3', 'A', 0], ['3', 'B', 1], ['3', 'C', 2], ['3', 'D', 3]],
        [['4', 'A', 0], ['4', 'B', 1], ['4', 'C', 2], ['4', 'D', 3]],
        [['1', 'D', 0], ['1', 'C', 1], ['1', 'B', 2], ['1', 'A', 3]],
        [['2', 'D', 0], ['2', 'C', 1], ['2', 'B', 2], ['2', 'A', 3]],
        [['3', 'D', 0], ['3', 'C', 1], ['3', 'B', 2], ['3', 'A', 3]],
        [['4', 'D', 0], ['4', 'C', 1], ['4', 'B', 2], ['4', 'A', 3]],

        [['1', 'A', 0], ['2', 'A', 1], ['3', 'A', 2], ['4', 'A', 3]],
        [['1', 'B', 0], ['2', 'B', 1], ['3', 'B', 2], ['4', 'B', 3]],
        [['1', 'C', 0], ['2', 'C', 1], ['3', 'C', 2], ['4', 'C', 3]],
        [['1', 'D', 0], ['2', 'D', 1], ['3', 'D', 2], ['4', 'D', 3]],
        [['1', 'A', 3], ['2', 'A', 2], ['3', 'A', 1], ['4', 'A', 0]],
        [['1', 'B', 3], ['2', 'B', 2], ['3', 'B', 1], ['4', 'B', 0]],
        [['1', 'C', 3], ['2', 'C', 2], ['3', 'C', 1], ['4', 'C', 0]],
        [['1', 'D', 3], ['2', 'D', 2], ['3', 'D', 1], ['4', 'D', 0]],

        [['1', 'A', 0], ['2', 'B', 0], ['3', 'C', 0], ['4', 'D', 0]],
        [['1', 'A', 1], ['2', 'B', 1], ['3', 'C', 1], ['4', 'D', 1]],
        [['1', 'A', 2], ['2', 'B', 2], ['3', 'C', 2], ['4', 'D', 2]],
        [['1', 'A', 3], ['2', 'B', 3], ['3', 'C', 3], ['4', 'D', 3]],
        [['1', 'D', 0], ['2', 'C', 0], ['3', 'B', 0], ['4', 'A', 0]],
        [['1', 'D', 1], ['2', 'C', 1], ['3', 'B', 1], ['4', 'A', 1]],
        [['1', 'D', 2], ['2', 'C', 2], ['3', 'B', 2], ['4', 'A', 2]],
        [['1', 'D', 3], ['2', 'C', 3], ['3', 'B', 3], ['4', 'A', 3]],

        [['1', 'A', 0], ['2', 'B', 1], ['3', 'C', 2], ['4', 'D', 3]],
        [['1', 'D', 3], ['2', 'C', 2], ['3', 'B', 1], ['4', 'A', 0]],
        [['1', 'A', 3], ['2', 'B', 2], ['3', 'C', 1], ['4', 'D', 0]],
        [['1', 'D', 0], ['2', 'C', 1], ['3', 'B', 2], ['4', 'A', 3]],
    ];

    let highlight = X + Y + Z;
    for (let i = 0; i < 76; i++)
    {
        let w = wins[i];
        if (
            game.board[w[0][0]][w[0][1]][w[0][2]] === XO &&
            game.board[w[1][0]][w[1][1]][w[1][2]] === XO &&
            game.board[w[2][0]][w[2][1]][w[2][2]] === XO &&
            game.board[w[3][0]][w[3][1]][w[3][2]] === XO
        )
        {
            end = 1;
            game.winner = game.turn;
            highlight = [w[0].join(''), w[1].join(''), w[2].join(''), w[3].join('')];
            break;
        }
    }

    //

    exports.nextTurn(channel, end, highlight);
}

exports.nextTurn = function(channel, end, highlight) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
    if (end == 0)
    {
        game.turn = [1, 0][game.turn];
        game.player = game.players[game.turn];
        game.timer = {
            time: 900,
            message: `Whoops, it looks like <@${game.players[game.player]}> has run out of time, so the game is over!`
        }
    }
    else
    {
        game.winner = game.turn;
    }

    game.buffer = new Discord.MessageAttachment(exports.drawBoard(game, end, highlight), [`ttt3d_0_${game.players[0]}vs${game.players[1]}.png`, `ttt3d_1_${game.players[game.winner]}.png`, 'ttt3d_2_tie'][end]);
    for (let ch in game.channels)
    {
        if (client.channels.cache.get(ch).guild.members.get(client.user.id).hasPermission("MANAGE_MESSAGES"))
            for (let i = 0; i < game.channels[ch].length; i++)
                client.channels.cache.get(ch).messages.get(game.channels[ch][i]).delete();
        game.channels[ch] = [];
    }

    exports.say(game.channels, [[`It is <@${game.players[game.turn]}>'s turn.`, `<@${game.players[game.winner]}> has won!`, "Tie game, everyone loses!"][end], game.buffer]);
}

exports.say = function(channels, message) {
    for (let i in channels)
    {
        client.channels.cache.get(i).send(message[0], message[1]);
    }
}

// Images

exports.Images = {};

Canvas.loadImage("/app/assets/games/3dttt/board.png").then(image => {
    exports.Images.board = image;
});
Canvas.loadImage("/app/assets/games/3dttt/x.png").then(image => {
    exports.Images.X = image;
});
Canvas.loadImage("/app/assets/games/3dttt/o.png").then(image => {
    exports.Images.O = image;
});
Canvas.loadImage("/app/assets/games/3dttt/Xtext.png").then(image => {
    exports.Images.Xtext = image;
});
Canvas.loadImage("/app/assets/games/3dttt/Otext.png").then(image => {
    exports.Images.Otext = image;
});
Canvas.loadImage("/app/assets/games/3dttt/turn.png").then(image => {
    exports.Images.turn = image;
});
Canvas.loadImage("/app/assets/games/3dttt/win.png").then(image => {
    exports.Images.win = image;
});
Canvas.loadImage("/app/assets/games/3dttt/xHighlight.png").then(image => {
    exports.Images.XHighlight = image;
});
Canvas.loadImage("/app/assets/games/3dttt/oHighlight.png").then(image => {
    exports.Images.OHighlight = image;
});
Canvas.loadImage("/app/assets/games/3dttt/xWinHighlight.png").then(image => {
    exports.Images.XWinHighlight = image;
});
Canvas.loadImage("/app/assets/games/3dttt/oWinHighlight.png").then(image => {
    exports.Images.OWinHighlight = image;
});
Canvas.loadImage("/app/assets/games/3dttt/tie.png").then(image => {
    exports.Images.tie = image;
});
Canvas.loadImage("/app/assets/games/3dttt/firstDisp.png").then(image => {
    exports.Images.firstDisp = image;
});