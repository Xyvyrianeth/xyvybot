const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
var gamename = "Connect Four";
var shortname = "connect4";
 
exports.newGame = function(channel, player1, cmd, mode) {
    channels[channel.id] = {game:shortname,guild:channel.guild.id,turn:0,players:[],started:false,lastmove:'',player:false,RE:/^[1-7]$/,casual:mode};
    let game = channels[channel.id];

    game.board = [[],[],[],[],[],[],[]];
 
    game.timer = {
        time: 10 * 60 * 15,
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
    game.buffer = exports.drawBoard(game, 0);
    return [`The game has started! <@${game.players[0]}> will be red, and <@${game.players[1]}> will be blue!\n\nTo place a piece, just say the number of the column you wish to place in.`, new Discord.Attachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
}
 
exports.drawBoard = function(game, end, highlight) {
    let canvas = new Canvas.createCanvas(184, 195);
    let ctx = canvas.getContext("2d");
     
    ctx.drawImage(exports.Images.board, 0, 0);

    if (end == 0)
    {
        ctx.drawBoard(exports.Images[["red", "blue"][game.turn] + "Text"], 8, 4);
        ctx.drawBoard(exports.Images.turn, 45 + (13 * game.turn), 5);
    }
    else
    if (end == 1)
    {
        ctx.drawBoard(exports.Images[["red", "blue"][game.turn] + "Text"], 8, 4);
        ctx.drawBoard(exports.Images.win, 51 + (13 * game.turn), 5);
    }
    else
    if (end == 2)
    {
        ctx.drawBoard(exports.Images.tie, 8, 7);
    }

    for (let i = 0; i < 7; i++)
    {
        for (let ii = 0; ii < game.board[i].length; ii++)
        {
            ctx.drawBoard(exports.Images[["red", "blue"][game.board[i][ii]]], 30 + (25 * (5 - ii)), 6 + (25 * i));
            
            if (end === 1 && highlight.filter(x => { return x[0] == i && x[1] == ii; }).length == 1)
            {
                ctx.drawBoard(exports.Images.winHighlight, 30 + (25 * (5 - ii)), 6 + (25 * i));
            }
        }

        if (end === 0 && highlight !== false && highlight == i)
        {
            ctx.drawBoard(exports.Images.highlight, 30 + (25 * (5 - game.board[i].length)), 6 + (25 * i))
        }
    }
     
    return canvas.toBuffer();
}
 
exports.takeTurn = function(channel, move) {
    let game = channels[channel.id];
     
    // Function will vary with game
    let x = move - 1;
    if (game.board[x].length == 6)
    {
        return ["Column is full, please pick another.", new Discord.MessageAttachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
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
    
    return [end == 0 ? `It is <@${game.player}>'s turn` : end == 1 ? `<@${game.player}> has won!` : `Tie game, everyone loses!`, board];
}

// Images

exports.Images = {};

Canvas.loadImage("./img/gameAssets/connect4/board.png").then(image => {
    exports.Images.board = image;
});
Canvas.loadImage("./img/gameAssets/connect4/red.png").then(image => {
    exports.Images.black = image;
});
Canvas.loadImage("./img/gameAssets/connect4/blue.png").then(image => {
    exports.Images.white = image;
});
Canvas.loadImage("./img/gameAssets/connect4/redText.png").then(image => {
    exports.Images.blackText = image;
});
Canvas.loadImage("./img/gameAssets/connect4/blueText.png").then(image => {
    exports.Images.whiteText = image;
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
    exports.Images.highlight = image;
});
Canvas.loadImage("./img/gameAssets/connect4/tie.png").then(image => {
    exports.Images.tie = image;
});