const Discord = require("discord.js");
const Canvas = require("canvas");
const { games } = require("/app/games/games.js");
const { client } = require("/app/Xyvy.js");
var gamename = "Ordo";
var shortname = "ordo";
  
exports.newGame = function(channel, player, here) {
    let game = {
        buffer: {},
        channels: {},
        forfeit: false,
        game: shortname,
        here: here,
        highlight: [[], []],
        over: false,
        player: false,
        players: [player],
        started: false,
        turn: 0
    };
    game.channels[channel] = [];
    games.push(game);

    let _ = false;
    game.board = [
        [_, _, 0, 0, _, _, 0, 0, _, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, _, _, 0, 0, _, _, 0, 0],
        [_, _, _, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _, _, _],
        [1, 1, _, _, 1, 1, _, _, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [_, _, 1, 1, _, _, 1, 1, _, _]
    ];
  
    game.timer = {
        time: 900,
        message: `It appears nobody wants to play right now, <@${player}>.`
    }

    exports.say(game.channels, [`<@${player}> is now requesting a new game of ${gamename}!`, game.buffer]);
}
  
exports.startGame = function(channel1, channel2, player2) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel1))[0];
    if (channel1 !== channel2) game.channels[channel2] = [];
    game.players[1] = player2;
    game.started = true;
  
    if ((Math.random() * 2 | 0) == 0) game.players.reverse();
    game.player = game.players[0];
  
    game.timer = {
        time: 600,
        message: `Whoops, it looks like <@${game.players[0]}> has run out of time, so the game is over!`
    }
    
    game.buffer = new Discord.Attachment(exports.drawBoard(game, 0, false), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`);
    exports.say(game.channels, [`The game has started! <@${game.players[0]}> will be Blue, and <@${game.players[1]}> will be White!\nUse the command \"x!${shortname} rules\" if you don't know how to play the game!`, game.buffer]);
}
  
exports.drawBoard = function(game, end) {
    let canvas = new Canvas.createCanvas(271, 246);
    let ctx = canvas.getContext('2d');
      
    ctx.drawImage(exports.Images.board, 0, 0);
      
    ctx.drawImage(exports.Images.board, 0, 0);

    if (end === 0)
    {
        ctx.drawImage(exports.Images[["blue", "white"][game.turn] + "Text"], 20, 6);
        ctx.drawImage(exports.Images.turn, 70 + (6 * game.turn), 4);
    }
    else
    {
        ctx.drawImage(exports.Images[["blue", "white"][game.winner] + "Text"], 20, 6);
        ctx.drawImage(exports.Images.win, 75 + (6 * game.winner), 6);
    }
    
    for (let y = 0; y < 8; y++)
    {
        for (let x = 0; x < 10; x++)
        {
            let X = 17 + (x * 25);
            let Y = 30 + (y * 25);
            if (game.board[y][x] !== false)
            {
                ctx.drawImage(exports.Images[["blue", "white"][game.board[y][x]]], X, Y);
            }

            if (end > 0 && game.highlight[1].some(h => h[0] == y && h[1] == x))
            {
                ctx.drawImage(exports.Images.winHighlight, X, Y);
            }
            else
            if (game.highlight[0].some(h => h[0] == y && h[1] == x))
            {
                ctx.drawImage(exports.Images.from, X, Y);
            }
            else
            if (game.highlight[1].some(h => h[0] == y && h[1] == x))
            {
                ctx.drawImage(exports.Images.to, X, Y);
            }
            else
            if (y == [7, 0][game.turn])
            {
                ctx.drawImage(exports.Images[["blue", "white"][game.turn] + "HomeRow"], X, Y);
            }
        }
    }

    return canvas.toBuffer();
}
  
