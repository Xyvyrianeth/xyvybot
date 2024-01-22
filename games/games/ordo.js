import { Client } from "../../index.js";

export function newGame(player, id) {
    let _ = false;
    return {
        split: 0,
        turnColors: ["#6666ff", "#fefefe"],
        board: [
            // [_, _, 0, 0, _, _, 0, 0, _, _],
            // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            // [0, 0, _, _, 0, 0, _, _, 0, 0],
            // [_, _, _, _, _, _, _, _, _, _],
            // [_, _, _, _, _, _, _, _, _, _],
            // [1, 1, _, _, 1, 1, _, _, 1, 1],
            // [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            // [_, _, 1, 1, _, _, 1, 1, _, _] ],
            [_, _, 0, _, _, _, _, _, _, _],
            [_, 0, _, _, _, _, _, _, _, _],
            [_, 0, _, _, _, _, _, _, _, _],
            [_, 0, _, _, _, _, _, _, 1, _],
            [_, 0, _, _, _, _, _, _, 1, _],
            [_, 0, _, _, _, _, _, _, 1, _],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [_, _, _, _, _, _, _, _, _, _] ],
        endMessage: function() {
            return  [ [ `It is <@${this.player}>'s turn.`,
                        `It is <@${this.player}>'s turn.\nYour pieces have been split into more than one group, you *must* bring them back together immediately.` ][this.split],
                      [ `<@${this.players[this.winner]}> has won by reaching their opponent's home row!`,
                        `<@${this.players[this.winner]}> has won by capturing all of their opponent's pieces!`,
                        `<@${this.players[this.winner]}> has won by splitting up their opponent's pieces!` ][this.endType] ][this.end];
        },
        interpretMove: function(Move) {
            if (/^([a-j][1-8] [a-j][1-8]|[1-8][a-j] [1-8][a-j])$/.test(Move))
            {
                const move = {
                    from: [ [ Number(Move.split(' ')[0].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[0].match(/[a-j]/)[0]) ] ],
                    to:   [ [ Number(Move.split(' ')[1].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[1].match(/[a-j]/)[0]) ] ]
                };

                let direction = 8;
                if (move.from[0][0] >  move.to[0][0] && move.from[0][1] == move.to[0][1]) direction = 0;
                if (move.from[0][0] >  move.to[0][0] && move.from[0][1] <  move.to[0][1]) direction = 1;
                if (move.from[0][0] == move.to[0][0] && move.from[0][1] <  move.to[0][1]) direction = 2;
                if (move.from[0][0] <  move.to[0][0] && move.from[0][1] <  move.to[0][1]) direction = 3;
                if (move.from[0][0] <  move.to[0][0] && move.from[0][1] == move.to[0][1]) direction = 4;
                if (move.from[0][0] <  move.to[0][0] && move.from[0][1] >  move.to[0][1]) direction = 5;
                if (move.from[0][0] == move.to[0][0] && move.from[0][1] >  move.to[0][1]) direction = 6;
                if (move.from[0][0] >  move.to[0][0] && move.from[0][1] >  move.to[0][1]) direction = 7;
                let distance = move.from[0][1] == move.to[0][1] ? Math.abs(move.from[0][0] - move.to[0][0]) : Math.abs(move.from[0][1] - move.to[0][1]);

                if (this.board[move.from[0][0]][move.from[0][1]] === false)
                {
                    return "there is no piece to move in that space.";
                }

                if (this.board[move.from[0][0]][move.from[0][1]] == [1, 0][this.turn])
                {
                    return "that piece is not yours.";
                }

                if (direction == 8 || distance == 0)
                {
                    return "you actually have to move the piece.";
                }

                if (move.from[0][0] != move.to[0][0] && move.from[0][1] != move.to[0][1] && Math.abs(move.from[0][0] - move.to[0][0]) != Math.abs(move.from[0][1] - move.to[0][1]))
                {
                    return "pieces can only be moved diagonally or orthagonally.";
                }

                for (let i = 1; i <= distance; i++)
                {
                    if (i < distance && this.board[move.from[0][0] + ([-1, -1, 0, 1, 1, 1, 0, -1][direction] * i)][move.from[0][1] + ([0, 1, 1, 1, 0, -1, -1, -1][direction] * i)] !== false)
                    {
                        return "a piece is blocking this movement.";
                    }
                    if (i == distance && this.board[move.from[0][0] + ([-1, -1, 0, 1, 1, 1, 0, -1][direction] * i)][move.from[0][1] + ([0, 1, 1, 1, 0, -1, -1, -1][direction] * i)] === this.turn)
                    {
                        return "you cannot capture your own pieces.";
                    }
                }

                return move
            }
            else
            if (/^([a-j][1-8]-[a-j][1-8]|[1-8][a-j]-[1-8][a-j]) (up|right|down|left|[urdl]|north|east|south|west|[nesw]) [0-9]$/.test(Move)) // Ordo moves
            {   // Exampe: "5A-7A right 4"
                let dir = { "r": 1, "u": 0, "d": 2, "l": 3, "n": 0, "e": 1, "s": 2, "w": 3, "1": 0, "2": 1, "3": 2, "4": 3,
                    "up": 0, "right": 1, "down": 2, "left": 3, "north": 0, "east": 1, "south": 2, "west": 3 }[Move.split(' ')[1]]; // 1
                let dis = Number(Move.split(' ')[2]); // 4
                let pieces = [
                    [Number(Move.split(' ')[0].split('-')[0].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[0].split('-')[0].match(/[a-j]/)[0])],
                    [Number(Move.split(' ')[0].split('-')[1].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[0].split('-')[1].match(/[a-j]/)[0])]
                ];  // [ [4, 0], [6, 0] ]
                let width;
                let Pieces = [];

                if (dis == 0)
                {
                    return "you have to actually move pieces.";
                }

                if (pieces[0][0] == pieces[1][0] && pieces[0][1] == pieces[1][1])
                {
                    return "this is a singleton move, so please use the singleton move format.";
                }

                if (pieces[0][0] != pieces[1][0] && pieces[0][1] != pieces[1][1])
                {
                    return "pieces you are trying move are not alligned orthagonally.";
                }
                else
                if ((pieces[0][1] == pieces[1][1] && (dir == 0 || dir == 2)) || (pieces[0][0] == pieces[1][0] && (dir == 1 || dir == 3)))
                {
                    return "multiple pieces cannot be moved single-file.";
                }
                else
                if (pieces[0][0] == pieces[1][0])
                {
                    if (pieces[0][1] > pieces[1][1])
                    {
                        pieces.reverse();
                    }

                    for (let x = pieces[0][1]; x <= pieces[1][1]; x++)
                    {
                        Pieces.push([pieces[0][0], x]);
                    }

                    width = pieces[1][1] - pieces[0][1];
                }
                else
                {
                    if (pieces[0][0] > pieces[1][0])
                    {
                        pieces.reverse();
                    }

                    for (let y = pieces[0][0]; y <= pieces[1][0]; y++)
                    {
                        Pieces.push([y, pieces[0][1]]);
                    }

                    width = pieces[1][0] - pieces[0][0];
                }

                if (Pieces.some(p => p[0] + ([-1, 0, 1, 0][dir] * dis) > 8 || p[0] + ([-1, 0, 1, 0][dir] * dis) < 0 || p[1] + ([0, 1, 0, -1][dir] * dis) > 10 || p[1] + ([0, 1, 0, -1][dir] * dis) < 0))
                {
                    return "you cannot move pieces off the board.";
                }

                const move = {
                    from: Pieces,
                    to:   Pieces.map(p => p = [p[0] + ([-1, 0, 1, 0][dir] * dis), p[1] + ([0, 1, 0, -1][dir] * dis)])
                };

                if (move.from.some(s => this.board[s[0]][s[1]] !== this.turn))
                {
                    return "one or more of the pieces you're trying to move aren't yours.";
                }
                if ((dir == 0 && this.board.some((Y, y) => Y.some((X, x) => y <  move.from[0][0] && y >= move.to[0][0]      && x >= move.from[0][1] && x <= move.to[width][1] && this.board[y][x] !== false))) || (dir == 2 && this.board.some((Y, y) => Y.some((X, x) => y > move.from[0][0] && y <= move.to[0][0] && x >= move.from[0][1] && x <= move.to[width][1] && this.board[y][x] !== false))) || (dir == 1 && this.board.some((Y, y) => Y.some((X, x) => y >= move.from[0][0] && y <= move.to[width][0] && x >  move.from[0][1] && x <= move.to[0][1] && this.board[y][x] !== false))) || (dir == 3 && this.board.some((Y, y) => Y.some((X, x) => y >= move.from[0][0] && y <= move.to[width][0] && x <  move.from[0][1] && x >= move.to[0][1] && this.board[y][x] !== false))))
                {
                    return "one or more pieces are blocking that movement (ordo moves cannot capture enemy pieces).";
                }

                return move;
            }
        },
        playerTurn: function(Move) {
            this.end;
            this.highlight = [];
            Move = Move.toLowerCase();
            let move = this.interpretMove(Move);
            if (typeof move == "string")
            {
                return "move";
            }

            let pieces = [];
            let board = this.board.clone();

            for (let i = 0; i < move.from.length; i++)
            {
                pieces[i] = board[move.from[i][0]][move.from[i][1]];
                board[move.from[i][0]][move.from[i][1]] = false;
                board[move.to[i][0]][move.to[i][1]] = this.turn;
            }

            if (!this.checkGroup(0, board))
            {
                if (this.split === 1)
                {
                    return "would not reconnect your pieces into one group.";
                }
                else
                {
                    return "would split your pieces into more than one group.";
                }
            }

            this.board = board.clone();

            if (this.board[[7, 0][this.turn]].some(p => p === this.turn))
            {
                this.end = 1;
                this.endType = 0;
            }
            else
            if (!this.board.some(y => y.some(x => x == [1, 0][this.turn])))
            {
                this.end = 1;
                this.endType = 1;
            }
            else
            if (!this.checkGroup(1, this.board))
            {
                this.split = 1;

                if (!this.canReconnect())
                {
                    this.end = 1;
                    this.endType = 2;
                }
            }
            else
            {
                this.split = 0;
            }

            if (this.end === 0)
            {
                this.turn = [1, 0][this.turn];
                this.player = this.players[this.turn];
            }
            else
            {
                this.winner = this.turn;
            }

            this.highlight = Object.values(move);

            this.replay.push(Move);

            return false;
        },
        checkGroup: function(turn, board) {
            let queue = [];
            let confs = [];
            let allPieces = 0;
            let group = 0;

            turn = [this.turn, [1, 0][this.turn]][turn];

            for (let y = 0, x = 0; y < 8; x < 9 ? x++ : (y++, x = 0))
            {
                if (board[y][x] === turn)
                {
                    allPieces++;
                }
            }

            let queues = [];

            for (let y = 0, x = 0; y < 8; x < 9 ? x++ : (y++, x = 0))
            {
                if (board[y][x] === turn)
                {
                    queues.push([y, x]);
                }
            }

            queue.push(queues[0]);

            while (queue.length != 0)
            {
                for (let i = 0; i < queue.length; i++)
                {
                    let next = queue.shift();
                    confs.push(next);
                    group++;

                    for (let dir = 0; dir < 8; dir++)
                    {
                        let adj = [ [-1, -1, 0, 1, 1,  1,  0, -1][dir] + next[0],
                                    [ 0,  1, 1, 1, 0, -1, -1, -1][dir] + next[1] ];

                        if (adj[0] >= 0 && adj[0] < 8 && adj[1] >= 0 && adj[1] < 10 && board[adj[0]][adj[1]] === turn && !queue.some(piece => piece[0] == adj[0] && piece[1] == adj[1]) && !confs.some(piece => piece[0] == adj[0] && piece[1] == adj[1]))
                        {
                            queue.push(adj);
                        }
                    }
                }
            }

            return allPieces == group;
        },
        canReconnect: function() {
            let possible = false;
            let turn = [1, 0][this.turn];

            for (let y = 0, x = 0, dir = 0; y < 8; dir < 7 ? dir++ : (dir = 0, x < 9 ? x++ : (x = 0, y++)))
            {
                if (this.board[y][x] !== turn)
                {
                    continue;
                }

                let yDir = [-1, -1, 0, 1, 1,  1,  0, -1][dir];
                let xDir = [ 0,  1, 1, 1, 0, -1, -1, -1][dir];

                canContinue:
                for (let dis = 1; dis < 10; dis++)
                {
                    let board = this.board.clone();
                    let y2 = y + (yDir * dis);
                    let x2 = x + (xDir * dis);

                    if (y2 < 0 || y2 > 7 || x2 < 0 || x2 > 9 || this.board[y2][x2] === turn)
                    {
                        break canContinue;
                    }

                    board[y][x] = false;
                    board[y2][x2] = turn;
                    if (this.checkGroup(1, board))
                    {
                        possible = true;
                        break canContinue;
                    }

                    if (this.board[y2][x2] === [1, 0][turn])
                    {
                        break canContinue;
                    }
                }
            }

            if (!possible)
            {
                for (let HorV of [0, 1])
                {
                    for (let length = 2; length <= [10, 8][HorV]; length++)
                    {
                        for (let y = 0; y < 8 - [0, length - 1][HorV]; y++)
                        {
                            for (let x = 0; x < 10 - [length - 1, 0][HorV]; x++)
                            {
                                let pieces = [];

                                for (let piece = 0; piece < length; piece++)
                                {
                                    pieces.push([ [y, x + piece], [y + piece, x] ][HorV]);
                                }

                                if (!pieces.some(p => this.board[p[0]][p[1]] !== turn))
                                {
                                    let canContinue = true;

                                    for (let UDRL of [[0, 1], [2, 3]][HorV])
                                    {
                                        thisDirection:
                                        for (let dis = 1; dis < [7, 9][HorV]; dis++)
                                        {
                                            if ((UDRL == 0 && y + dis > 7) || (UDRL == 1 && y - dis < 0) || (UDRL == 2 && x + dis > 9) || (UDRL == 3 && x - dis < 0))
                                            {
                                                break thisDirection;
                                            }

                                            if (!pieces.map(p => [p[0] + ([1, -1, 0, 0][UDRL] * dis), p[1] + ([0, 0, 1, -1][UDRL] * dis)]).some(p => this.board[p[0]][p[1]] !== false))
                                            {
                                                let board = this.board.clone();

                                                for (let piece of pieces)
                                                {
                                                    switch (UDRL)
                                                    {
                                                        case 0: board[piece[0] + dis][piece[1]] = turn; break;
                                                        case 1: board[piece[0] - dis][piece[1]] = turn; break;
                                                        case 2: board[piece[0]][piece[1] + dis] = turn; break;
                                                        case 3: board[piece[0]][piece[1] - dis] = turn; break;
                                                    }

                                                    board[piece[0]][piece[1]] = false;
                                                }

                                                switch (UDRL)
                                                {
                                                    case 0: console.log("    ", (x + 10).toString(36) + (y + 1 + dis), "-", (x + 10 + [length - 1, 0][HorV]).toString(36) + (y + 1 + dis + [0, length - 1][HorV])); break;
                                                    case 1: console.log("    ", (x + 10).toString(36) + (y + 1 - dis), "-", (x + 10 + [length - 1, 0][HorV]).toString(36) + (y + 1 - dis + [0, length - 1][HorV])); break;
                                                    case 2: console.log("    ", (x + 10 + dis).toString(36) + (y + 1), "-", (x + 10 + dis + [length - 1, 0][HorV]).toString(36) + (y + 1 + [0, length - 1][HorV])); break;
                                                    case 3: console.log("    ", (x + 10 - dis).toString(36) + (y + 1), "-", (x + 10 - dis + [length - 1, 0][HorV]).toString(36) + (y + 1 + [0, length - 1][HorV])); break;
                                                }

                                                if (this.checkGroup(1, board))
                                                {
                                                    possible = true;
                                                }
                                            }
                                            else
                                            {
                                                break thisDirection;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return possible;
        },
        AITurn: function() {
            let Y = (Math.random() * 8 | 0) + 1;
            let X = ((Math.random() * 10 | 0) + 10).toString(36);
            return Y + X;
        },
        setPriorities: function() {

        }
    }
}