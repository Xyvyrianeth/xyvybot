const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
var gamename = "Othello";
var shortname = "othello";
  
exports.newGame = function(channel, player1, cmd, mode) {
    channels[channel.id] = {game:shortname,channel:channel,turn:0,players:[],started:false,lastmove:'',over:false,player:false,RE:/^([a-h][1-8]|[1-8][a-h])$/i,casual:mode};
    game = channels[channel.id];
    let _ = false;
    game.board = [];
    for (let i = 8; i--;) {
        let row = [];
        for (let i = 8; i--;) row.push(_);
        game.board.push(row);
    }
    game.board[3][4] = 0;
    game.board[3][3] = 1;
    game.board[4][4] = 1;
    game.board[4][3] = 0;
  
    game.timer = {
        time: 600 * 15,
        message: "It appears nobody wants to play right now, <@" + player1 + ">."
    }
  
    game.players[0] = player1;
    return `**$user$** is now requesting a new game of ${gamename}, say \`x!${cmd} start\` to play against them!`;
}
  
exports.startGame = function(channel, player2) {
    game = channels[channel.id];
    game.players[1] = player2;
    game.started = true;
  
    game.timer = {
        time: 600 * 5,
        message: "Whoops, it looks like <@" + game.players[0] + "> has run out of time, so the game is over!"
    }
  
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
    game.player = game.players[0];
    return ["The game has started! <@" + game.players[0] + "> will be black, and <@" + game.players[1] + "> will be white!\n\nThe small green circles are the places you can put a stone.\nTo place a stone, say the letter of the row and the number of the column, like \"F4\".", new Discord.Attachment(exports.drawBoard(game, 0), `${shortname}_${game.players[0]}vs${game.players[1]}.png`)];
}
  