exports.takeTurn = function(channel, Move) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
    let move;
    let end;
    Move = Move.toLowerCase();
    if (/^([a-j][1-8] [a-j][1-8]|[1-8][a-j] [1-8][a-j])$/.test(Move))
    {
        move = {
            from: [[Number(Move.split(' ')[0].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[0].match(/[a-j]/)[0])]],
            to:   [[Number(Move.split(' ')[1].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[1].match(/[a-j]/)[0])]]
        };
        let dir = move.from[0][0] < move.to[0][0] ? move.from[0][1] > move.to[0][1] ? 5 : move.from[0][1] < move.to[0][1] ? 3 : 4 : move.from[0][0] > move.to[0][0] ? move.from[0][1] > move.to[0][1] ? 7 : move.from[0][1] < move.to[0][1] ? 1 : 0 : move.from[0][1] > move.to[0][1] ? 6 : move.from[0][1] < move.to[0][1] ? 2 : 8;
        let dis = move.from[0][1] == move.to[0][1] ? Math.abs(move.from[0][0] - move.to[0][0]) : Math.abs(move.from[0][1] - move.to[0][1]);
        if (game.board[move.from[0][0]][move.from[0][1]] !== game.turn)
        {
            return exports.say(channel, ["Illegal move: you do not have a stone in this spot"]);
        }
        if (dir == 8 || dis == 0)
        {
            return exports.say(channel, ["Illegal move: you actually have to mvoe the stone."]);
        }
        if (move.from[0][0] != move.to[0][0] && move.from[0][1] != move.to[0][1] && Math.abs(move.from[0][0] - move.to[0][0]) != Math.abs(move.from[0][1] - move.to[0][1]))
        {
            return exports.say(channel, ["Illegal move: attempted movement is neither diagonal nor orthagonal."]);
        }
        for (let i = 1; i <= dis; i++)
        {
            if (i < dis && game.board[move.from[0][0] + ([-1, -1, 0, 1, 1, 1, 0, -1][dir] * i)][move.from[0][1] + ([0, 1, 1, 1, 0, -1, -1, -1][dir] * i)] !== false)
            {
                return exports.say(channel, ["Illegal move: a stone is blocking this movement."]);
            }
            if (i == dis && game.board[move.from[0][0] + ([-1, -1, 0, 1, 1, 1, 0, -1][dir] * i)][move.from[0][1] + ([0, 1, 1, 1, 0, -1, -1, -1][dir] * i)] === game.turn)
            {
                return exports.say(channel, ["Illegal move: you cannot capture your own stone."]);
            }
        }
    }
    else
    if (/^([a-j][1-8]-[a-j][1-8]|[1-8][a-j]-[1-8][a-j]) (up|right|down|left|[urdl]) [1-9]$/.test(Move))
    {
        dir = {
            "up": 0,
            "u": 0,
            "right": 1,
            "r": 1,
            "down": 2,
            "d": 2,
            "left": 3,
            "l": 3
        }[Move.split(' ')[1]];
        dis = Number(Move.split(' ')[2]);
        stones = [
            [Number(Move.split(' ')[0].split('-')[0].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[0].split('-')[0].match(/[a-j]/)[0])],
            [Number(Move.split(' ')[0].split('-')[1].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[0].split('-')[1].match(/[a-j]/)[0])]
        ];
        Stones = [];
        if (stones[0][0] == stones[1][0] && stones[0][1] == stones[1][1])
        {
            return exports.say(channel, ["This is a singleton move, please use the singleton move format!"]);
        }
        if (stones[0][0] != stones[1][0] && stones[0][1] != stones[1][1])
        {
            return exports.say(channel, ["Illegal move: stones trying to be moved are not alligned orthagonally."]);
        }
        else
        if ((stones[0][1] == stones[1][1] && (dir == 0 || dir == 2)) || (stones[0][0] == stones[1][0] && (dir == 1 || dir == 3)))
        {
            return exports.say(channel, ["Illegal move: multiple stones cannot be moved single-file."]);
        }
        else
        if (stones[0][0] == stones[1][0])
        {
            if (stones[0][1] > stones[1][1])
            {
                stones.push(stones.shift());
            }
            for (let x = stones[0][1]; x <= stones[1][1]; x++)
            {
                Stones.push([stones[0][0], x]);
            }
            wid = stones[1][1] - stones[0][1];
        }
        else
        {
            if (stones[0][0] > stones[1][0])
            {
                stones.push(stones.shift());
            }
            for (let y = stones[0][0]; y <= stones[1][0]; y++)
            {
                Stones.push([y, stones[0][1]]);
            }
            wid = stones[1][0] - stones[0][0];
        }
        move = {
            from: Stones,
            to:   Stones.map(p => p = [p[0] + ([-1, 0, 1, 0][dir] * dis), p[1] + ([0, 1, 0, -1][dir] * dis)])
        }
        if (move.from.some(s => game.board[s[0]][s[1]] !== game.turn))
        {
            return exports.say(channel, ["Illegal move: one or more of the stones you're trying to move aren't yours."]);
        }
        if (
            (dir == 0 && game.board.some((Y, y) => Y.some((X, x) => y < move.from[0][0] && y >= move.to[0][0] && x >= move.from[0][1] && x <= move.to[wid][1] && game.board[y][x] !== false))) ||
            (dir == 2 && game.board.some((Y, y) => Y.some((X, x) => y > move.from[0][0] && y <= move.to[0][0] && x >= move.from[0][1] && x <= move.to[wid][1] && game.board[y][x] !== false))) ||
            (dir == 1 && game.board.some((Y, y) => Y.some((X, x) => y >= move.from[0][0] && y <= move.to[wid][0] && x > move.from[0][1] && x <= move.to[0][1] && game.board[y][x] !== false))) ||
            (dir == 3 && game.board.some((Y, y) => Y.some((X, x) => y >= move.from[0][0] && y <= move.to[wid][0] && x < move.from[0][1] && x >= move.to[0][1] && game.board[y][x] !== false)))
        )
        {
            return exports.say(channel, ["Illegal move: a stone is blocking that movement"]);
        }
    }
    
    for (let i = 0; i < move.from.length; i++)
    {
        game.board[move.from[i][0]][move.from[i][1]] = false;
        game.board[move.to[i][0]][move.to[i][1]] = game.turn;
    }
    
    let queue = [[], []];
    let evaluating = [[], []];
    let confirmed = [[], []];
    let count = 0;
    for (let P = 0; P < 2; P++)
    {
        for (let y = 0; y < 8; y++)
        {
            for (let x = 0; x < 10; x++)
            {
                if (game.board[y][x] === P)
                {
                    count++;
                    queue[P].push([y, x]);
                }
            }
        }
        if (count == 0)
        {
            break;
        }
        else
        {
            evaluating[P].push(queue[P].shift());
            while (evaluating[P].length != 0) {
                let evaluated = evaluating[P];
                evaluating[P] = [];
                for (let i = 0; i < evaluated.length; i++)
                {
                    confirmed[P].push(evaluated[i])
                    for (let d = 0; d < 8; d++)
                    {
                        Y = evaluated[i][0] + [-1, -1, 0, 1, 1, 1, 0, -1][d];
                        X = evaluated[i][1] + [0, 1, 1, 1, 0, -1, -1, -1][d];
                        if (Y != -1 && Y != 8 && X != -1 && Y != 10)
                        {
                            if (queue[P].some(s => s[0] == Y && s[1] == X))
                            {
                                evaluating[P].push([Y, X]);
                                queue[P] = queue[P].filter(s => s[0] != Y || s[1] != X);
                            }
                        }
                    }
                }
            }
        }
    }
    if (count == 0)
    {
        end = 2;
    }
    if (queue[game.turn].length != 0)
    {
        for (let i = 0; i < move.from.length; i++)
        {
            game.board[move.from[i][0]][move.from[i][1]] = game.turn;
            game.board[move.to[i][0]][move.to[i][1]] = false;
        }
        return exports.say(channel, [game.split ? "Illegal move: would not reconnect your stones into one group." : "Illegal move: would split your stones into more than one group."]);
    }
    else
    if (game.board[[7, 0][game.turn]].some(p => p === game.turn))
    {
        end = 1;
    }
    else
    if (queue[[1, 0][game.turn]].length > 0)
    {
        let possible = false;
        // Checking for singleton moves that can reconnect
        let d = [[0, 0], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];
        let save = [];
        for (let D = 0; D < 9; D++) {
            let c = [move.to[0][0] + d[D][0], move.to[0][1] + d[D][1]];
            for (let y = 0; y < 8; y++)
            {
                for (let x = 0; x < 10; x++)
                {
                    if ((c[0] == y || c[1] == x || Math.abs(y - c[0]) == Math.abs(x - c[1])) && game.board[y][x] === [1, 0][game.turn] && !(c[0] == y && c[1] == x) && game.board[c[0]][c[1]] !== [1, 0][game.turn])
                    {
                        let dis;
                        if (c[0] == y)
                        {
                            dis = Math.abs(c[1] - x);
                        }
                        else
                        {
                            dis = Math.abs(c[0] - y);
                        }
                        let between = [];
                        for (let i = 1; i < dis; i++)
                        {
                            between.push(game.board[c[0] - (i * (c[0] != y ? (c[0] - y) / Math.abs(c[0] - y) : 0))][c[1] - (i * (c[1] != x ? (c[1] - x) / Math.abs(c[1] - x) : 0))]);
                        }
                        if (!between.some(k => k !== false))
                        {
                            save.push([y, x, c[0], c[1]]);
                        }
                    }
                }
            }
        }
        for (let i = 0; i < save.length; i++)
        {
            let s = save[i];
            let board = [];
            for (let y = 0; y < 8; y++)
            {
                board.push(game.board[y].slice(0));
            }
            board[s[0]][s[1]] = false;
            board[s[2]][s[3]] = [1, 0][game.turn];
            let queue = [];
            let evaluating = [];
            let confirmed = [];
            for (let y = 0; y < 8; y++)
            {
                for (let x = 0; x < 10; x++)
                {
                    if (board[y][x] === [1, 0][game.turn])
                    {
                        queue.push([y, x]);
                    }
                }
            }
            evaluating.push(queue.shift());
            while (evaluating.length != 0) {
                let evaluated = evaluating;
                evaluating = [];
                for (let i = 0; i < evaluated.length; i++)
                {
                    confirmed.push(evaluated[i])
                    for (let d = 0; d < 8; d++)
                    {
                        Y = evaluated[i][0] + [-1, -1, 0, 1, 1, 1, 0, -1][d];
                        X = evaluated[i][1] + [0, 1, 1, 1, 0, -1, -1, -1][d];
                        if (Y != -1 && Y != 8 && X != -1 && Y != 10)
                        {
                            if (queue.some(s => s[0] == Y && s[1] == X))
                            {
                                evaluating.push([Y, X]);
                                queue = queue.filter(s => s[0] != Y || s[1] != X);
                            }
                        }
                    }
                }
            }
            if (queue.length == 0)
            {
                possible = true;
                break;
            }
        }

        if (!possible) // Ordo moves that reconnect
        {
            let d = [[0, 0], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];
            let save = [];
            for (let D = 0; D < 9; D++) {
                let c = [move.to[0][0] + d[D][0], move.to[0][1] + d[D][1]];
                for (let y = 0; y < 8; y++)
                {
                    for (let x = 0; x < 10; x++)
                    {
                        if ((c[0] == y || c[1] == x) && game.board[y][x] === [1, 0][game.turn] && !(c[0] == y && c[1] == x) && game.board[c[0]][c[1]] === false)
                        {
                            let dis;
                            if (c[0] == y)
                            {
                                dis = Math.abs(c[1] - x);
                            }
                            else
                            {
                                dis = Math.abs(c[0] - y);
                            }
                            if (c[0] == y)
                            {
                                let l = 0;
                                while (y - l > -1 && game.board[y - l][x] === [1, 0][game.turn] && game.board[c[0] - l][c[1]] !== false)
                                {
                                    if (!game.board[y - l].some((a, b) => ((c[1] > x && b < c[1] && b > x) || (x > c[1] && b < x && b > c[1])) && a === false))
                                    {
                                        save.push([[y - l, y], [x, x], [c[0] - l, c[0]], [c[1], c[1]]]);
                                    }
                                    l++;
                                }
                                l = 0;
                                while (y + l < 8 && game.board[y + l][x] === [1, 0][game.turn] && game.board[c[0] + l][c[1]] !== false)
                                {
                                    if (!game.board[y + l].some((a, b) => ((c[1] > x && b < c[1] && b > x) || (x > c[1] && b < x && b > c[1])) && a === false))
                                    {
                                        save.push([[y, y + l], [x, x], [c[0], c[0] + l], [c[1], c[1]]]);
                                    }
                                    l++;
                                }
                            }
                            if (c[1] == x)
                            {
                                let l = 0;
                                while (x - l > -1 && game.board[y][x - l] === [1, 0][game.turn] && game.board[c[0]][c[1] - l] !== false)
                                {
                                    if (!game.board.some((a, b) => ((c[0] > x && b < c[0] && b > x) || (x > c[0] && b < x && b > c[0])) && game.board[a][x - l] === false))
                                    {
                                        save.push([[y, y], [x - l, x], [c[0], c[0]], [c[1] - l, c[1]]]);
                                    }
                                    l++;
                                }
                                l = 0;
                                while (x + l < 10 && game.board[y][x + l] === [1, 0][game.turn] && game.board[c[0]][c[1] + l] !== false)
                                {
                                    if (!game.board.some((a, b) => ((c[0] > x && b < c[0] && b > x) || (x > c[0] && b < x && b > c[0])) && game.board[a][x + l] === false))
                                    {
                                        save.push([[y, y], [x, x + l], [c[0], c[0]], [c[1], c[1] + l]]);
                                    }
                                    l++;
                                }
                            }
                        }
                    }
                }
            }
            for (let i = 0; i < save.length; i++)
            {
                let s = save[i];
                let board = [];
                for (let y = 0; y < 8; y++)
                {
                    board.push(game.board[y].slice(0));
                }
                for (let y = s[0][0]; y <= s[0][1]; y++)
                {
                    for (let x = s[1][0]; x <= s[1][1]; x++)
                    {
                        board[y][x] = false;
                    }
                }
                for (let y = s[2][0]; y <= s[2][1]; y++)
                {
                    for (let x = s[3][0]; x <= s[3][1]; x++)
                    {
                        board[y][x] = [1, 0][game.turn];
                    }
                }
                let queue = [];
                let evaluating = [];
                let confirmed = [];
                for (let y = 0; y < 8; y++)
                {
                    for (let x = 0; x < 10; x++)
                    {
                        if (board[y][x] === [1, 0][game.turn])
                        {
                            queue.push([y, x]);
                        }
                    }
                }
                evaluating.push(queue.shift());
                while (evaluating.length != 0) {
                    let evaluated = evaluating;
                    evaluating = [];
                    for (let i = 0; i < evaluated.length; i++)
                    {
                        confirmed.push(evaluated[i])
                        for (let d = 0; d < 8; d++)
                        {
                            Y = evaluated[i][0] + [-1, -1, 0, 1, 1, 1, 0, -1][d];
                            X = evaluated[i][1] + [0, 1, 1, 1, 0, -1, -1, -1][d];
                            if (Y != -1 && Y != 8 && X != -1 && Y != 10)
                            {
                                if (queue.some(s => s[0] == Y && s[1] == X))
                                {
                                    evaluating.push([Y, X]);
                                    queue = queue.filter(s => s[0] != Y || s[1] != X);
                                }
                            }
                        }
                    }
                }
                if (queue.length == 0)
                {
                    possible = true;
                    break;
                }
            }

        }

        if (possible)
        {
            game.split = true;
            end = 0;
        }
        else
        {
            end = 3;
        }
    }
    else
    {
        game.split = false;
        end = 0;
    }

    game.highlight = Object.values(move);
      
    exports.nextTurn(channel, end);
}
  
