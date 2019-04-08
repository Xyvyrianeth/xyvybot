const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
var gamename = "Othello";
var shortname = "othello";
  
exports.newGame = function(channel, player1, cmd, mode) {
    channels[channel.id] = {game:shortname,guild:channel.guild.id,turn:0,players:[],started:false,lastmove:'',over:false,player:false,RE:/^([a-h][1-8]|[1-8][a-h])$/i,casual:mode,highlight:[],score:[0,0]};
    game = channels[channel.id];

    let _ = false;
    game.board = [];
    for (let i = 8; i--;)
    {
        let row = [];
        for (let i = 8; i--;)
        {
            row.push(_);
        }
        game.board.push(row);
    }
    game.possible = [
        [2, 3, [
            [1, 0, 2]
        ]],
        [3, 2, [
            [0, 1, 2]
        ]],
        [4, 5, [
            [0, -1, 2]
        ]],
        [5, 4, [
            [-1, 0, 2]
        ]]
    ];
    game.board[3][4] = 0;
    game.board[3][3] = 1;
    game.board[4][4] = 1;
    game.board[4][3] = 0;
    game.board[2][3] = true;
    game.board[3][2] = true;
    game.board[4][5] = true;
    game.board[5][4] = true;
  
    game.timer = {
        time: 9000,
        message: `It appears nobody wants to play right now, <@${player1}>.`
    }
  
    game.players[0] = player1;
    return `**$user$** is now requesting a new game of ${gamename}, say \`x!${cmd} start\` to play against them!`;
}

