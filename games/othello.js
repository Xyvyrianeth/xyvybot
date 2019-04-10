const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Othello";
var shortname = "othello";
  
exports.newGame = function(channel, player) {
    let game = {
        buffer: {},
        channels: [channel],
        forfeit: false,
        game: shortname,
        highlight: [],
        lastmove: '',
        player: false,
        players: [player],
        RE: /^([a-h][1-8]|[1-8][a-h])$/i,
        score: [0, 0],
        started: false,
        turn: 0
    };
    channels.push(game);

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
        message: `It appears nobody wants to play right now, <@${player}>.`
    }

    exports.say([channel], [`<@${player}> is now requesting a new game of ${gamename}!`, {}]);
}

exports.startGame = function(channel1, channel2, player2) {
    let game = games.filter(game => game.channels.includes(channel1))[0];
    if (channel1 !== channel2) game.channels.push(channel2);
    game.players[1] = player2;
    game.started = true;
  
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
    game.player = game.players[0];
  
    game.timer = {
        time: 6000,
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }

    game.buffer =  new Discord.Attachment(exports.drawBoard(game, 0), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be dark, and <@${game.players[1]}> will be light!`, game.buffer]);
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
    
    game.score = [0, 0];
    for (let x = 0; x < 8; x++)
    {
        for (let y = 0; y < 8; y++)
        {
            if (typeof game.board[x][y] !== "boolean")
            {
                ctx.drawImage(exports.Images[["black", "white"][game.board[x][y]]], 17 + (y * 25), 30 + (x * 25));
                game.score[game.board[x][y]] += 1;
            }
        }
    }
    
    if (end === 0)
    {
        for (let i = 0; i < game.highlight.length; i++)
        {
            let spot = game.highlight[i];
            ctx.drawImage(i == 0 ? exports.Images.placed : exports.Images.captured, 17 + (spot[1] * 25), 30 + (spot[0] * 25));
        }
        for (let i = 0; i < game.possible.length; i++)
        {
            let spot = game.possible[i];
            ctx.drawImage(exports.Images.possible, 17 + (spot[1] * 25), 30 + (spot[0] * 25));
        }
    }

    ctx.drawImage(exports.Images.numbers[('0'.repeat(2 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[0]], 160, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(2 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[1]], 169, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(2 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[0]], 194, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(2 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[1]], 203, 3);
      
    return canvas.toBuffer();
}
  
exports.takeTurn = function(channel, Move) {
    let game = games.filter(game => game.channels.includes(channel))[0];
    let move = [Move.match(/[1-8]/)[0] - 1, 'abcdefgh'.indexOf(Move.toLowerCase().match(/[a-h]/)[0])];
  
    // Function will vary with game
    possible = game.possible;
    game.highlight = [];
    if (game.board[move[0]][move[1]] === false)
    {
        exports.say([channel], ["Someone has aleady played there, pick another spot!", {}]);
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
            if (game.board[y][x] === true)
            {
                game.board[y][x] = false;
            }
        }
    }

    // If empty spaces are available, this finds spaces that can be played in
    game.possible = [];
    let b = game.turn === 0 ? 1 : 0; // Opponent's piece
    let a = game.turn; // Not opponent's piece
    for (let y = 0; y < 8; y++)
    { 
        for (let x = 0; x < 8; x++)
        { // Goes through every spot on the board

            if (game.board[y][x] === false)
            { // If [this] spot is empty

                d = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]; // All 8 directions
                p = []; // Total directions that can be captured in [this]
                
                for (let i = 0; i < 8; i++)
                { // For all 8 directions...

                    if (y + d[i][0] < 8 && y + d[i][0] > -1 && x + d[i][1] < 8 && x + d[i][1] > -1)
                    { // If the next space in this [d]irection does not go off the edge
                    
                        let y1 = y + d[i][0]; // Y-coord of next space d
                        let x1 = x + d[i][1]; // X-coord of next space d
                        let p1 = 1; // How many pieces in [d]?

                        if (game.board[y1][x1] === a)
                        { // If the first piece in [d] belongs to the opponent

                            let yx = true; // Can we keep going this way?

                            do
                            { // Keep going in that direction
                                y1 += d[i][0]; // +1 in vertical direction
                                x1 += d[i][1]; // +1 in horizontal direction
                                p1 += 1; // +1 to distance
                                
                                if (y1 < 8 && y1 > -1 && x1 < 8 && x1 > -1)
                                { // Next spot does not go off the endge

                                    if (game.board[y1][x1] === b)
                                    { // Next spot belongs to the active player

                                        p.push(d[i].concat(p1)); // Add this direction as well as the number of pieces in this direction to this spot for the possible list
                                        yx = false; // We can no longer go this way
                                    }
                                    else
                                    if (typeof game.board[y1][x1] == "boolean")
                                    { // Next spot is blank
                                        yx = false; // We can no longer go this way
                                    }
                                }
                                else
                                { // Next spot goes off the edge
                                    yx = false; // We can no longer go this way
                                }
                            }
                            while (yx); // Let's keep going this way
                        }
                    }
                }
                if (p.length > 0)
                { // For every direction in this spot

                    game.board[y][x] = true; // This spot can be played in
                    game.possible.push([y, x, p]); // And this is the information for what pieces to turn if played here next
                }
            }
        }
    }
    //
    
    exports.nextTurn(channel);
}
  
exports.nextTurn = function(channel) {
    let game = games.filter(game => game.channels.includes(channel))[0];
    let end = 0;
    game.turn = game.turn == 0 ? 1 : 0;
    game.player = game.players[game.turn];
    game.timer = {
        time: 6000,
        message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
    }
    game.buffer = new Discord.Attachment(exports.drawBoard(game, 0), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    if (game.possible.length == 0)
    {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
        game.timer = {
            time: 6000,
            message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
        }
        game.buffer = new Discord.Attachment(exports.drawBoard(game, 0), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
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
            game.buffer = new Discord.Attachment(exports.drawBoard(game, end), end == 1 ? `${shortname}_1_${game.players[game.winner]}.png` : `${shortname}_2_${game.players[0]}vs${game.players[1]}.png`);
        }
    }
    
    for (let i = 0; i < game.lastDisplays.length; i++)
    {
        game.lastDisplays.delete();
    }

    exports.say(game.channels, [end == 0 ? `It is <@${game.player}>'s turn.` : end == 1 ? `<@${game.player}> has won!` : "Tie game, everyone loses!", game.buffer]);
}

exports.say = function(channels, message) {
    for (let i = 0; i < channels.length; i++)
    {
        client.channels.get(channels[i]).send(message[0], message[1]);
    }
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