exports.nextTurn = function(channel, end) {
    let game = games.filter(game => game.channels.hasOwnProperty(channel))[0];
    if (end == 0)
    {
        game.turn = [1, 0][game.turn];
        game.player = game.players[game.turn];
        game.timer = {
            time: 600,
            message: `Whoops, it looks like <@${game.players[game.turn]}> has run out of time, so the game is over!`
        }
    }
    else
    {
        game.winner = game.turn;
    }

    game.buffer = new Discord.Attachment(exports.drawBoard(game, end), end == 0 ? `${shortname}_0_${game.players[0]}vs${game.players[1]}.png` : `${shortname}_1_${game.players[game.winner]}.png`);
    for (let ch in game.channels)
    {
        for (let i = 0; i < game.channels[ch].length; i++)
        {
            client.channels.get(ch).messages.get(game.channels[ch][i]).delete();
        }
        game.channels[ch] = [];
    }

    exports.say(game.channels, [[game.split ? `It is <@${game.player}>'s turn.\nYour stones have been split into more than one group, you *must* bring them back together immediately.` : `It is <@${game.player}>'s turn.`, `<@${game.player}> has won by reaching the opponent's home row!`, `<@${game.player}> has won by capturing all of the opponent's stones!`, `<@${game.player}> has won by isolating their opponent's pieces!`][end], game.buffer]);
}

