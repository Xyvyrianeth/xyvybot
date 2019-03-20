const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
var gamename = "Connect Four";
var shortname = "connect4";
 
exports.newGame = function(channel, player1, cmd, mode) {
    channels[channel.id] = {game:shortname,channel:channel,turn:0,players:[],started:false,lastmove:'',player:false,RE:/^[1-7]$/,casual:mode};
    let game = channels[channel.id];

    game.board = [[],[],[],[],[],[],[]];
 
    game.timer = {
        time: 100 * 60 * 15,
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
 
    return ["The game has started! <@" + game.players[0] + "> will be red, and <@" + game.players[1] + "> will be blue!\n\nTo place a piece, just say the number of the column you wish to place in.", new Discord.Attachment(exports.drawBoard(game, 0), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
}
 
exports.drawBoard = function(game, end, highlight) {
    let canvas = new Canvas.createCanvas(220, 225);
    let ctx = canvas.getContext("2d");
     
    // Function will vary with game
    ctx.textAlign = "center";
    for (let i = 7; i--;)
    {
        ctx.fillText(i + 1, (i + 1) * 30 - 10, 218);
    }
    ctx.textAlign = "start";
 
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(200, 200, 200, 0.25)";
    ctx.beginPath();
    for (let i = 7; i--;)
    {
        k = i * 30 + 20;
        for (let x = 6; x--;)
        {
            c = 220 - ((x + 1) * 30);
            ctx.moveTo(k + 7, c);
            ctx.arc(k, c, 7, 0, 2 * Math.PI);
        }
    }
    ctx.stroke();
    for (let i = game.board.length; i--;)
    {
        k = i * 30 + 20;
        for (let x = 0; x < game.board[i].length; x++)
        {
            c = 220 - ((x + 1) * 30);
            ctx.beginPath();
            ctx.moveTo(k + 10, c);
            ctx.strokeStyle = game.board[i][x] == 0 ? "#800" : "#008";
            ctx.fillStyle = game.board[i][x] == 0 ? "#f00" : "#00f";
            ctx.arc(k, c, 9, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(k - 7, c + 3);
            ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
            ctx.arc(k, c, 8, 0.875 * Math.PI, 1.625 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(k - 8, c);
            ctx.arc(k, c, 7, 1 * Math.PI, 1.5 * Math.PI);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.strokeStyle = game.board[i].length < 6 ? "#bb0" : "#a00";
        ctx.rect(k - 11, 204, 22, 0);
        ctx.stroke();
    }
    ctx.textBaseline = "hanging";
    if (end < 2)
    {
        ctx.fillStyle = game.turn == 0 ? "#c00" : "#00c";
        ctx.font = "bold 20px calibri";
        n = game.turn == 0 ? "Red" : "Blue";
        k = ctx.measureText(n).width;
        ctx.fillText(n, 5, 5);
        ctx.font = "20px calibri";
        if (end == 0)
        {
            ctx.fillText("'s turn.", k + 5, 5);
            if (highlight)
            {
                ctx.strokeStyle = "#ff8";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(highlight[0] * 30 + 30, 220 - ((highlight[1] + 1) * 30));
                ctx.arc(highlight[0] * 30 + 20, 220 - ((highlight[1] + 1) * 30), 10.5, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
        if (end == 1)
        {
            ctx.fillText(" has won!", k + 5, 5);
            ctx.strokeStyle = "#8f8";
            ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++)
            {
                ctx.beginPath();
                ctx.moveTo(highlight[i][0] * 30 + 30, 220 - ((highlight[i][1] + 1) * 30));
                ctx.arc(highlight[i][0] * 30 + 20, 220 - ((highlight[i][1] + 1) * 30), 11, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    }
    else
    {
        ctx.fillStyle = "#222";
        ctx.font = "20px calibri";
        ctx.fillText("Tie game!", 5, 5);
    }
    //
     
    return canvas.toBuffer();
}
 
exports.takeTurn = function(channel, move) {
    let game = channels[channel.id];
     
    // Function will vary with game
    let x = move - 1;
    if (game.board[x].length == 6)
    {
        return "Column is full, please pick another.";
    }

    game.board[x].push(game.turn);
    let row = [x, game.board[x].length - 1];
 
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
                    row = [[i, x], [i + 1, x], [i + 2, x], [i + 3, x]];
                    end = 1;
                    break;
                }
                if (game.board[i][x] == game.turn && game.board[i + 1][x + 1] == game.turn && game.board[i + 2][x + 2] == game.turn && game.board[i + 3][x + 3] == game.turn)
                {
                    row = [[i, x], [i + 1, x + 1], [i + 2, x + 2], [i + 3, x + 3]];
                    end = 1;
                    break;
                }
                if (game.board[i][x] == game.turn && game.board[i][x + 1] == game.turn && game.board[i][x + 2] == game.turn && game.board[i][x + 3] == game.turn)
                {
                    row = [[i, x], [i, x + 1], [i, x + 2], [i, x + 3]];
                    end = 1;
                    break;
                }
            }
            else
            {
                if (game.board[i][x] == game.turn && game.board[i + 1][x] == game.turn && game.board[i + 2][x] == game.turn && game.board[i + 3][x] == game.turn)
                {
                    row = [[i, x], [i + 1, x], [i + 2, x], [i + 3, x]];
                    end = 1;
                    break;
                }
                if (game.board[i][x] == game.turn && game.board[i + 1][x - 1] == game.turn && game.board[i + 2][x - 2] == game.turn && game.board[i + 3][x - 3] == game.turn)
                {
                    row = [[i, x], [i + 1, x - 1], [i + 2, x - 2], [i + 3, x - 3]];
                    end = 1;
                    break;
                }
                if (game.board[i][x] == game.turn && game.board[i][x - 1] == game.turn && game.board[i][x - 2] == game.turn && game.board[i][x - 3] == game.turn)
                {
                    row = [[i, x], [i, x - 1], [i, x - 2], [i, x - 3]];
                    end = 1;
                    break;
                }
            }
        }
    }
 
    if (end == 0)
    {
        game.timer = {
            time: 100 * 60 * 5,
            message: "Whoops, it looks like <@" + game.players[game.turn] + "> has run out of time, so the game is over!"
        }
    }
    if (end == 1)
    {
        game.winner = game.turn;
    }
     
    return exports.nextTurn(channel, end, row);
}
 
exports.nextTurn = function(channel, end, highlight) {
    let game = channels[channel.id];
    if (end == 0)
    {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
    }
    game.buffer = exports.drawBoard(game, end, highlight);
    board = new Discord.Attachment(game.buffer, end == 1 ? `${shortname}_${end}_${game.players[game.winner]}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
    if (channels[channel.id].lastDisplay)
    {
        channels[channel.id].lastDisplay.delete();
    }
    
    return [end == 0 ? "It is <@" + game.player + ">'s turn" : end == 1 ? "<@" + game.player + "> has won!" : "Tie game, everyone loses!", board];
}