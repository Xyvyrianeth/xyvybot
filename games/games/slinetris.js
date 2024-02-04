"use strict";

export class slinetrisInstance {
    constructor() {
        let _ = false;
        this.turnColors = ["#ffffff", "#000000"],
        this.possible = [
            [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
            [0, 7], [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5],
            [7, 6], [7, 7], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0],
            [6, 0], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7] ],
        this.board = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _] ];
    }

    endMessage() {
        return [    `<@${this.player}>'s turn.`,
                    `<@${this.players[this.winner]}> has won!`][this.end];
    }

    getPossible() {
        this.possible = [];
        for (let x = 0; x < 8; x++)
        {
            fromTop:
            for (let y = 0; y < 8; y++)
            {
                if (this.board[y][x] === false)
                {
                    this.possible.push([y, x]);
                    break fromTop;
                }
            }

            fromBottom:
            for (let y = 7; y > -1; y--)
            {
                if (this.board[y][x] === false)
                {
                    this.possible.push([y, x]);
                    break fromBottom;
                }
            }
        }
        for (let y = 0; y < 8; y++)
        {
            fromLeft:
            for (let x = 0; x < 8; x++)
            {
                if (this.board[y][x] === false)
                {
                    this.possible.push([y, x]);
                    break fromLeft;
                }
            }

            fromRight:
            for (let x = 7; x > -1; x--)
            {
                if (this.board[y][x] === false)
                {
                    this.possible.push([y, x]);
                    break fromRight;
                }
            }
        }
    }

    playerTurn(Move) {
        let move = [Move.match(/[1-8]/) - 1, parseInt(Move.match(/[a-h]/), 36) - 10];

        if (this.board[move[0]][move[1]] !== false)
        {
            return "this space is not empty.";
        }
        else
        if (!this.possible.some(space => space[0] == move[0] && space[1] == move[1]))
        {
            return "this space is not attached or directly linked to the edge.";
        }
        else
        {
            this.board[move[0]][move[1]] = this.turn;
        }

        for (let i = 0; i < 256; i++)
        {
            let dir = i / 64 | 0,
                y1 = i % 64 / 8 | 0,
                x1 = i % 8;
            let yd = [-1, 0, 1, 1][dir];
            let xd = [ 1, 1, 1, 0][dir];

            const row = [];
            const highlight = [];
            for (let i = 0; i < 4; i++)
            {
                let yx = [y1 + (yd * i), x1 + (xd * i)];
                row.push(yx);
                highlight.push(yx);
            }

            if (row[3][0] > 7 || row[3][0] < 0 || row[3][1] > 7 || row[3][1] < 0)
            {
                continue;
            }

            if (!row.some(yx => this.board[yx[0]][yx[1]] !== this.turn))
            {
                this.end = 1;
                this.winner = this.turn;
                this.highlight = highlight;
                break;
            }
        }

        if (this.end == 0)
        {
            const dirs = {
                up:    !this.board[0].includes(false),
                down:  !this.board[7].includes(false),
                left:  !this.board.map(y => y[0]).includes(false),
                right: !this.board.map(y => y[7]).includes(false)
            };

            if (dirs.up)
            {
                this.board.shift();
                this.board.push([false, false, false, false, false, false, false, false]);
            }
            if (dirs.down)
            {
                this.board.pop();
                this.board.unshift([false, false, false, false, false, false, false, false]);
            }
            for (let y of this.board)
            {
                if (dirs.left)
                {
                    y.shift();
                    y.push(false);
                }
                if (dirs.right)
                {
                    y.pop();
                    y.unshift(false);
                }
            }

            if (dirs.up || dirs.down || dirs.left || dirs.right)
            {
                this.highlight = [move, dirs.up ? dirs.left ? 7 : dirs.right ? 1 : 0 : dirs.down ? dirs.left ? 5 : dirs.right ? 3 : 4 : dirs.left ? 6 : 2];
            }
            else
            {
                this.highlight = [move, false];
            }

            this.turn = [1, 0][this.turn];
            this.player = this.players[this.turn];
            this.getPossible();
        }

        this.replay.push(Move);

        return false;
    }

    AITurn() {
        let Y = (Math.random() * 8 | 0) + 1;
        let X = ((Math.random() * 8 | 0) + 10).toString(36);
        return Y + X;
    }

    setPriorities() {

    }
}