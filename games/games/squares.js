import { Client } from "../../index.js";

export function newGame(player, id) {
    let _ = false;
    return {
        score: [0, 0],
        turnColors: ["#000000", "#ff6666", "#66ff66"],
        highlight: [[], [], []],
        board: [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _] ],
        endMessage: function() {
            return [`It is <@${this.player}>'s turn.`,
                    `<@${this.players[this.winner]}> has won!`,
                    `<@${this.players[0]}> and <@${this.players[1]}> have tied!`][this.end];
        },
        playerTurn: function(Move) {
            let move = [Move.match(/[1-8]/)[0] - 1, 'abcdefgh'.indexOf(Move.toLowerCase().match(/[a-j]/)[0])];
            this.end = true;

            if (this.turn == (this.turn | 0))
            {
                this.highlight = [[], [], []];
            }

            if (this.board[move[0]][move[1]] !== false)
            {
                return "this space is not empty.";
            }

            this.board[move[0]][move[1]] = this.turn | 0;
            this.highlight[0].push(move);

            for (let y = 0, x = 0, size = 1; size < 8; x < 7 ? x++ : (x = 0, y < 7 - size ? y++ : (y = 0, size++)))
            {
                let square = [[y, x], [y + size, x], [y, x + size], [y + size, x + size]];
                if (square.some(yx => yx[0] == move[0] && yx[1] == move[1]) && square.filter(yx => this.board[yx[0]][yx[1]] === (this.turn | 0)).length == 4)
                {
                    this.score[this.turn | 0] += 1;
                    square.forEach(syx => {
                        if (!this.highlight[1].some(hyx => syx[0] == hyx[0] && syx[1] == hyx[1]))
                        {
                            this.highlight[1].push(syx);
                        }
                    });
                }
                if (square.some(yx => yx[0] == move[0] && yx[1] == move[1]) && square.filter(yx => this.board[yx[0]][yx[1]] === [1, 0][this.turn | 0]).length == 3)
                {
                    square.forEach(syx => {
                        if (!this.highlight[2].some(hyx => syx[0] == hyx[0] && syx[1] == hyx[1]))
                        {
                            this.highlight[2].push(syx);
                        }
                    });
                }
            }

            if (this.board.some(row => row.some(space => space === false)))
            {
                this.end = false;
            }

            this.turn = (this.turn + 0.5) % 2;
            this.player = this.players[this.turn | 0];

            if (this.end)
            {
                this.end = this.score[0] != this.score[1] ? 1 : 2;

                if (this.end == 1)
                {
                    this.winner = this.score[0] == this.score[1] ? 2 : this.score[0] > this.score[1] ? 0 : 1;
                }
            }
            else
            {
                this.end = 0;
            }

            this.replay.push(Move);

            return false;
        },
        AITurn: function() {
            let board = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ];
            let piece = this.players.indexOf(Client.user.id);
            for (let size = 1; size < 10; size++)
            {
                for (let y = 0; y < 10 - size; y++)
                {
                    for (let x = 0; x < 10 - size; x++)
                    {
                        let squareCoords = [[y, x], [y + size, x], [y, x + size], [y + size, x + size]];
                        let squarePieces = squareCoords.map(p => this.board[p[0]][p[1]]);
                        if (!squarePieces.some(p => p === false))
                        {
                            continue;
                        }
        
                        if (!squarePieces.some(p => p === piece))
                        {
                            let count = squarePieces.filter(p => p !== false).length
                            squareCoords.forEach(p => board[p[0]][p[1]] += this.priorities.offense[count]);
                        }
        
                        if (!squarePieces.some(p => p === [1, 0][piece]))
                        {
                            let count = squarePieces.filter(p => p !== false).length
                            squareCoords.forEach((p, i) => board[p[0]][p[1]] += this.priorities.defense[count]);
                        }
                    }
                }
            }
        
            let Board = [];
            for (let y = 0; y < 10; y++)
            {
                for (let x = 0; x < 10; x++)
                {
                    if (this.board[y][x] === false)
                    {
                        Board.push([y, x]);
                    }
                }
            }
        
            Board.sort((a, b) => board[b[0]][b[1]] - board[a[0]][a[1]]);
            let space = Board.filter(p => board[p[0]][p[1]] == board[Board[0][0]][Board[0][1]]).random();
            let Y = space[0] + 1;
            let X = (space[1] + 10).toString(36);
        
            return Y + X;
        },
        setPriorities: function() {
            this.priorities = {
                offense: [1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, 0],
                defense: [1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, 0] };
        }        
    }
}