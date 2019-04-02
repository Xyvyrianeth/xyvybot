const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
var gamename = "3D Tic Tac Toe";
var shortname = "ttt3d";

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
        time: 6000,
        message: "Whoops, it looks like <@" + game.players[0] + "> has run out of time, so the game is over!"
    }
 
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
    game.player = game.players[0];
    game.buffer = exports.drawBoard(game, 0, false);
    return [`The game has started! <@${game.players[0]}> will be **X**, and <@${game.players[1]}> will be **O**!`, new Discord.Attachment(game.buffer, `${shortname}_0.png`)];
}
 
exports.drawBoard = function(game, end, highlight) {
    let canvas = new Canvas.createCanvas(316, 230);
    let ctx = canvas.getContext('2d');

    ctx.drawImage(Images.board, 0, 0);

    for (let x = 0; x < 4; x++)
    {
        for (let y = 0; y < 4; y++)
        {
            for (let z = 0; z < 4; z++)
            {
                if (end === 0 && highlight !== false && (x + 1) + (y + 10).toString(14).toUpperCase() + z == highlight)
                {
                    ctx.drawImage(Images.highlight, [7, 145, 55, 193][x] + (y * 8) + (z * 20), [6, 54, 102, 150][x] + (y * 16));
                }
                else
                if (end === 1 && highlight.includes((x + 1) + (y + 10).toString(14).toUpperCase() + z))
                {
                    ctx.drawImage(Images.winHighlight, [7, 145, 55, 193][x] + (y * 8) + (z * 20), [6, 54, 102, 150][x] + (y * 16));
                }
                if (game.board[x + 1][(y + 10).toString(14).toUpperCase()][z] !== false)
                {
                    ctx.drawImage(Images[
                        game.board[x + 1][(y + 10).toString(14).toUpperCase()][z].toLowerCase()
                    ], [7, 145, 55, 193][x] + (y * 8) + (z * 20), [6, 54, 102, 150][x] + (y * 16));
                }
            }
        }
    }

    ctx.fillStyle = "#000";
    ctx.font = "bold 20px calibri";
    let f = ctx.measureText("X").width;
    ctx.fillText("X", 130, 30);
    ctx.font = "20px calibri";
    ctx.fillText("'s turn.", 130 + f, 30);

    return canvas.toBuffer();
}
 