exports.say = function(channels, message) {
    if (typeof channels == "string") {
        client.channels.get(channels).send(message[0], message[1]);
    }
    else
    {
        for (let i in channels)
        {
            client.channels.get(i).send(message[0], message[1]);
        }
    }
}

// Images

exports.Images = {};

Canvas.loadImage("/app/assets/games/ordo/board.png").then(image => {
    exports.Images.board = image;
});
Canvas.loadImage("/app/assets/games/ordo/blue.png").then(image => {
    exports.Images.blue = image;
});
Canvas.loadImage("/app/assets/games/ordo/white.png").then(image => {
    exports.Images.white = image;
});
Canvas.loadImage("/app/assets/games/ordo/to.png").then(image => {
    exports.Images.to = image;
});
Canvas.loadImage("/app/assets/games/ordo/from.png").then(image => {
    exports.Images.from = image;
});
Canvas.loadImage("/app/assets/games/ordo/winHighlight.png").then(image => {
    exports.Images.winHighlight = image;
});
Canvas.loadImage("/app/assets/games/ordo/blueText.png").then(image => {
    exports.Images.blueText = image;
});
Canvas.loadImage("/app/assets/games/ordo/whiteText.png").then(image => {
    exports.Images.whiteText = image;
});
Canvas.loadImage("/app/assets/games/ordo/blueHomeRow.png").then(image => {
    exports.Images.blueHomeRow = image;
});
Canvas.loadImage("/app/assets/games/ordo/whiteHomeRow.png").then(image => {
    exports.Images.whiteHomeRow = image;
});
Canvas.loadImage("/app/assets/games/ordo/turn.png").then(image => {
    exports.Images.turn = image;
});
Canvas.loadImage("/app/assets/games/ordo/win.png").then(image => {
    exports.Images.win = image;
});
Canvas.loadImage("/app/assets/games/ordo/tie.png").then(image => {
    exports.Images.tie = image;
});