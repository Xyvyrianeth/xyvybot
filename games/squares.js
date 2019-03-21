const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
var gamename = "Squares";
var shortname = "squares";
  
exports.newGame = function(channel, player1, cmd, mode) {
    channels[channel.id] = {game:shortname,channel:channel,turn:0.5,players:[],started:false,lastmove:'',isOver:false,player:false,RE:/^([a-j] ?(?:10|[1-9])|(?:10|[1-9]) ?[a-j])$/i,casual:mode};
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
        time: 100 * 60 * 15,
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
        time: 100 * 60 * 5,
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
      
    // Function will vary with game
    ctx.textAlign = "center";
    for (let i = 10; i--;)
    {
        ctx.fillText("ABCDEFGHIJ".split('')[i], (i + 1) * 25 + 7.5, 292);
        ctx.fillText(i + 1, 13, (i + 1) * 25 + 21);
    }
    ctx.textAlign = "start";
  
    for (let y = 0; y < 10; y++)
    {
        let r = 42.5 + (25 * y);
        for (let x = 0; x < 10; x++)
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
        if (n == "Black") ctx.fillStyle = "#000";
        if (n == "White") ctx.fillStyle = "#fff";
        ctx.fillText(n, 5, 5);
        ctx.font = "20px calibri";
        ctx.fillStyle = "#888";
        ctx.fillText("'s turn.", k + 5, 5);
 
        k += ctx.measureText("'s turn.  ").width;
    }
    else
    if (game.score[0] == game.score[1])
    {
        ctx.font = "20px calibri";
        ctx.fillStyle = "#888";
        ctx.fillText("Tie game!", 5, 5);
 
        k = ctx.measureText("Tie game!  ").width;
    }
    else
    {
        ctx.font = "bold 20px calibri";
        let n = game.score[0] > game.score[1] ? "Black" : "White";
        if (n == "Black") ctx.fillStyle = "#000";
        if (n == "White") ctx.fillStyle = "#fff";
        ctx.fillText(n, 5, 5);
 
        k = ctx.measureText(n).width;
        ctx.font = "20px calibri";
        ctx.fillStyle = "#888";
        ctx.fillText(" has won!", k + 5, 5);
 
        k += ctx.measureText(" has won!  ").width;
    }
    ctx.fillStyle = "#000";
    ctx.fillText(String(score[0]), k + 5, 5);
 
    k += ctx.measureText(String(score[0])).width;
    ctx.fillStyle = "#888";
    ctx.fillText(' - ', k + 5, 5);
 
    k += ctx.measureText(' - ').width;
    ctx.fillStyle = "#fff";
    ctx.fillText(String(score[1]), k + 5, 5);
 
 
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
    let end = true;
    for (let i = 10; i--;)
    {
        for (let x = 10; x--;)
        {
            if (game.board[i][x] === false)
            {
                end = false;
                break;
            }
        }
    }
    let game = channels[channel.id];
    let move = [Move.match(/[0-9]{1,2}/)[0] - 1, 'abcdefghij'.indexOf(Move.toLowerCase().match(/[a-j]/)[0])];
    let highlight = move;
      
    // Function will vary with game
    if (game.board[move[0]][move[1]] !== false)
    {
        return ["There's already a stone there, pick another spot!", new Discord.MessageAttachment(game.buffer, `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`)];
    }
    else
    {
        game.board[move[0]][move[1]] = Math.floor(game.turn);
    }
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
    //
  
    if (!end)
    {
        game.timer = {
            time: 100 * 60 * 5,
            message: `Whoops, it looks like <@${game.players[Math.floor(game.turn)]}> has run out of time, so the game is over!`
        }
    }
    else
    {
        game.winner = Math.floor(game.turn);
    }
      
    return exports.nextTurn(channel, end, highlight);
}
  
exports.nextTurn = function(channel, end, highlight) {
    let game = channels[channel.id];
    if (!end)
    {
        game.turn = game.turn == 1.5 ? 0 : game.turn + 0.5;
        game.player = game.players[Math.floor(game.turn)];
    }
    game.buffer = exports.drawBoard(game, end, highlight);
    board = new Discord.Attachment(game.buffer, end == 1 ? `${shortname}_${end}_${game.players[game.winner]}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
    if (channels[channel.id].lastDisplay)
    {
        channels[channel.id].lastDisplay.delete();
    }

    return [!end ? `It is <@${game.player}>'s turn.` : game.score[0] !== game.score[1] ? `<@${game.player}> has won!` : "Tie game, everyone loses!", board];
}