const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Rokumoku";
var shortname = "rokumoku";
 
exports.newGame = function(channel, player, here) {
    let game = {
        buffer: {},
        channels: {},
        forfeit: false,
        game: shortname,
        here: here,
        lastDisplays: [],
        oneChannel: here,
        over: false,
        player: false,
        players: [player],
        started: false,
        turn: 0.5
    };
    game.channels[channel] = [];
    games.push(game);

    let _ = false;
    game.board = [];
    for (let i = 19; i--;)
    {
        let row = [];
        for (let i = 19; i--;)
        {
            row.push(_);
        }
        game.board.push(row);
    }
 
    game.timer = {
        time: 900,
        message: `It appears nobody wants to play right now, <@${player1}>.`
    }

    exports.say(game.channels, [`<@${player}> is now requesting a new game of ${gamename}!`, {}]);
}
 
exports.startGame = function(channel1, channel2, player2) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel1))[0];
    if (channel1 !== channel2) game.channels[channel2] = [];
    game.players[1] = player2;
    game.started = true;
 
    if ((Math.random() * 2 | 0) == 0) game.players.reverse();
    game.player = game.players[0];
 
    game.timer = {
        time: 600,
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }

    game.buffer = new Discord.Attachment(exports.drawBoard(game, 0), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be Black, and <@${game.players[1]}> will be White!\nUse the command \"x!${shortname} rules\" if you don't know how to play the game!`, game.buffer]);
}
 
exports.drawBoard = function(game, end) {
    let canvas = new Canvas.createCanvas(321, 346);
    let ctx = canvas.getContext('2d');
      
    ctx.drawImage(exports.Images.board, 0, 0);

    if (end === 0)
    {
        ctx.drawImage(exports.Images[["black", "white"][Math.floor(game.turn)] + "Text"], 20, 6);
        ctx.drawImage(exports.Images.turn, 76, 4);
    }
    else
    if (end === 1)
    {
        ctx.drawImage(exports.Images[["black", "white"][game.winner] + "Text"], 20, 6);
        ctx.drawImage(exports.Images.win, 81, 6);
    }
    else
    if (end === 2)
    {
        ctx.drawImage(exports.Images.tie, 20, 6);
        game.highlight = [];
    }
    
    for (let x = 0; x < 10; x++)
    {
        for (let y = 0; y < 10; y++)
        {
            for (let h = 0; h < game.highlight.length; h++)
            {
                if (game.highlight[h][0] == x && game.highlight[h][1] == y)
                {
                    ctx.drawImage(exports.Images[end == 0 ? "highlight" : "winHighlight"], 17 + (y * 25), 30 + (x * 25));
                }
            }
            if (game.board[x][y] !== false)
            {
                ctx.drawImage(exports.Images[["black", "white"][game.board[x][y]]], 17 + (y * 25), 30 + (x * 25));
            }
        }
    }

    return canvas.toBuffer();
}
 
exports.takeTurn = function(channel, Move) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
    let move = [Move.match(/[0-9]{1,2}/)[0] - 1, 'abcdefghijkl'.indexOf(Move.toLowerCase().match(/[a-z]/)[0])];

    if (game.board[move[0]][move[1]] !== false)
    {
        return exports.say(game.channels, ["Someone has aleady played there, pick another spot!", {}]);
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

    let a = game.board;
    let b = Math.floor(game.turn);
    let e = [-1, 0, 1, 1];
    let f = [1, 1, 1, 0];
    for (let d = 0; d < 4; d++)
    {
        for (let y = [5, 0, 0, 0][d]; y < [12, 12, 7, 7][d]; y++)
        {
            for (let x = 0; d < [12, 7, 7, 12][d]; x++)
            {
                if (![
                    a[y][x],
                    a[y + (e[d] * 1)][x + (f[d] * 1)],
                    a[y + (e[d] * 2)][x + (f[d] * 2)],
                    a[y + (e[d] * 3)][x + (f[d] * 3)],
                    a[y + (e[d] * 4)][x + (f[d] * 4)],
                    a[y + (e[d] * 5)][x + (f[d] * 5)]
                ].some(c => c != b))
                {
                    game.highlight = [
                        a[y][x],
                        a[y + (e[d] * 1)][x + (f[d] * 1)],
                        a[y + (e[d] * 2)][x + (f[d] * 2)],
                        a[y + (e[d] * 3)][x + (f[d] * 3)],
                        a[y + (e[d] * 4)][x + (f[d] * 4)],
                        a[y + (e[d] * 5)][x + (f[d] * 5)]
                    ];
                    end = 1;
                }
            }
        }
    }

    if (game.turn == Math.floor(game.turn))
    {
        game.highlight = [move];
    }
    else
    {
        game.highlight.push(move);
    }

    if (end == 1)
    {
        game.winner = game.players[Math.floor(game.turn)];
    }
     
    exports.nextTurn(channel, end, highlight, row);
}
 
exports.nextTurn = function(channel, end, highlight, row) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
    if (end == 0)
    {
        game.turn = game.turn == 1.5 ? 0 : game.turn += 0.5;
        game.player = game.players[Math.floor(game.turn)];
        game.timer = {
            time: 600,
            message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
        }
    }
    else
    {
        game.winner = game.turn;
    }
    game.buffer = new Discord.Attachment(exports.drawBoard(game, end, highlight, row), end == 1 ? `${shortname}_${end}_${game.winner}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
    for (let ch in game.channels)
    {
        for (let i = 0; i < game.channels[ch].length; i++)
        {
            client.channels.get(ch).messages.get(game.channels[ch][i]).delete();
        }
        game.channels[ch] = [];
    }

    exports.say(game.channels, [end == 0 ? `It is <@${game.player}>'s turn` : end == 1 ? `<@${game.player}> has won!` : `Tie game, everyone loses!`, game.buffer]);
}

exports.say = function(channels, message) {
    for (let i in channels)
    {
        client.channels.get(i).send(message[0], message[1]);
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