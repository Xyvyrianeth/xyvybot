const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
const Jimp = require("jimp");
var gamename = "3D Tic Tac Toe";
var shortname = "3dttt";

exports.newGame = function(channel, player1, cmd, mode) {
    let game = channels[channel.id] = {game:shortname,guild:channel.guild.id,turn:0,players:[],started:false,lastmove:'',player:false,RE:/^[1-4] ?([1-4] ?[a-d]|[a-d] ?[1-4])$/i,casual:mode};
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
        time: 9000,
        message: "It appears nobody wants to play right now, <@" + player1 + ">."
    }
 
    game.players[0] = player1;
    return `**$user$** is now requesting a new game of ${gamename}, say \`x!${cmd} start\` to play against them!`;
}
 
exports.startGame = function(channel, player2) {
    let game = channels[channel.id];
    game.players[1] = player2;
    game.started = true;
 
    game.timer = {
        time: 100 * 60 * 5,
        message: "Whoops, it looks like <@" + game.players[0] + "> has run out of time, so the game is over!"
    }
 
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
    game.player = game.players[0];
    game.buffer = exports.drawBoard(game, 0, false);
    return ["The game has started!", new Discord.Attachment(game.buffer, `${shortname}_0.png`)];
}
 
exports.drawBoard = function(game, end, highlight) {
    let canvas = new Canvas.createCanvas(316, 230);
    let ctx = canvas.getContext('2d');

    let img = {
        board: new Canvas.Image,
        x: new Canvas.Image,
        o: new Canvas.Image,
        highlight: new Canvas.Image
    };

    img.board.src = Buffers.board;
    img.x.src = Buffers.x;
    img.o.src = Buffers.o;
    img.highlight.src = Buffers.highlight;

    ctx.drawImage(img.board, 0, 0);

    for (let x = 0; x < 4; x++)
    {
        for (let y = 0; y < 4; y++)
        {
            for (let z = 0; z < 4; z++)
            {
                if (highlight !== false && (x + 1) + (y + 10).toString(14).toUpperCase() + (z + 1) == highlight)
                {
                    ctx.drawImage(img.highlight, [y, 145, 55, 193][x] + (y * 6) + (z * 20), [y, 55, 103, 151][x] + (y * 16));
                }
                if (game.board[x + 1][(y + 10).toString(14).toUpperCase()][z] !== false)
                {
                    ctx.drawImage(img[
                        game.board[x + 1][(y + 10).toString(14).toUpperCase()][z]
                    ], [y, 145, 55, 193][x] + (y * 6) + (z * 20), [y, 55, 103, 151][x] + (y * 16));
                }
            }
        }
    }

    ctx.fillStyle = "#000";
    ctx.font = "bold 20px calibri";
    let f = ctx.measureText("X").width;
    ctx.fillText("X", 130, 10);
    ctx.font = "20px calibri";
    ctx.fillText("'s turn.", 130 + f, 10);

    return canvas.toBuffer();
}
 
exports.takeTurn = function(channel, move) {
    let game = channels[channel.id];
     
    // Function will vary with game
    
    //
     
    return exports.nextTurn(channel, end);
}
 
exports.nextTurn = function(channel, end) {
    let game = channels[channel.id];
    if (end == 0) {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
        game.timer = {
            time: 10 * 60 * 5,
            message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
        }
    }
    game.buffer = exports.drawBoard(game, end, highlight);
    board = new Discord.Attachment(game.buffer, `${shortname}_${end}.png`);
    if (channels[channel.id].lastDisplay) channels[channel.id].lastDisplay.delete();
    if (end != 0) {
        delete channels[channel.id];
    }
    return board;
}

// Images

Buffers = {};

Jimp.read("./img/gameAssets/3dttt/board.png").then(img => {
    img.getBuffer("image/png", (err, src) => {
        Buffers.board = src;
    });
});
Jimp.read("./img/gameAssets/3dttt/x.png").then(img => {
    img.getBuffer("image/png", (err, src) => {
        Buffers.x = src;
    });
});
Jimp.read("./img/gameAssets/3dttt/o.png").then(img => {
    img.getBuffer("image/png", (err, src) => {
        Buffers.o = src;
    });
});
Jimp.read("./img/gameAssets/3dttt/highlight.png").then(img => {
    img.getBuffer("image/png", (err, src) => {
        Buffers.highlight = src;
    });
});
