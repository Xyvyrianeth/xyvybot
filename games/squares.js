const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Squares";
var shortname = "squares";
  
exports.newGame = function(channel, player) {
    let game = {
        buffer: {},
        channels: [channel],
        forfeit: false,
        game: shortname,
        highlight: false,
        lastDisplays: [],
        lastmove: '',
        player: false,
        players: [player],
        RE: /^([a-j] ?(?:10|[1-9])|(?:10|[1-9]) ?[a-j])$/i,
        score: [0, 0],
        started: false,
        turn: 0.5
    };
    games.push(game);

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
        message: `It appears nobody wants to play right now, <@${player}>.`
    }

    exports.say([channel], [`<@${player}> is now requesting a new game of ${gamename}!`, game.buffer]);
}
  
exports.startGame = function(channel1, channel2, player2) {
    let game = games.filter(game => game.channels.includes(channel1))[0];
    if (channel1 !== channel2) game.channels.push(channel2);
    game.players[1] = player2;
    game.started = true;
  
    if ((Math.random() * 2 | 0) == 0) game.players.push(game.players.shift()); // Makes player one random instead of always the challenger
    game.player = game.players[0];
  
    game.timer = {
        time: 6000,
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }
    
    game.buffer = new Discord.Attachment(gexports.drawBoard(game, 0, false), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be dark, and <@${game.players[1]}> will be light!`, game.buffer]);
}
  
exports.drawBoard = function(game, end, highlight) {
    let canvas = new Canvas.createCanvas(280, 300);
    let ctx = canvas.getContext('2d');
      
    ctx.drawImage(exports.Images.board, 0, 0);

    if (end === 0)
    {
        ctx.drawImage(exports.Images[["black", "white"][Math.floor(game.turn)] + "Text"], 32, 6);
        ctx.drawImage(exports.Images.turn, 88, 4);
    }
    else
    if (end === 1)
    {
        ctx.drawImage(exports.Images[["black", "white"][game.winner] + "Text"], 32, 6);
        ctx.drawImage(exports.Images.win, 88, 4);
    }
    else
    if (end === 2)
    {
        ctx.drawImage(exports.Images.tie, 14, 10);
    }
    
    for (let x = 0; x < 10; x++)
    {
        for (let y = 0; y < 10; y++)
        {
            if (end === 0 && 
                (highlight !== false && highlight[0] == x && highlight[1] == y) ||
                (game.highlight !== false && game.highlight[0] == x && game.highlight[1] == y)
            )
            {
                ctx.drawImage(exports.Images.highlight, 17 + (y * 25), 30 + (x * 25));
            }
            if (game.board[x][y] !== false)
            {
                ctx.drawImage(exports.Images[["black", "white"][game.board[x][y]]], 17 + (y * 25), 30 + (x * 25));
            }
        }
    }

    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[0]], 186, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[1]], 195, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[0]).length) + game.score[0]).split('')[2]], 204, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[0]], 219, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[1]], 228, 3);
    ctx.drawImage(exports.Images.numbers[('0'.repeat(3 - JSON.stringify(game.score[1]).length) + game.score[1]).split('')[2]], 237, 3);

    return canvas.toBuffer();
}
  
exports.takeTurn = function(channel, Move) {
    let game = games.filter(game => game.channels.includes(channel))[0];
    let move = [Move.match(/[0-9]{1,2}/)[0] - 1, 'abcdefghij'.indexOf(Move.toLowerCase().match(/[a-j]/)[0])];
    let highlight = move;
      
    // Function will vary with game
    if (game.board[move[0]][move[1]] !== false)
    {
        exports.say([channel], ["Someone has aleady played there, pick another spot!", {}]);
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

    if (game.turn == Math.floor(game.turn))
    {
        game.highlight = highlight;
    }
    else
    {
        game.highlight = false;
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
      
    exports.nextTurn(channel, end, highlight);
}
  
exports.nextTurn = function(channel, end, highlight) {
    let game = games.filter(game => game.channels.includes(channel))[0];
    if (end == 0)
    {
        game.turn = game.turn == 1.5 ? 0 : game.turn + 0.5;
        game.player = game.players[Math.floor(game.turn)];
        game.timer = {
            time: 6000,
            message: `Whoops, it looks like <@${game.players[Math.floor(game.turn)]}> has run out of time, so the game is over!`
        }
    }

    game.buffer = new Discord.Attachment(exports.drawBoard(game, end, highlight), end == 1 ? `${shortname}_${end}_${game.players[game.winner]}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
    for (let i = 0; i < game.lastDisplays.length; i++)
    {
        game.lastDisplays[i].delete();
    }

    exports.say(game.channels, [end == 0 ? `It is <@${game.player}>'s turn.` : end == 2 ?  "Tie game, everyone loses!" : `<@${game.players[game.score[0] > game.score[1] ? 0 : 1]}> has won!`, game.buffer]);
}

exports.say = function(channels, message) {
    for (let i = 0; i < channels.length; i++)
    {
        client.channels.get(channels[i]).send(message[0], message[1]);
    }
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