exports.takeTurn = function(channel, move) {
    let game = channels[channel.id];
    // Function will vary with game
    let X = move.split(' ')[0];
    let Y = move.split(' ')[1].match(/[a-d]/i)[0].toUpperCase();
    let Z = move.split(' ')[1].match(/[1-4]/)[0] - 1;
    let XO = ['X', 'O'][game.turn];

    if (game.board[X][Y][Z] !== false)
    {
        return ["Someone has aleady played there, pick another spot!", new Discord.MessageAttachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
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
        [['1', 'A', 0], ['1', 'A', 1], ['1', 'A', 2], ['1', 'A', 3]], // 0 0 0 0
        [['1', 'B', 0], ['1', 'B', 1], ['1', 'B', 2], ['1', 'B', 3]], // 1 1 1 1
        [['1', 'C', 0], ['1', 'C', 1], ['1', 'C', 2], ['1', 'C', 3]], // 2 2 2 2
        [['1', 'D', 0], ['1', 'D', 1], ['1', 'D', 2], ['1', 'D', 3]], // 3 3 3 3
        [['2', 'A', 0], ['2', 'A', 1], ['2', 'A', 2], ['2', 'A', 3]], // 4 4 4 4
        [['2', 'B', 0], ['2', 'B', 1], ['2', 'B', 2], ['2', 'B', 3]], // 5 5 5 5
        [['2', 'C', 0], ['2', 'C', 1], ['2', 'C', 2], ['2', 'C', 3]], // 6 6 6 6
        [['2', 'D', 0], ['2', 'D', 1], ['2', 'D', 2], ['2', 'D', 3]], // 7 7 7 7
        [['3', 'A', 0], ['3', 'A', 1], ['3', 'A', 2], ['3', 'A', 3]], // 8 8 8 8
        [['3', 'B', 0], ['3', 'B', 1], ['3', 'B', 2], ['3', 'B', 3]], // 9 9 9 9
        [['3', 'C', 0], ['3', 'C', 1], ['3', 'C', 2], ['3', 'C', 3]], // A A A A
        [['3', 'D', 0], ['3', 'D', 1], ['3', 'D', 2], ['3', 'D', 3]], // B B B B
        [['4', 'A', 0], ['4', 'A', 1], ['4', 'A', 2], ['4', 'A', 3]], // C C C C
        [['4', 'B', 0], ['4', 'B', 1], ['4', 'B', 2], ['4', 'B', 3]], // D D D D
        [['4', 'C', 0], ['4', 'C', 1], ['4', 'C', 2], ['4', 'C', 3]], // E E E E
        [['4', 'D', 0], ['4', 'D', 1], ['4', 'D', 2], ['4', 'D', 3]], // F F F F
        
        [['1', 'A', 0], ['1', 'B', 0], ['1', 'C', 0], ['1', 'D', 0]], // 0 1 2 3
        [['1', 'A', 1], ['1', 'B', 1], ['1', 'C', 1], ['1', 'D', 1]], // 0 1 2 3
        [['1', 'A', 2], ['1', 'B', 2], ['1', 'C', 2], ['1', 'D', 2]], // 0 1 2 3
        [['1', 'A', 3], ['1', 'B', 3], ['1', 'C', 3], ['1', 'D', 3]], // 0 1 2 3
        [['2', 'A', 0], ['2', 'B', 0], ['2', 'C', 0], ['2', 'D', 0]], // 4 5 6 7
        [['2', 'A', 1], ['2', 'B', 1], ['2', 'C', 1], ['2', 'D', 1]], // 4 5 6 7
        [['2', 'A', 2], ['2', 'B', 2], ['2', 'C', 2], ['2', 'D', 2]], // 4 5 6 7
        [['2', 'A', 3], ['2', 'B', 3], ['2', 'C', 3], ['2', 'D', 3]], // 4 5 6 7
        [['3', 'A', 0], ['3', 'B', 0], ['3', 'C', 0], ['3', 'D', 0]], // 8 9 A B
        [['3', 'A', 1], ['3', 'B', 1], ['3', 'C', 1], ['3', 'D', 1]], // 8 9 A B
        [['3', 'A', 2], ['3', 'B', 2], ['3', 'C', 2], ['3', 'D', 2]], // 8 9 A B
        [['3', 'A', 3], ['3', 'B', 3], ['3', 'C', 3], ['3', 'D', 3]], // 8 9 A B
        [['4', 'A', 0], ['4', 'B', 0], ['4', 'C', 0], ['4', 'D', 0]], // C D E F
        [['4', 'A', 1], ['4', 'B', 1], ['4', 'C', 1], ['4', 'D', 1]], // C D E F
        [['4', 'A', 2], ['4', 'B', 2], ['4', 'C', 2], ['4', 'D', 2]], // C D E F
        [['4', 'A', 3], ['4', 'B', 3], ['4', 'C', 3], ['4', 'D', 3]], // C D E F

        [['1', 'A', 0], ['2', 'A', 0], ['3', 'A', 0], ['4', 'A', 0]], // 0 1 2 3
        [['1', 'A', 1], ['2', 'A', 1], ['3', 'A', 1], ['4', 'A', 1]], // 4 5 6 7
        [['1', 'A', 2], ['2', 'A', 2], ['3', 'A', 2], ['4', 'A', 2]], // 8 9 A B
        [['1', 'A', 3], ['2', 'A', 3], ['3', 'A', 3], ['4', 'A', 3]], // C D E F
        [['1', 'A', 0], ['2', 'A', 0], ['3', 'A', 0], ['4', 'A', 0]], // 0 1 2 3
        [['1', 'A', 1], ['2', 'A', 1], ['3', 'A', 1], ['4', 'A', 1]], // 4 5 6 7
        [['1', 'A', 2], ['2', 'A', 2], ['3', 'A', 2], ['4', 'A', 2]], // 8 9 A B
        [['1', 'A', 3], ['2', 'A', 3], ['3', 'A', 3], ['4', 'A', 3]], // C D E F
        [['1', 'A', 0], ['2', 'A', 0], ['3', 'A', 0], ['4', 'A', 0]], // 0 1 2 3
        [['1', 'A', 1], ['2', 'A', 1], ['3', 'A', 1], ['4', 'A', 1]], // 4 5 6 7
        [['1', 'A', 2], ['2', 'A', 2], ['3', 'A', 2], ['4', 'A', 2]], // 8 9 A B
        [['1', 'A', 3], ['2', 'A', 3], ['3', 'A', 3], ['4', 'A', 3]], // C D E F
        [['1', 'A', 0], ['2', 'A', 0], ['3', 'A', 0], ['4', 'A', 0]], // 0 1 2 3
        [['1', 'A', 1], ['2', 'A', 1], ['3', 'A', 1], ['4', 'A', 1]], // 4 5 6 7
        [['1', 'A', 2], ['2', 'A', 2], ['3', 'A', 2], ['4', 'A', 2]], // 8 9 A B
        [['1', 'A', 3], ['2', 'A', 3], ['3', 'A', 3], ['4', 'A', 3]], // C D E F

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
        [['1', 'A', 0], ['2', 'B', 1], ['3', 'C', 2], ['4', 'D', 3]],
        [['1', 'D', 3], ['2', 'C', 2], ['3', 'B', 1], ['4', 'A', 0]],
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
     
    return exports.nextTurn(channel, end, highlight);
}
 
exports.nextTurn = function(channel, end, highlight) {
    let game = channels[channel.id];
    if (end == 0)
    {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
        game.timer = {
            time: 6000,
            message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
        }
    }
    game.buffer = exports.drawBoard(game, end, highlight);
    board = new Discord.Attachment(game.buffer, end == 1 ? `${shortname}_${end}_${game.players[game.winner]}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
    if (channels[channel.id].lastDisplay)
    {
        channels[channel.id].lastDisplay.delete();
    }
    if (end != 0)
    {
        delete channels[channel.id];
    }
    return [end == 0 ? `It is <@${game.player}>'s turn.` : end == 1 ? `<@${game.winner}> has won!` : "Tie game, everyone loses!", board];
}

// Images

Images = {};

Canvas.loadImage("./img/gameAssets/3dttt/board.png").then(image => {
    Images.board = image;
});
Canvas.loadImage("./img/gameAssets/3dttt/x.png").then(image => {
    Images.x = image;
});
Canvas.loadImage("./img/gameAssets/3dttt/o.png").then(image => {
    Images.o = image;
});
Canvas.loadImage("./img/gameAssets/3dttt/highlight.png").then(image => {
    Images.highlight = image;
});
Canvas.loadImage("./img/gameAssets/3dttt/winHighlight.png").then(image => {
    Images.winHighlight = image;
})