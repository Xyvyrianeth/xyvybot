"use strict";

export class connect4Instance {
    constructor(ruleset) {
        let _ = false;
        this.game = "connect4";
        this.ruleset = ruleset || { gravity: 0, linetris: 0, boardSize: 0};
        this.turnColors = ["#6666ff", "#ff6666", "#66ff66"];
        this.highlight = false;
        this.possible = [
            [   [],
                [   [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7] ],
                [   [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
                    [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7],
                    [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
                    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7] ],
                [   [3, 3], [3, 4], [4, 3], [4, 4] ] ],
            [   [],
                [   [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6] ],
                [   [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
                    [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6],
                    [1, 0], [2, 0], [3, 0], [4, 0],
                    [1, 5], [2, 5], [3, 5], [4, 5] ],
                [   [2, 3], [3, 3] ] ] ][this.ruleset.boardSize][this.ruleset.gravity];
        this.board = [
          [ [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _] ],
          [ [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _] ] ][this.ruleset.boardSize];
        }

    endMessage() {
        return  [   `<@${this.player}>'s turn.`,
                    `<@${this.players[this.winner]}> has won!`,
                    `<@${this.players[0]}> and <@${this.players[1]}> have tied!`][this.end];
    }

    getPossible() {
        this.possible = [];
        for (let x = 0; x < [8, 7][this.ruleset.boardSize]; x++)
        {
            fromTop:
            for (let y = 0; y < [8, 6][this.ruleset.boardSize]; y++)
            {
                if (this.board[y][x] === false)
                {
                    this.possible.push([y, x]);
                    break fromTop;
                }
            }

            fromBottom:
            for (let y = [7, 5][this.ruleset.boardSize]; y > -1; y--)
            {
                if (this.board[y][x] === false)
                {
                    this.possible.push([y, x]);
                    break fromBottom;
                }
            }
        }
        for (let y = 0; y < [8, 6][this.ruleset.boardSize]; y++)
        {
            fromLeft:
            for (let x = 0; x < [8, 7][this.ruleset.boardSize]; x++)
            {
                if (this.board[y][x] === false)
                {
                    this.possible.push([y, x]);
                    break fromLeft;
                }
            }

            fromRight:
            for (let x = [7, 6][this.ruleset.boardSize]; x > -1; x--)
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
        const move = [Move.match(/[1-8]/) - 1, parseInt(Move.match(/[a-h]/), 36) - 10];
        const [ w, h ] = [ [ 8, 8 ], [ 7, 6 ] ][this.ruleset.boardSize];

        if (this.board[move[0]][move[1]] !== false)
        {
            return "this space is not empty.";
        }
        else
        if (this.ruleset.gravity > 0 && !this.possible.some(space => space[0] == move[0] && space[1] == move[1]))
        {
            return "this space is not touching or directly linked to a viable edge.";
        }
        else
        {
            this.board[move[0]][move[1]] = this.turn;
        }

        for (let i = 0; i < w * h * 4; i++)
        {
            let dir = i / (w * h) | 0,
                y1 = i % (w * h) / w | 0,
                x1 = i % h;
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

            if (row[3][0] > h - 1 || row[3][0] < 0 || row[3][1] > w - 1 || row[3][1] < 0)
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

        this.replay.push(Move);

        if (this.end != 0 || !this.ruleset.lineDeletion)
        {
            return false;
        }

        const fullEdge = {
            up:    !this.board[0].map(x => x).includes(false) && [2].includes(this.ruleset.gravity),
            down:  !this.board[this.board.length - 1].map(x => x).includes(false) && [1, 2].includes(this.ruleset.gravity),
            left:  !this.board.map(y => y[0]).includes(false) && [2].includes(this.ruleset.gravity),
            right: !this.board.map(y => y[y.length - 1]).includes(false) && [2].includes(this.ruleset.gravity)
        };

        if (fullEdge.up)
        {
            this.board.shift();
            this.board.push(this.board[0].map(p => false));
        }
        if (fullEdge.down)
        {
            this.board.pop();
            this.board.unshift(this.board[0].map(p => false));
        }
        for (let y of this.board)
        {
            if (fullEdge.left)
            {
                y.shift();
                y.push(false);
            }
            if (fullEdge.right)
            {
                y.pop();
                y.unshift(false);
            }
        }

        if (fullEdge.up || fullEdge.down || fullEdge.left || fullEdge.right)
        {
            this.highlight = [move, fullEdge.up ? fullEdge.left ? 7 : fullEdge.right ? 1 : 0 : fullEdge.down ? fullEdge.left ? 5 : fullEdge.right ? 3 : 4 : fullEdge.left ? 6 : 2];
        }
        else
        {
            this.highlight = [move, false];
        }

        this.turn = [1, 0][this.turn];
        this.player = this.players[this.turn];
        this.getPossible();

        return false;
    }

    AITurn() {
        let Y = (Math.random() * this.board.length | 0) + 1;
        let X = ((Math.random() * this.board[0].length | 0) + 10).toString(36);
        return Y + X;
    }

    setPriorities() {

    }
}