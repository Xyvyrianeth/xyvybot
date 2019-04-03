const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
var gamename = "Squares";
var shortname = "squares";
  
exports.newGame = function(channel, player1, cmd, mode) {
    channels[channel.id] = {game:shortname,guild:channel.guild.id,turn:0.5,players:[],started:false,lastmove:'',isOver:false,player:false,RE:/^([a-j] ?(?:10|[1-9])|(?:10|[1-9]) ?[a-j])$/i,casual:mode,score:[0,0]};
    let game = channels[channel.id];

    let _ = false;
    game.board = [];
    for (let i = 10; i--;)
    {
        let row = [];
        for (let i = 10; i--;)
        {
            row.push(_);
        }
        game.board.push(row);
    }
  
    game.timer = {
        time: 9000,
        message: `It appears nobody wants to play right now, <@${player1}>.`
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
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }
  
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
    game.player = game.players[0];
    game.buffer = exports.drawBoard(game, 0, false);
    return [`The game has started! <@${game.players[0]}> will be black, and <@${game.players[1]}> will be white!\n\nTo place a stone, say the letter of the row and the number of the column, like "f4"`, new Discord.Attachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
}
  
exports.drawBoard = function(game, end, highlight) {
    let canvas = new Canvas.createCanvas(280, 300);
    let ctx = canvas.getContext('2d');
      
    ctx.drawImage(exports.Images.board, 0, 0);
    for (let x = 0; x < 10; x++)
    {
        for (let y = 0; y < 10; y++)
        {
            if (end === 0 && highlight !== false && highlight[0] == x && highlight[1] == (y + 10).toString(20))
            {
                ctx.drawImage(exports.Images.highlight, 17 + (y * 25), 30 + (x * 25));
            }
            if (game.board[x][y] !== false)
            {
                ctx.drawImage(exports.Images[["black", "white"][game.board[x][y]]], 17 + (y * 25), 30 + (x * 25));
            }
        }
    }

    if (end === 0)
    {
        ctx.drawImage(exports.Images[["black", "white"][Math.floor(game.turn)] + "Text"], 14, 4);
        ctx.drawImage(exports.Images.turn, 88, 4);
    }
    else
    if (end === 1)
    {
        ctx.drawImage(exports.Images[["black", "white"][game.winner]], 14, 4);
        ctx.drawImage(exports.Images.win, 88, 4);
    }
    else
    if (end === 2)
    {
        ctx.drawImage(exports.Images.tie, 14, 4);
    }

    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[0]], 186, 5);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[1]], 195, 5);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[2]], 204, 5);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[0]], 219, 5);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[1]], 228, 5);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[2]], 237, 5);

    return canvas.toBuffer();
}
  
exports.takeTurn = function(channel, Move) {
    let game = channels[channel.id];
    let move = [Move.match(/[0-9]{1,2}/)[0] - 1, 'abcdefghij'.indexOf(Move.toLowerCase().match(/[a-j]/)[0])];
    let highlight = move;
      
    // Function will vary with game
    if (game.board[move[0]][move[1]] !== false)
    {
        return ["There's already a stone there, pick another spot!", new Discord.MessageAttachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
    }
    else
    {
        game.board[move[0]][move[1]] = Math.floor(game.turn);
    }

    // Checks if board is full
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

    // Counts the number of squares
    game.score = [0, 0];
    for (let i = 1; i < 10; i++)
    {
        for (let x = 0; x < 10 - i; x++)
        {
            for (let y = 0; y < 10 - i; y++)
            {
                if (game.board[y][x] !== false && game.board[y][x] === game.board[y + i][x] && game.board[y + i][x] === game.board[y][x + i] && game.board[y][x + i] === game.board[y + i][x + i])
                {
                    if (game.board[y][x] === 0)
                    {
                        game.score[0] += 1;
                    }
                    else
                    {
                        game.score[1] += 1;
                    }
                }
            }
        }
    }
    
    if (end !== 0)
    {
        if (game.score[0] == game.score[1])
        {
            end = 2;
        }
        else
        {
            game.winner = game.score[0] > game.score[1] ? 0 : 1;
        }
    }
      
    return exports.nextTurn(channel, end, highlight);
}
  
exports.nextTurn = function(channel, end, highlight) {
    let game = channels[channel.id];
    if (end == 0)
    {
        game.turn = game.turn == 1.5 ? 0 : game.turn + 0.5;
        game.player = game.players[Math.floor(game.turn)];
        game.timer = {
            time: 6000,
            message: `Whoops, it looks like <@${game.players[Math.floor(game.turn)]}> has run out of time, so the game is over!`
        }
    }
    game.buffer = exports.drawBoard(game, end, highlight);
    board = new Discord.Attachment(game.buffer, end == 1 ? `${shortname}_${end}_${game.players[game.winner]}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
    if (channels[channel.id].lastDisplay)
    {
        channels[channel.id].lastDisplay.delete();
    }

    return [end == 0 ? `It is <@${game.player}>'s turn.` : end == 2 ?  "Tie game, everyone loses!" : `<@${game.players[game.score[0] > game.score[1] ? 0 : 1]}> has won!`, board];
}

// Images

exports.Images = {};

Canvas.loadImage("./img/gameAssets/squares/board.png").then(image => {
    exports.Images.board = image;
});
Canvas.loadImage("./img/gameAssets/squares/black.png").then(image => {
    exports.Images.black = image;
});
Canvas.loadImage("./img/gameAssets/squares/white.png").then(image => {
    exports.Images.white = image;
});
Canvas.loadImage("./img/gameAssets/squares/blackText.png").then(image => {
    exports.Images.blackText = image;
});
Canvas.loadImage("./img/gameAssets/squares/whiteText.png").then(image => {
    exports.Images.whiteText = image;
});
Canvas.loadImage("./img/gameAssets/squares/turn.png").then(image => {
    exports.Images.turn = image;
});
Canvas.loadImage("./img/gameAssets/squares/win.png").then(image => {
    exports.Images.win = image;
});
Canvas.loadImage("./img/gameAssets/squares/highlight.png").then(image => {
    exports.Images.highlight = image;
});
Canvas.loadImage("./img/gameAssets/squares/tie.png").then(image => {
    exports.Images.tie = image;
});

exports.Images.numbers = new Array(10);
for (let i = 0; i < 10; i++)
{
    Canvas.loadImage(`./img/gameAssets/squares/numbers/${i}.png`).then(image => {
        exports.Images.numbers[i] = image;
    });
}