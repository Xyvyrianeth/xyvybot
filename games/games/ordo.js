"use strict";

export class ordoInstance {
    constructor() {
        let _ = false;
        this.game = "ordo";
        this.split = false;
        this.turnColors = ["#6666ff", "#fefefe"];
        this.board = [
            [_, _, 0, 0, _, _, 0, 0, _, _],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, _, _, 0, 0, _, _, 0, 0],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [1, 1, _, _, 1, 1, _, _, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [_, _, 1, 1, _, _, 1, 1, _, _] ];
    }

    endMessage() {
        return  [ [ `It is <@${this.player}>'s turn.`,
                    `It is <@${this.player}>'s turn.\nYour pieces have been split into more than one group, you *must* bring them back together immediately.` ][this.split ? 1 : 0],
                  [ `<@${this.players[this.winner]}> has won by reaching their opponent's home row!`,
                    `<@${this.players[this.winner]}> has won by capturing all of their opponent's pieces!`,
                    `<@${this.players[this.winner]}> has won by splitting up their opponent's pieces!` ][this.endType] ][this.end];
    }

    interpretMove(Move) {
        if (/^([a-j][1-8] [a-j][1-8]|[1-8][a-j] [1-8][a-j])$/.test(Move))
        {
            const move = {
                from: [[Number(Move.split(' ')[0].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[0].match(/[a-j]/)[0])]],
                to: [[Number(Move.split(' ')[1].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[1].match(/[a-j]/)[0])]]
            };

            let direction = 8;
            if (move.from[0][0]  >  move.to[0][0] && move.from[0][1] === move.to[0][1]) direction = 0;
            if (move.from[0][0]  >  move.to[0][0] && move.from[0][1]  <  move.to[0][1]) direction = 1;
            if (move.from[0][0] === move.to[0][0] && move.from[0][1]  <  move.to[0][1]) direction = 2;
            if (move.from[0][0]  <  move.to[0][0] && move.from[0][1]  <  move.to[0][1]) direction = 3;
            if (move.from[0][0]  <  move.to[0][0] && move.from[0][1] === move.to[0][1]) direction = 4;
            if (move.from[0][0]  <  move.to[0][0] && move.from[0][1]  >  move.to[0][1]) direction = 5;
            if (move.from[0][0] === move.to[0][0] && move.from[0][1]  >  move.to[0][1]) direction = 6;
            if (move.from[0][0]  >  move.to[0][0] && move.from[0][1]  >  move.to[0][1]) direction = 7;
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

            return move;
        }

        else if (/^([a-j][1-8]-[a-j][1-8]|[1-8][a-j]-[1-8][a-j]) (up|right|down|left|[urdl]|north|east|south|west|[nesw]) [0-9]$/.test(Move))
        {
            let dir = { "r": 1, "u": 0, "d": 2, "l": 3, "n": 0, "e": 1, "s": 2, "w": 3, "1": 0, "2": 1, "3": 2, "4": 3,
                "up": 0, "right": 1, "down": 2, "left": 3, "north": 0, "east": 1, "south": 2, "west": 3 }[Move.split(' ')[1]];
            let dis = Number(Move.split(' ')[2]);
            let pieces = [
                [Number(Move.split(' ')[0].split('-')[0].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[0].split('-')[0].match(/[a-j]/)[0])],
                [Number(Move.split(' ')[0].split('-')[1].match(/[1-8]/)[0]) - 1, 'abcdefghij'.indexOf(Move.split(' ')[0].split('-')[1].match(/[a-j]/)[0])] ];
            let width;
            let Pieces = [];

            if (dis == 0)
            {
                return "You have to actually move something.";
            }

            if (pieces[0][0] == pieces[1][0] && pieces[0][1] == pieces[1][1])
            {
                return "This is a singleton move, so please use the singleton move format.";
            }

            if (pieces[0][0] != pieces[1][0] && pieces[0][1] != pieces[1][1])
            {
                return "The pieces you are trying move are not alligned horizontally or vertically.";
            }
            else if ((pieces[0][1] == pieces[1][1] && (dir == 0 || dir == 2)) || (pieces[0][0] == pieces[1][0] && (dir == 1 || dir == 3)))
            {
                return "Multiple pieces cannot be moved single-file.";
            }

            else if (pieces[0][0] == pieces[1][0])
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
                return "You cannot move pieces off the board.";
            }

            const move = {
                from: Pieces,
                to: Pieces.map(p => p = [p[0] + ([-1, 0, 1, 0][dir] * dis), p[1] + ([0, 1, 0, -1][dir] * dis)]) };

            if (move.from.some(s => this.board[s[0]][s[1]] !== this.turn))
            {
                return "One or more of the pieces you're trying to move aren't yours.";
            }
            if ((dir == 0 && this.board.some((Y, y) => Y.some((X, x) => y < move.from[0][0] && y >= move.to[0][0] && x >= move.from[0][1] && x <= move.to[width][1] && this.board[y][x] !== false))) || (dir == 2 && this.board.some((Y, y) => Y.some((X, x) => y > move.from[0][0] && y <= move.to[0][0] && x >= move.from[0][1] && x <= move.to[width][1] && this.board[y][x] !== false))) || (dir == 1 && this.board.some((Y, y) => Y.some((X, x) => y >= move.from[0][0] && y <= move.to[width][0] && x > move.from[0][1] && x <= move.to[0][1] && this.board[y][x] !== false))) || (dir == 3 && this.board.some((Y, y) => Y.some((X, x) => y >= move.from[0][0] && y <= move.to[width][0] && x < move.from[0][1] && x >= move.to[0][1] && this.board[y][x] !== false))))
            {
                return "One or more pieces are blocking that movement.";
            }

            return move;
        }
    }
    playerTurn(Move) {
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
            if (this.split)
            {
                return "This move would not reconnect your pieces into one continuous group.";
            }
            else
            {
                return "This move would split your pieces into more than one continuous group.";
            }
        }

        this.board = board.clone();
        if (this.board[[7, 0][this.turn]].some(p => p === this.turn))
        {
            this.end = 1;
            this.endType = 0;
        }
        else if (!this.board.some(y => y.some(x => x == [1, 0][this.turn])))
        {
            this.end = 1;
            this.endType = 1;
        }
        else if (!this.checkGroup(1, this.board))
        {
            this.split = true;

            if (!this.canReconnect())
            {
                this.end = 1;
                this.endType = 2;
            }
        }
        else
        {
            this.split = false;
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
    }

    checkGroup(turn, board) {
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
        while
        (queue.length != 0)
        {
            for (let i = 0; i < queue.length; i++)
            {
                let next = queue.shift();
                confs.push(next);
                group++;
                for (let dir = 0; dir < 8; dir++)
                {
                    let adj = [[-1, -1, 0, 1, 1, 1, 0, -1][dir] + next[0],
                    [0, 1, 1, 1, 0, -1, -1, -1][dir] + next[1]];

                    if (adj[0] >= 0 && adj[0] < 8 && adj[1] >= 0 && adj[1] < 10 && board[adj[0]][adj[1]] === turn && !queue.some(piece => piece[0] == adj[0] && piece[1] == adj[1]) && !confs.some(piece => piece[0] == adj[0] && piece[1] == adj[1]))
                    {
                        queue.push(adj);
                    }
                }
            }
        }

        return allPieces == group;
    }

    canReconnect() {
        let turn = [1, 0][this.turn];

        for (let y1 = 0, x1 = 0, dir = 0; y1 < 8; dir < 7 ? dir++ : (dir = 0, x1 < 9 ? x1++ : (x1 = 0, y1++))) {
            if (this.board[y1][x1] !== turn)
            {
                continue;
            }

            let yDir = [-1, -1, 0, 1, 1, 1, 0, -1][dir];
            let xDir = [0, 1, 1, 1, 0, -1, -1, -1][dir];

            distanceChecks:
            for (let dis = 1; dis < 10; dis++)
            {
                let board = this.board.clone();
                let y2 = y1 + (yDir * dis);
                let x2 = x1 + (xDir * dis);
                if (y2 < 0 || y2 > 7 || x2 < 0 || x2 > 9 || this.board[y2][x2] === turn)
                {
                    break distanceChecks;
                }

                board[y1][x1] = false;
                board[y2][x2] = turn;
                if (this.checkGroup(1, board))
                {
                    return true;
                }

                if (this.board[y2][x2] === [1, 0][turn])
                {
                    break distanceChecks;
                }
            }
        }

        // direction: 0 = right, 1 = down, 2 = left, 3 = up
        let dir = 0, len = 2, x = 0, y = 0, dis = 0;
        for (let i = 0; i < 5040; i++)
        {
            dis += 1;
            [x + dis > 9, y + dis > 7,
            x - dis < 0, y - dis < 0][dir] ? (x += 1, dis = 1) : false;
            x > [8, 10 - len, 9, 10 - len][dir] ? (x = [0, 0, 1, 0][dir], y += 1) : false;
            y > [8 - len, 6, 8 - len, 7][dir] ? (y = [0, 0, 0, 1][dir], len += 1) : false;
            len > [8, 10, 8, 10][dir] ? (len = 2, dir += 1, x = [0, 0, 1, 0][dir], y = [0, 0, 0, 1][dir]) : false;

            if (this.board[y][x] !== turn)
            {
                continue;
            }

            let piecesOld = [];
            for (let piece = 0; piece < len; piece++)
            {
                piecesOld.push([[y + piece, x], [y, x + piece]][dir % 2]);
            }
            let piecesNew = piecesOld.map(piece => [piece[0] + [0, dis, 0, -dis][dir], piece[1] + [dis, 0, -dis, 0][dir]]);
            if (piecesOld.some(p => this.board[p[0]][p[1]] !== turn) || piecesNew.some(p => this.board[p[0]][p[1]] !== false))
            {
                continue;
            }

            let board = this.board.clone();
            for (let piece in piecesOld)
            {
                board[piecesOld[piece][0]][piecesOld[piece][1]] = false;
                board[piecesNew[piece][0]][piecesNew[piece][1]] = turn;
            }

            if (this.checkGroup(1, board))
            {
                return true;
            }
        }

        return false;
    }

    AITurn() {
        let X1 = ((Math.random() * 10 | 0) + 10).toString(36);
        let Y1 = (Math.random() * 8 | 0) + 1;
        let X2 = ((Math.random() * 10 | 0) + 10).toString(36);
        let Y2 = (Math.random() * 8 | 0) + 1;
        return X1 + Y1 + ' ' + X2 + Y2;
    }

    setPriorities() {

    }
};







