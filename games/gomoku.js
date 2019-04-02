const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
var gamename = "Gomoku";
var shortname = "gomoku";
 
exports.newGame = function(channel, player1, cmd, mode) {
    channels[channel.id] = {game:shortname,guild:channel.guild.id,turn:0.5,players:[],started:false,lastmove:'',player:false,RE:/^([a-s] ?1?[0-9]{1,}|1?[0-9]{1,} ?[a-s])/i,casual:mode};
    let game = channels[channel.id];
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
        time: 10 * 60 * 5,
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }
 
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
    game.player = game.players[0];
    game.buffer = exports.drawBoard(game, 0);
    return [`The game has started! <@${game.players[0]}> will be player1, and <@${game.players[1]}> will be player2!\n\nTo place a piece, just say the number of the column you wish to place in, like "f4"`, new Discord.Attachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
}
 
exports.drawBoard = function(game, end, highlight, row) {
    let canvas = new Canvas.createCanvas(30 + (25 * 19), 50 + (25 * 19));
    let ctx = canvas.getContext("2d");
     
    // Function will vary with game
    
    ctx.textAlign = "center";
    for (let i = 19; i--;)
    {
        ctx.fillText("ABCDEFGHIJKLMNOPQRS"[i], (i + 1) * 25 + 7.5, 42 + (25 * 19));
    }
    for (let i = 19; i--;)
    {
        ctx.fillText(i + 1, 13, (i + 1) * 25 + 21);
    }
    ctx.textAlign = "start";
  
    for (let y = 0; y < 19; y++)
    {
        let r = 42.5 + (25 * y);
        for (let x = 0; x < 19; x++)
        {
            let c = (x + 1) * 25 + 7.5;
  
            if (game.board[y][x] === false)
            { // Blank Spot
                ctx.beginPath();
                ctx.strokeStyle = "rgba(200, 200, 200, 0.25)";
                ctx.moveTo(c + 5, r);
                ctx.arc(c, r, 5, 0, 2 * Math.PI);
                ctx.stroke();
  
            }
            else
            if (game.board[y][x] === 0)
            { // Black
                ctx.beginPath();
                ctx.strokeStyle = "#222";
                ctx.fillStyle = "#000";
                ctx.moveTo(c + 9, r);
                ctx.arc(c, r, 9, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
  
                ctx.beginPath();
                ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
                ctx.moveTo(c - 7, r + 3);
                ctx.arc(c, r, 8, 0.875 * Math.PI, 1.625 * Math.PI);
                ctx.moveTo(c - 8, r);
                ctx.arc(c, r, 8, 1 * Math.PI, 1.5 * Math.PI);
                ctx.stroke();
  
            }
            else
            if (game.board[y][x] === 1)
            { // White
                ctx.beginPath();
                ctx.strokeStyle = "#ddd";
                ctx.fillStyle = "#fff";
                ctx.moveTo(c + 9, r);
                ctx.arc(c, r, 9, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
  
                ctx.beginPath();
                ctx.strokeStyle = "rgba(150, 150, 150, 0.5)";
                ctx.moveTo(c + 7, r - 3);
                ctx.arc(c, r, 8, 1.875 * Math.PI, 0.625 * Math.PI);
                ctx.moveTo(c + 8, r);
                ctx.arc(c, r, 8, 0, 0.5 * Math.PI);
                ctx.stroke();
            }
        }
    }
    ctx.textBaseline = "hanging";
    if (end == 0)
    {
        ctx.font = "bold 20px calibri";
        let n = Math.floor(game.turn) == 0 ? "Black" : "White";
        k = ctx.measureText(n).width;
        if (n == "Black")
        {
            ctx.fillStyle = "#000";
        }
        if (n == "White")
        {
            ctx.fillStyle = "#fff";
        }
        ctx.fillText(n, 5, 5);
        ctx.font = "20px calibri";
        ctx.fillStyle = "#888";
        ctx.fillText("'s turn.", k + 5, 5);
    }
    else
    {
        ctx.font = "bold 20px calibri";
        let n = Math.floor(game.turn) == 0 ? "Black" : "White";
        if (n == "Black")
        {
            ctx.fillStyle = "#000";
        }
        if (n == "White")
        {
            ctx.fillStyle = "#fff";
        }
        ctx.fillText(n, 5, 5);
 
        k = ctx.measureText(n).width;
        ctx.font = "20px calibri";
        ctx.fillStyle = "#888";
        ctx.fillText(" has won!", k + 5, 5);
        ctx.strokeStyle = "#0f0";
        ctx.lineWidth = 3;
        for (let i = 0; i < row.length; i++)
        {
            let r = 42.5 + (25 * row[i][0]);
            let c = (row[i][1] + 1) * 25 + 7.5;
            ctx.beginPath();
            ctx.moveTo(c + 10.5, r);
            ctx.arc(c, r, 10, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
 
    if (highlight)
    {
        let r = 42.5 + (25 * highlight[0]);
        let c = (highlight[1] + 1) * 25 + 7.5;
        ctx.strokeStyle = "#ff8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c + 10, r);
        ctx.arc(c, r, 10, 0, 2 * Math.PI);
        ctx.stroke();
    }
    //

    return canvas.toBuffer();
}
 
exports.takeTurn = function(channel, Move) {
    let game = channels[channel.id];

    let move = [Move.match(/[0-9]{1,2}/)[0] - 1, 'abcdefghijklmnopqrs'.indexOf(Move.toLowerCase().match(/[a-z]/)[0])];
     
    // Function will vary with game
    if (game.board[move[0]][move[1]] !== false)
    {
        return ["There's already a stone there, pick another spot!", new Discord.MessageAttachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
    }
    else
    {
        game.board[move[0]][move[1]] = Math.floor(game.turn);
    }

    let highlight = move;
    let row;
    let end = 2;
    for (let y = 19; y--;)
    {
        for (let x = 19; x--;)
        {
            if (game.board[y][x] === false)
            {
                end = 0;
                break;
            }
        }
    }

    for (let y = 0; y < 19; y++)
    {
        for (let x = 0; x < 19; x++)
        {
            let a = game.board;
            let b = Math.floor(game.turn);

            if (x == 0)
            {
                if (a[y][x] === b && a[y][x + 1] === b && a[y][x + 2] === b && a[y][x + 3] === b && a[y][x + 4] === b && a[y][x + 5] !== b)
                {
                    row = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3], [y, x + 4]];
                    end = 1;
                }
            }
            else
            if (x == 14)
            {
                if (a[y][x] === b && a[y][x + 1] === b && a[y][x + 2] === b && a[y][x + 3] === b && a[y][x + 4] === b && a[y][x - 1] !== b)
                {
                    row = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3], [y, x + 4]];
                    end = 1;
                }
            }
            else
            {
                if (a[y][x] === b && a[y][x + 1] === b && a[y][x + 2] === b && a[y][x + 3] === b && a[y][x + 4] === b && a[y][x + 5] !== b && a[y][x - 1] !== b)
                {
                    row = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3], [y, x + 4]];
                    end = 1;
                }
            }
            // vertical
            if (y == 0)
            {
                if (a[y][x] === b && a[y + 1][x] === b && a[y + 2][x] === b && a[y + 3][x] === b && a[y + 4][x] === b && a[y + 5][x] !== b)
                {
                    row = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x], [y + 4, x]];
                    end = 1;
                }
            }
            else
            if (y == 14)
            {
                if (a[y][x] === b && a[y + 1][x] === b && a[y + 2][x] === b && a[y + 3][x] === b && a[y + 4][x] === b && a[y - 1][x] !== b)
                {
                    row = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x], [y + 4, x]];
                    end = 1;
                }
            }
            else
            if (y > 0 && y < 14)
            {
                if (a[y][x] === b && a[y + 1][x] === b && a[y + 2][x] === b && a[y + 3][x] === b && a[y + 4][x] === b && a[y + 5][x] !== b && a[y - 1][x] !== b)
                {
                    row = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x], [y + 4, x]];
                    end = 1;
                }
            }
            // up-slope
            if (x == 0)
            {
                if (y == 4)
                {
                    if (a[y][x] === b && a[y-1][x+1] === b && a[y-2][x+2] === b && a[y-3][x+3] === b && a[y-4][x+4] === b)
                    {
                        row = [[y, x], [y-1, x+1], [y-2, x+2], [y-3, x+3], [y-4, x+4]];
                        end = 1;
                    }
                }
                else
                if (y > 4 && y < 19)
                {
                    if (a[y][x] === b && a[y-1][x+1] === b && a[y-2][x+2] === b && a[y-3][x+3] === b && a[y-4][x+4] === b && a[y-5][x+5] !== b)
                    {
                        row = [[y, x], [y-1, x+1], [y-2, x+2], [y-3, x+3], [y-4, x+4]];
                        end = 1;
                    }
                }
            }
            else
            if (x < 14)
            {
                if (y == 4) {
                    if (a[y][x] === b && a[y-1][x+1] === b && a[y-2][x+2] === b && a[y-3][x+3] === b && a[y-4][x+4] === b && a[y+1][x-1] !== b)
                    {
                        row = [[y, x], [y-1, x+1], [y-2, x+2], [y-3, x+3], [y-4, x+4]];
                        end = 1;
                    }
                }
                else
                if (y > 4 && y < 14)
                {
                    if (a[y][x] === b && a[y-1][x+1] === b && a[y-2][x+2] === b && a[y-3][x+3] === b && a[y-4][x+4] === b && a[y+1][x-1] !== b && a[y-5][x+5] !== b)
                    {
                        row = [[y, x], [y-1, x+1], [y-2, x+2], [y-3, x+3], [y-4, x+4]];
                        end = 1;
                    }
                }
                else
                if (y == 18)
                {
                    if (a[y][x] === b && a[y-1][x+1] === b && a[y-2][x+2] === b && a[y-3][x+3] === b && a[y-4][x+4] === b && a[y-5][x+5] !== b)
                    {
                        row = [[y, x], [y-1, x+1], [y-2, x+2], [y-3, x+3], [y-4, x+4]];
                        end = 1;
                    }
                }
            }
            else
            if (x == 14)
            {
                if (y > 3 && y < 18)
                {
                    if (a[y][x] === b && a[y-1][x+1] === b && a[y-2][x+2] === b && a[y-3][x+3] === b && a[y-4][x+4] === b && a[y+1][x-1] !== b)
                    {
                        row = [[y, x], [y-1, x+1], [y-2, x+2], [y-3, x+3], [y-4, x+4]];
                        end = 1;
                    }
                }
                else
                if (y == 18)
                {
                    if (a[y][x] === b && a[y-1][x+1] === b && a[y-2][x+2] === b && a[y-3][x+3] === b && a[y-4][x+4] === b)
                    {
                        row = [[y, x], [y-1, x+1], [y-2, x+2], [y-3, x+3], [y-4, x+4]];
                        end = 1;
                    }
                }
            }
            // down-slope
            if (x == 0)
            {
                if (y < 14)
                {
                    if (a[y][x] === b && a[y+1][x+1] === b && a[y+2][x+2] === b && a[y+3][x+3] === b && a[y+4][x+4] === b && a[y+5][x+5] !== b)
                    {
                        row = [[y, x], [y+1, x+1], [y+2, x+2], [y+3, x+3], [y+4, x+4]];
                        end = 1;
                    }
                }
                else
                if (y == 14)
                {
                    if (a[y][x] === b && a[y+1][x+1] === b && a[y+2][x+2] === b && a[y+3][x+3] === b && a[y+4][x+4] === b)
                    {
                        row = [[y, x], [y+1, x+1], [y+2, x+2], [y+3, x+3], [y+4, x+4]];
                        end = 1;
                    }
                }
            }
            else
            if (x < 14)
            {
                if (y == 0)
                {
                    if (a[y][x] === b && a[y+1][x+1] === b && a[y+2][x+2] === b && a[y+3][x+3] === b && a[y+4][x+4] === b && a[y+5][x+5] !== b)
                    {
                        row = [[y, x], [y+1, x+1], [y+2, x+2], [y+3, x+3], [y+4, x+4]];
                        end = 1;
                    }
                }
                else
                if (y > 0 && y < 14)
                {
                    if (a[y][x] === b && a[y+1][x+1] === b && a[y+2][x+2] === b && a[y+3][x+3] === b && a[y+4][x+4] === b && a[y-1][x-1] !== b && a[y+5][x+5] !== b)
                    {
                        row = [[y, x], [y+1, x+1], [y+2, x+2], [y+3, x+3], [y+4, x+4]];
                        end = 1;
                    }
                }
                else
                if (y == 14)
                {
                    if (a[y][x] === b && a[y+1][x+1] === b && a[y+2][x+2] === b && a[y+3][x+3] === b && a[y+4][x+4] === b && a[y-1][x-1] !== b)
                    {
                        row = [[y, x], [y+1, x+1], [y+2, x+2], [y+3, x+3], [y+4, x+4]];
                        end = 1;
                    }
                }
            }
            else
            if (x == 14)
            {
                if (y == 0)
                {
                    if (a[y][x] === b && a[y+1][x+1] === b && a[y+2][x+2] === b && a[y+3][x+3] === b && a[y+4][x+4] === b)
                    {
                        row = [[y, x], [y+1, x+1], [y+2, x+2], [y+3, x+3], [y+4, x+4]];
                        end = 1;
                    }
                }
                else
                if (y < 14)
                {
                    if (a[y][x] === b && a[y+1][x+1] === b && a[y+2][x+2] === b && a[y+3][x+3] === b && a[y+4][x+4] === b && a[y-1][x-1] !== b)
                    {
                        row = [[y, x], [y+1, x+1], [y+2, x+2], [y+3, x+3], [y+4, x+4]];
                        end = 1;
                    }
                }
            }
        }
    }
    //

    if (end == 1)
    {
        game.winner = game.players[Math.floor(game.turn)];
    }
     
    return exports.nextTurn(channel, end, highlight, row);
}
 
exports.nextTurn = function(channel, end, highlight, row) {
    let game = channels[channel.id];
    if (end == 0)
    {
        game.turn = game.turn == 1.5 ? 0 : game.turn += 0.5;
        game.player = game.players[Math.floor(game.turn)];
        game.timer = {
            time: 10 * 60 * 5,
            message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
        }
    }
    game.buffer = exports.drawBoard(game, end, highlight, row);
    board = new Discord.Attachment(game.buffer, end == 1 ? `${shortname}_${end}_${game.winner}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
    if (channels[channel.id].lastDisplay)
    {
        channels[channel.id].lastDisplay.delete();
    }
    return [end == 0 ? `It is <@${game.player}>'s turn` : end == 1 ? `<@${game.player}> has won!` : `Tie game, everyone loses!`, board];;
}
