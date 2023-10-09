import { Xyvybot } from "../../index.js";
export function myTurn() {
    let board = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    let piece = this.players.indexOf(Xyvybot.user.id);
    let turn = (this.turn % 1) * 2;
    for (let dir = 0; dir < 4; dir++)
    {
        let yDist = [-1, 0, 1, 1][dir];
        let xDist = [1, 1, 1, 0][dir];
        for (let y = [5, 0, 0, 0][dir]; y < [12, 12, 7, 7][dir]; y++)
        {
            for (let x = 0; x < [7, 7, 7, 12][dir]; x++)
            {
                let rowCoords = [];
                let rowPieces = [];
                for (let length = 0; length < 6; length++)
                {
                    rowCoords.push([y + (yDist * length), x + (xDist * length)]);
                    rowPieces.push(this.board[y + (yDist * length)][x + (xDist * length)]);
                }

                if (!rowPieces.some(p => p === false))
                {
                    continue;
                }

                if (!rowPieces.some(p => p === [1, 0][piece]))
                {
                    let count = rowPieces.filter(p => p !== false).length;
                    rowCoords.forEach((p, i) => board[p[0]][p[1]] += this.priorities.offense[turn][count]);
                }

                if (!rowPieces.some(p => p === piece))
                {
                    let count = rowPieces.filter(p => p !== false).length;
                    rowCoords.forEach((p, i) => board[p[0]][p[1]] += this.priorities.defense[turn][count]);
                }
            }
        }
    }

    let Board = [];
    for (let y = 0; y < 12; y++)
    {
        for (let x = 0; x < 12; x++)
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
}