exports.drawBoard = function(game, end, quit) {
    let canvas = new Canvas(230, 250);
    let ctx = canvas.getContext('2d');
      
    // Function will vary with game
    
    if (!end) {

        // Checks for empty spaces
        end = true;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (game.board[y][x] !== 0 && game.board[y][x] !== 1) {
                    end = false;
                    game.board[y][x] = false;
                }
            }
        }
        if (end) {
            game.over = true;
        }
    

        // If empty spaces are available, this finds spaces that can be played in
        possible = [];
        let a = game.turn === 0 ? 1 : 0;
        if (!end) for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (game.board[y][x] === false) {
                    d = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
                    p = [];
                    for (let i = 0; i < 8; i++) {
                        if (y + d[i][0] < 8 && y + d[i][0] > -1 && x + d[i][1] < 8 && x + d[i][1] > -1) {
                            let y1 = y + d[i][0];
                            let x1 = x + d[i][1];
                            p1 = 1;
                            if (game.board[y1][x1] === a) {
                                let yx = true;
                                do {
                                    y1 += d[i][0];
                                    x1 += d[i][1];
                                    p1 += 1;
                                    if (y1 < 8 && y1 > -1 && x1 < 8 && x1 > -1) {
                                        if (game.board[y1][x1] === game.turn) {
                                            p.push(d[i].concat(p1));
                                            yx = false;
                                        } else if (game.board[y1][x1] !== a) {
                                            yx = false;
                                        }
                                    } else {
                                        yx = false;
                                    }
                                } while (yx);
                            }
                        }
                    }
                    if (p.length > 0) {
                        game.board[y][x] = true;
                        possible.push([y, x, p]);
                    }
                }
            }
        }
    }

    // Draws the row and column identifiers
    game.possible = possible;
    ctx.textAlign = "center";
    for (let i = 8; i--;) {
        ctx.fillText("ABCDEFGH".split('')[i], (i + 1) * 25 + 7.5, 42 + (25 * 8));
        ctx.fillText(i + 1, 13, (i + 1) * 25 + 21);
    }
    ctx.textAlign = "start";
  
    // Draws the pieces and possible moves
    for (let y = 0; y < 8; y++) {
        let r = 42.5 + (25 * y);
        for (let x = 0; x < 8; x++) {
            let c = (x + 1) * 25 + 7.5;

            if (game.board[y][x] === false && !quit) { // Blank Spot
                ctx.beginPath();
                ctx.strokeStyle = "rgba(200, 200, 200, 0.25)";
                ctx.moveTo(c + 5, r);
                ctx.arc(c, r, 5, 0, 2 * Math.PI);
                ctx.stroke();
  
            } else if (game.board[y][x] === true && !quit) { // Possible Placement
                ctx.beginPath();
                ctx.strokeStyle = "#8f8";
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

    // Counts scores
    ctx.textBaseline = "hanging";
    let k;
    game.score = [0, 0];
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (game.board[y][x] === 0) game.score[0] += 1;
            if (game.board[y][x] === 1) game.score[1] += 1;
        }
    }

    // Text after move (wins, whose turn it is, etc.)
    if (!end) { // Game not over yet
        ctx.font = "bold 20px calibri";
        let n = game.turn == 0 ? "Black" : "White";
        k = ctx.measureText(n).width;
        if (n == "Black") ctx.fillStyle = "#000";
        if (n == "White") ctx.fillStyle = "#fff";
        ctx.fillText(n, 5, 5);
        ctx.font = "20px calibri";
        ctx.fillStyle = "#888";
        ctx.fillText("'s turn.", k + 5, 5);
        k += ctx.measureText("'s turn.  ").width;
    } else if (quit) {
        ctx.font = "bold 20px calibri";
        let n = game.turn == 1 ? "Black" : "White";
        k = ctx.measureText(n).width;
        if (n == "Black") ctx.fillStyle = "#000";
        if (n == "White") ctx.fillStyle = "#fff";
        ctx.fillText(n, 5, 5);
        ctx.font = "20px calibri";
        ctx.fillText(" forfeits!", k + 5, 5);
        k += ctx.measureText(" forfeits!  ").width;
        game.winner = game.turn;
    } else if (game.score[0] !== game.score[1]) { // Winner winner chicken dinner
        ctx.font = "bold 20px calibri";
        let n = game.score[0] > game.score[1] ? "Black" : "White";
        k = ctx.measureText(n).width;
        if (n == "Black") ctx.fillStyle = "#000";
        if (n == "White") ctx.fillStyle = "#fff";
        ctx.fillText(n, 5, 5);
        ctx.font = "20px calibri";
        ctx.fillText(" wins!", k + 5, 5);
        k += ctx.measureText(" wins!  ").width;
 
        game.winner = game.score[0] > game.score[1] ? 0 : 1;
    } else if (game.score[0] == game.score[1]) { // Tie game
        ctx.fillStyle = "#888";
        ctx.font = "20px calibri";
        ctx.fillText("Tie game!", 5, 5);
  
        k = ctx.measureText("Tie game!  ").width;
    }

    // Draws the piece last played and pieces captured
    if (game.highlight && !quit) {
        for (let i = 0; i < game.highlight.length; i++) {
            r = 42.5 + (25 * game.highlight[i][0]);
            c = (game.highlight[i][1] + 1) * 25 + 7.5;
            ctx.strokeStyle = i == 0 ? "#88f" : "#f88";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(c + 10, r);
            ctx.arc(c, r, 10, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    // Displays score
    ctx.fillStyle = "#000";
    ctx.fillText(String(game.score[0]), k + 5, 5);
  
    k += ctx.measureText(String(game.score[0])).width;
    ctx.fillStyle = "#888";
    ctx.fillText(' - ', k + 5, 5);
  
    k += ctx.measureText(' - ').width;
    ctx.fillStyle = "#fff";
    ctx.fillText(String(game.score[1]), k + 5, 5);
  
    //
      
    return canvas.toBuffer();
}
  
exports.takeTurn = function(channel, Move) {
    let game = channels[channel.id];

    let move;
    let quit;
    if (Move !== "quit") move = [Move.match(/[1-8]/)[0] - 1, 'abcdefgh'.indexOf(Move.toLowerCase().match(/[a-h]/)[0])];
    else quit = true;
  
    // Function will vary with game
    if (!quit) {
        possible = game.possible;
        game.highlight = [];
        if (game.board[move[0]][move[1]] !== true) return "You cannot place there.";
        for (let i = 0; i < possible.length; i++) {
            if (move[0] == possible[i][0] && move[1] == possible[i][1]) {
                game.board[move[0]][move[1]] = game.turn;
                for (let x = 0; x < possible[i][2].length; x++) {
                    for (let y = 1; y < possible[i][2][x][2]; y++) {
                        game.board[move[0] + (possible[i][2][x][0] * y)][move[1] + (possible[i][2][x][1] * y)] = game.turn;
                        game.highlight.push([move[0] + (possible[i][2][x][0] * y), move[1] + (possible[i][2][x][1] * y)]);
                    }
                }
            }
        }
 
        game.highlight.unshift(move);
    }
  
    //
  
    if (!quit) game.timer = {
        time: 100 * 60 * 5,
        message: "Whoops, it looks like <@" + game.players[game.turn] + "> has run out of time, so the game is over!"
    }
    return exports.nextTurn(channel, quit);
}
  
exports.nextTurn = function(channel, quit) {
    let game = channels[channel.id];
    let board;
    if (quit) {
        game.turn = game.turn == 0 ? 1 : 0;
        game.buffer = exports.drawBoard(game, true, true);
        board = new Discord.Attachment(game.buffer, `${shortname}_1_${game.players[game.turn]}${game.casual ? "_fun" : ''}.png`);
        return board;
    }
    game.turn = game.turn == 0 ? 1 : 0;
    game.player = game.players[game.turn];
    game.buffer = exports.drawBoard(game, false);
    board = new Discord.Attachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    if (game.possible.length == 0) {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
        game.buffer = exports.drawBoard(game, false);
        board = new Discord.Attachment(game.buffer, `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
        if (game.possible.length == 0) {
            game.buffer = exports.drawBoard(game, true);
            board = new Discord.Attachment(game.buffer, game.score[0] !== game.score[1] ? `${shortname}_1_${game.players[game.winner]}${game.casual ? "_fun" : ''}.png` : `${shortname}_2_${game.players[0]}vs${game.players[1]}.png`);
        }
    }
    if (channels[channel.id].lastDisplay) channels[channel.id].lastDisplay.delete();
    return board;
}