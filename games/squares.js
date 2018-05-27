const Discord = require("discord.js");
const Canvas = require("canvas");
var gamename = "Squares";
var shortname = "squares";
  
exports.channels = {}; // Leave blank
  
exports.newGame = function(channel, player1, cmd, size) {
    exports.channels[channel.id] = {turn:0.5,players:[],started:false,lastmove:'',size:size,isOver:false};
    game = exports.channels[channel.id];
    let _ = false;
    game.board = [];
    for (let i = game.size; i--;) {
        let row = [];
        for (let i = game.size; i--;) row.push(_);
        game.board.push(row);
    }
  
    game.timer = {
        time: 100 * 60 * 15,
        message: "It appears nobody wants to play right now, <@" + player1 + ">."
    }
  
    game.players[0] = player1;
    return `**$user$** is now requesting a new game of ${gamename}, say \`x!${cmd} start\` to play against them!\n\nBoard size: ${size}`;
}
  
exports.startGame = function(channel, player2) {
    game = exports.channels[channel.id];
    game.players[1] = player2;
    game.started = true;
  
    game.timer = {
        time: 100 * 60 * 5,
        message: "Whoops, it looks like <@" + game.players[0] + "> has run out of time, so the game is over!"
    }
  
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
    return ["The game has started! <@" + game.players[0] + "> will be black, and <@" + game.players[1] + "> will be white!\n\nTo place a stone, say the letter of the row and the number of the column, like \"F4\".", new Discord.MessageAttachment(exports.drawBoard(game, 0, false, [0, 0]), `${shortname}_0_${game.size}_${game.players[0]}vs${game.players[1]}.png`)];
}
  
exports.drawBoard = function(game, end, highlight, score) {
    canvas = new Canvas(30 + (25 * game.size), 50 + (25 * game.size));
    ctx = canvas.getContext('2d');
      
    // Function will vary with game
    ctx.textAlign = "center";
    for (let i = game.size; i--;) {
        ctx.fillText("ABCDEFGHIJKLMNO".substring(0, game.size).split('')[i], (i + 1) * 25 + 7.5, 42 + (25 * game.size));
        ctx.fillText(i + 1, 13, (i + 1) * 25 + 21);
    }
    ctx.textAlign = "start";
  
    for (let y = 0; y < game.size; y++) {
        let r = 42.5 + (25 * y);
        for (let x = 0; x < game.size; x++) {
            let c = (x + 1) * 25 + 7.5;
  
            if (game.board[y][x] === false) { // Blank Spot
                ctx.beginPath();
                ctx.strokeStyle = "rgba(200, 200, 200, 0.25)";
                ctx.moveTo(c + 5, r);
                ctx.arc(c, r, 5, 0, 2 * Math.PI);
                ctx.stroke();
  
            } else if (game.board[y][x] === 0) { // Black
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
  
            } else if (game.board[y][x] === 1) { // White
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
    if (end == 0) {
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
    } else if (score[0] == score[1]) {
        ctx.font = "20px calibri";
        ctx.fillStyle = "#888";
        ctx.fillText("Tie game!", 5, 5);
 
        k = ctx.measureText("Tie game!  ").width;
    } else {
        ctx.font = "bold 20px calibri";
        let n = score[0] > score[1] ? "Black" : "White";
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
 
 
    if (highlight) {
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
  
exports.takeTurn = function(channel, move, save) {
    let game = exports.channels[channel.id];
      
    // Function will vary with game
    if (game.board[move[0]][move[1]] !== false) return "There's already a stone there, pick another spot!";
    else game.board[move[0]][move[1]] = Math.floor(game.turn);
    let end = 2;
    let highlight = move;
    for (let i = game.size; i--;) {
        for (let x = game.size; x--;) {
            if (game.board[i][x] === false) {
                end = 0;
                break;
            }
        }
    }
    let score = [0, 0];
    for (let i = 1; i < game.size; i++) {
        for (let x = 0; x < game.size - i; x++) {
            for (let y = 0; y < game.size - i; y++) {
                if (game.board[y][x] !== false && game.board[y][x] === game.board[y + i][x] && game.board[y + i][x] === game.board[y][x + i] && game.board[y][x + i] === game.board[y + i][x + i]) {
                    if (game.board[y][x] === 0) score[0] += 1;
                    else score[1] += 1;
                }
            }
        }
    }
    //
  
    if (end == 0) game.timer = {
        time: 100 * 60 * 5,
        message: "Whoops, it looks like <@" + game.players[Math.floor(game.turn) == 0 ? 1 : 0] + "> has run out of time, so the game is over!"
    }
    if (end == 1) game.winner = Math.floor(game.turn);
      
    return exports.nextTurn(channel, end, highlight, score, save);
}
  
exports.nextTurn = function(channel, end, highlight, score, save) {
    let game = exports.channels[channel.id];
    if (end == 0) {
        game.turn = game.turn == 1.5 ? 0 : game.turn + 0.5;
    }
    board = new Discord.MessageAttachment(exports.drawBoard(game, end, highlight, score), end == 1 ? `${shortname}_${end}_${game.size}_${game.players[game.winner]}.png` : `${shortname}_${end}_${game.size}_${game.players[0]}vs${game.players[1]}.png`);
    if (exports.channels[channel.id].lastDisplay) exports.channels[channel.id].lastDisplay.delete();
    return board;
}