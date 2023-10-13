import { Client } from "../../index.js";

export function newGame(player, id) {
    return {
        turnColors: ["#ffffff", "#000000"],
        possible: [
            [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
            [0, 7], [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5],
            [7, 6], [7, 7], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0],
            [6, 0], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7] ],
        board: [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false] ],
        endMessage: function() {
            return [`<@${this.player}>'s turn.`,
                    `<@${this.players[this.winner]}> has won!`][this.end];
        },
        getPossible: function() {
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
        },
        playerTurn: function(Move) {
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

            for (let y = 0, x = 0, dir = 0; y < 12; dir < 3 ? dir++ : (dir = 0, x < 11 ? x++ : (x = 0, y++)))
            {
                let yd = [-1, 0, 1, 1][dir];
                let xd = [1, 1, 1, 0][dir];
                if (y + (yd * 3) > 12 || y + (yd * 3) < 0 || x + (xd * 3) > 12 || x + (xd * 3) < 0)
                {
                    continue;
                }

                const row = [];
                const highlight = [];
                for (let i = 0; i < 4; i++)
                {
                    row.push(this.board[y + (yd[dir] * i)][x + (xd[dir] * i)]);
                    highlight.push([y + (yd[dir] * i), x + (xd[dir] * i)]);
                }

                if (row.all(this.turn))
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
        },
        AITurn: function() {
            let Y = (Math.random() * 8 | 0) + 1;
            let X = ((Math.random() * 8 | 0) + 10).toString(36);
            return Y + X;
        },
        setPriorities: function() {
            
        }
    }
}