exports.startGame = function(channel, player2) {
    game = channels[channel.id];
    game.players[1] = player2;
    game.started = true;
  
    game.timer = {
        time: 6000,
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }
  
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
    game.player = game.players[0];
    game.buffer = exports.drawBoard(game, 0);

    return [`The game has started! <@${game.players[0]}> will be black, and <@${game.players[1]}> will be white!\n\nThe small green circles are the places you can put a stone.\nTo place a stone, say the letter of the row and the number of the column, like "f4".`, new Discord.Attachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
}
  
exports.drawBoard = function(game, end) {
    let canvas = new Canvas.createCanvas(221, 246);
    let ctx = canvas.getContext('2d');
      
    ctx.drawImage(exports.Images.board, 0, 0);

    if (end === 0)
    {
        ctx.drawImage(exports.Images[["black", "white"][Math.floor(game.turn)] + "Text"], 2, 4);
        ctx.drawImage(exports.Images.turn, 76, 4);
    }
    else
    if (end === 1)
    {
        ctx.drawImage(exports.Images[["black", "white"][game.winner]], 2, 4);
        ctx.drawImage(exports.Images.win, 76, 4);
    }
    else
    if (end === 2)
    {
        ctx.drawImage(exports.Images.tie, 14, 10);
    }
    
    for (let x = 0; x < 8; x++)
    {
        for (let y = 0; y < 8; y++)
        {
            if (typeof game.board[x][y] !== "boolean")
            {
                ctx.drawImage(exports.Images[["black", "white"][game.board[x][y]]], 17 + (y * 25), 30 + (x * 25));
            }
        }
    }
    
    if (end === 0)
    {
        for (let i = 0; i < game.highlight.length; i++)
        {
            let spot = game.highlight[i];
            ctx.drawImage(i == 0 ? exports.Images.captured : exports.Images.placed, 17 + (spot[1] * 25), 30 + (spot[0] * 25));
        }
        for (let i = 0; i < game.possible.length; i++)
        {
            let spot = game.possible[i];
            ctx.drawImage(exports.Images.possible, 17 + (spot[1] * 25), 30 + (spot[0] * 25));
        }
    }

    ctx.drawImage(exports.Images.numbers[('0'.repeat(2 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[0]], 159, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(2 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[1]], 170, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(2 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[0]], 193, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(2 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[1]], 204, 3);
      
    return canvas.toBuffer();
}
  
exports.takeTurn = function(channel, Move) {
    let game = channels[channel.id];
    let move = [Move.match(/[1-8]/)[0] - 1, 'abcdefgh'.indexOf(Move.toLowerCase().match(/[a-h]/)[0])];
  
    // Function will vary with game
    possible = game.possible;
    game.highlight = [];
    if (game.board[move[0]][move[1]] === false)
    {
        return ["You cannot place there.", new Discord.Attachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
    }
    for (let i = 0; i < possible.length; i++)
    {
        if (move[0] == possible[i][0] && move[1] == possible[i][1])
        {
            game.board[move[0]][move[1]] = game.turn;
            for (let x = 0; x < possible[i][2].length; x++)
            {
                for (let y = 1; y < possible[i][2][x][2]; y++)
                {
                    game.board[move[0] + (possible[i][2][x][0] * y)][move[1] + (possible[i][2][x][1] * y)] = game.turn;
                    game.highlight.push([move[0] + (possible[i][2][x][0] * y), move[1] + (possible[i][2][x][1] * y)]);
                }
            }
        }
    }

    game.highlight.unshift(move);
    
    // Turns all booleans to false for possible placement algorithm
    for (let y = 0; y < 8; y++)
    {
        for (let x = 0; x < 8; x++)
        {
            if (game.board[y][x] !== 0 && game.board[y][x] !== 1)
            {
                game.board[y][x] = false;
            }
        }
    }

    // If empty spaces are available, this finds spaces that can be played in
    game.possible = [];
    let a = game.turn === 0 ? 1 : 0;
    for (let y = 0; y < 8; y++)
    {
        for (let x = 0; x < 8; x++)
        {
            if (game.board[y][x] === false)
            {
                d = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
                p = [];
                for (let i = 0; i < 8; i++)
                {
                    if (y + d[i][0] < 8 && y + d[i][0] > -1 && x + d[i][1] < 8 && x + d[i][1] > -1)
                    {
                        let y1 = y + d[i][0];
                        let x1 = x + d[i][1];
                        p1 = 1;
                        if (game.board[y1][x1] === a)
                        {
                            let yx = true;
                            do {
                                y1 += d[i][0];
                                x1 += d[i][1];
                                p1 += 1;
                                if (y1 < 8 && y1 > -1 && x1 < 8 && x1 > -1)
                                {
                                    if (game.board[y1][x1] === game.turn)
                                    {
                                        p.push(d[i].concat(p1));
                                        yx = false;
                                    }
                                    else
                                    if (game.board[y1][x1] !== a)
                                    {
                                        yx = false;
                                    }
                                }
                                else
                                {
                                    yx = false;
                                }
                            } while (yx);
                        }
                    }
                }
                if (p.length > 0)
                {
                    game.board[y][x] = true;
                    game.possible.push([y, x, p]);
                }
            }
        }
    }
    //
    
    return exports.nextTurn(channel);
}
  
exports.nextTurn = function(channel) {
    let game = channels[channel.id];
    let board;
    let end = 0;
    game.turn = game.turn == 0 ? 1 : 0;
    game.player = game.players[game.turn];
    game.timer = {
        time: 6000,
        message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
    }
    game.buffer = exports.drawBoard(game, 0);
    board = new Discord.Attachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    if (game.possible.length == 0)
    {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
        game.timer = {
            time: 6000,
            message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
        }
        game.buffer = exports.drawBoard(game, 0);
        board = new Discord.Attachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
        if (game.possible.length == 0)
        {
            if (game.score[0] == game.score[1])
            {
                end = 2;
            }
            else
            {
                end = 1;
            }
            game.buffer = exports.drawBoard(game, end);
            board = new Discord.Attachment(game.buffer, end == 1 ? `${shortname}_1_${game.players[game.winner]}.png` : `${shortname}_2_${game.players[0]}vs${game.players[1]}.png`);
        }
    }
    if (channels[channel.id].lastDisplay)
    {
        channels[channel.id].lastDisplay.delete();
    }

    return [end == 0 ? `It is <@${game.player}>'s turn.` : end == 1 ? `<@${game.player}> has won!` : "Tie game, everyone loses!", board];
}

// Images

exports.Images = {};

Canvas.loadImage("./img/gameAssets/othello/board.png").then(image => {
    exports.Images.board = image;
});
Canvas.loadImage("./img/gameAssets/othello/black.png").then(image => {
    exports.Images.black = image;
});
Canvas.loadImage("./img/gameAssets/othello/white.png").then(image => {
    exports.Images.white = image;
});
Canvas.loadImage("./img/gameAssets/othello/placed.png").then(image => {
    exports.Images.placed = image;
});
Canvas.loadImage("./img/gameAssets/othello/captured.png").then(image => {
    exports.Images.captured = image;
});
Canvas.loadImage("./img/gameAssets/othello/possible.png").then(image => {
    exports.Images.possible = image;
});
Canvas.loadImage("./img/gameAssets/othello/blackText.png").then(image => {
    exports.Images.blackText = image;
});
Canvas.loadImage("./img/gameAssets/othello/whiteText.png").then(image => {
    exports.Images.whiteText = image;
});
Canvas.loadImage("./img/gameAssets/othello/turn.png").then(image => {
    exports.Images.turn = image;
});
Canvas.loadImage("./img/gameAssets/othello/win.png").then(image => {
    exports.Images.win = image;
});
Canvas.loadImage("./img/gameAssets/othello/tie.png").then(image => {
    exports.Images.tie = image;
});

exports.Images.numbers = new Array(10);
for (let i = 0; i < 10; i++)
{
    Canvas.loadImage(`./img/gameAssets/othello/numbers/${i}.png`).then(image => {
        exports.Images.numbers[i] = image;
    });
}