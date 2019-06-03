const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Connect Four";
var shortname = "connect4";
 
exports.newGame = function(channel, player) {
    let game = {
        buffer: {},
        channels: [channel],
        forfeit: false,
        game: shortname,
        lastDisplays: [],
        lastmove: '',
        player: false,
        players: [player],
        RE: /^[1-7]$/,
        started: false,
        turn: 0
    };
    games.push(game);

    game.board = [[],[],[],[],[],[],[]];
 
    game.timer = {
        time: 9000,
        message: `It appears nobody wants to play right now, <@${player}>.`
    }

    exports.say([channel], [`<@${player}> is now requesting a new game of ${gamename}!`, game.buffer]);
}

exports.startGame = function(channel1, channel2, player2) {
    let game = games.filter(game => game.channels.includes(channel1))[0];
    if (channel1 !== channel2) game.channels.push(channel2);
    game.players[1] = player2;
    game.started = true;
 
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
    game.player = game.players[0];
 
    game.timer = {
        time: 6000,
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }

    game.buffer = new Discord.Attachment(exports.drawBoard(game, 0), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be Red, and <@${game.players[1]}> will be Blue!`, game.buffer]);
}
 
exports.drawBoard = function(game, end, highlight) {
    let canvas = new Canvas.createCanvas(184, 195);
    let ctx = canvas.getContext("2d");
     
    ctx.drawImage(exports.Images.board, 0, 0);

    if (end == 0)
    {
        ctx.drawImage(exports.Images[["red", "blue"][game.turn] + "Text"], 26, 6);
        ctx.drawImage(exports.Images.turn, 45 + (13 * game.turn), 5);
    }
    else
    if (end == 1)
    {
        ctx.drawImage(exports.Images[["red", "blue"][game.turn] + "Text"], 26, 6);
        ctx.drawImage(exports.Images.win, 51 + (13 * game.turn), 7);
    }
    else
    if (end == 2)
    {
        ctx.drawImage(exports.Images.tie, 8, 7);
    }

    for (let i = 0; i < 7; i++)
    {
        for (let ii = 0; ii < game.board[i].length; ii++)
        {
            ctx.drawImage(exports.Images[["red", "blue"][game.board[i][ii]]], 6 + (25 * i), 30 + (25 * (5 - ii)));
            
            if (end === 1 && highlight.filter(x => { return x[0] == i && x[1] == ii; }).length == 1)
            {
                ctx.drawImage(exports.Images.winHighlight, 6 + (25 * i), 30 + (25 * (5 - ii)));
            }
        }

        if (end === 0 && highlight !== false && highlight == i)
        {
            ctx.drawImage(exports.Images.highlight, 6 + (25 * i), 30 + (25 * (6 - game.board[i].length)));
        }
    }
     
    return canvas.toBuffer();
}
 
exports.takeTurn = function(channel, move) {
    let game = games.filter(game => game.channels.includes(channel))[0];
     
    // Function will vary with game
    let x = move - 1;
    if (game.board[x].length == 6)
    {
        exports.say([channel], ["This column is full, please pick another!", {}]);
    }

    game.board[x].push(game.turn);
    let highlight = x;
 
    let end = 2;
    for (let i = 7; i--;)
    {
        if (game.board[i].length < 6)
        {
            end = 0;
            break;
        }
    }
    for (let i = 0; i < 4; i++)
    {
        for (let x = 0; x < 6; x++)
        {
            if (x < 3)
            {
                if (game.board[i][x] == game.turn && game.board[i + 1][x] == game.turn && game.board[i + 2][x] == game.turn && game.board[i + 3][x] == game.turn)
                {
                    highlight = [[i, x], [i + 1, x], [i + 2, x], [i + 3, x]];
                    end = 1;
                    break;
                }
                if (game.board[i][x] == game.turn && game.board[i + 1][x + 1] == game.turn && game.board[i + 2][x + 2] == game.turn && game.board[i + 3][x + 3] == game.turn)
                {
                    highlight = [[i, x], [i + 1, x + 1], [i + 2, x + 2], [i + 3, x + 3]];
                    end = 1;
                    break;
                }
                if (game.board[i][x] == game.turn && game.board[i][x + 1] == game.turn && game.board[i][x + 2] == game.turn && game.board[i][x + 3] == game.turn)
                {
                    highlight = [[i, x], [i, x + 1], [i, x + 2], [i, x + 3]];
                    end = 1;
                    break;
                }
            }
            else
            {
                if (game.board[i][x] == game.turn && game.board[i + 1][x] == game.turn && game.board[i + 2][x] == game.turn && game.board[i + 3][x] == game.turn)
                {
                    highlight = [[i, x], [i + 1, x], [i + 2, x], [i + 3, x]];
                    end = 1;
                    break;
                }
                if (game.board[i][x] == game.turn && game.board[i + 1][x - 1] == game.turn && game.board[i + 2][x - 2] == game.turn && game.board[i + 3][x - 3] == game.turn)
                {
                    highlight = [[i, x], [i + 1, x - 1], [i + 2, x - 2], [i + 3, x - 3]];
                    end = 1;
                    break;
                }
                if (game.board[i][x] == game.turn && game.board[i][x - 1] == game.turn && game.board[i][x - 2] == game.turn && game.board[i][x - 3] == game.turn)
                {
                    highlight = [[i, x], [i, x - 1], [i, x - 2], [i, x - 3]];
                    end = 1;
                    break;
                }
            }
        }
    }
    //

    if (end !== 0)
    {
        game.winner = game.turn;
    }
     
    exports.nextTurn(channel, end, highlight);
}
 
exports.nextTurn = function(channel, end, highlight) {
    let game = games.filter(game => game.channels.includes(channel))[0];
    if (end == 0)
    {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
        game.timer = {
            time: 6000,
            message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
        }
    }
    game.buffer = new Discord.Attachment(exports.drawBoard(game, end, highlight), end == 1 ? `${shortname}_${end}_${game.players[game.winner]}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
    
    for (let i = 0; i < game.lastDisplays.length; i++)
    {
        game.lastDisplays[i].delete();
    }

    exports.say(game.channels, [end == 0 ? `It is <@${game.player}>'s turn.` : end == 1 ? `<@${game.player}> has won!` : "Tie game, everyone loses!", game.buffer]);
}

exports.say = function(channels, message) {
    for (let i = 0; i < channels.length; i++)
    {
        client.channels.get(channels[i]).send(message[0], message[1]);
    }
}

// Images

exports.Images = {};

Canvas.loadImage("./img/gameAssets/connect4/board.png").then(image => {
    exports.Images.board = image;
});
Canvas.loadImage("./img/gameAssets/connect4/red.png").then(image => {
    exports.Images.red = image;
});
Canvas.loadImage("./img/gameAssets/connect4/blue.png").then(image => {
    exports.Images.blue = image;
});
Canvas.loadImage("./img/gameAssets/connect4/redText.png").then(image => {
    exports.Images.redText = image;
});
Canvas.loadImage("./img/gameAssets/connect4/blueText.png").then(image => {
    exports.Images.blueText = image;
});
Canvas.loadImage("./img/gameAssets/connect4/turn.png").then(image => {
    exports.Images.turn = image;
});
Canvas.loadImage("./img/gameAssets/connect4/win.png").then(image => {
    exports.Images.win = image;
});
Canvas.loadImage("./img/gameAssets/connect4/highlight.png").then(image => {
    exports.Images.highlight = image;
});
Canvas.loadImage("./img/gameAssets/connect4/winHighlight.png").then(image => {
    exports.Images.winHighlight = image;
});
Canvas.loadImage("./img/gameAssets/connect4/tie.png").then(image => {
    exports.Images.tie = image;
});