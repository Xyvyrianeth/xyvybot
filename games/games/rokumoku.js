import { Client } from "../../index.js";

export function newGame(player, id) {
    const _ = false;
    return {
        turnColors: [ "#000000", "#ffffff", "#66ff66" ],
        board: [
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ],
            [ _, _, _, _, _, _, _, _, _, _, _, _ ] ],
        endMessage: function() {
            return [
                `It is <@${this.player}>'s turn.`,
                `<@${this.players[this.winner]}> has won!`,
                `<@${this.players[0]}> and <@${this.players[1]}> have tied!` ][this.end];
        },
        playerTurn: function(Move) {
            const move = [Move.match(/[0-9]{1,2}/) - 1, parseInt(Move.match(/[a-l]/), 36) - 10];
            this.winner = false;
            this.end = 2;

            if (this.turn == this.turn | 0)
            {
                this.highlight = [];
            }

            if (this.board[move[0]][move[1]] !== false)
            {
                return "this space is not empty.";
            }
            else
            {
                this.board[move[0]][move[1]] = this.turn | 0;
            }

            const piece = this.turn | 0;

            for (let y = 0, x = 0, dir = 0; y < 12; dir < 3 ? dir++ : (dir = 0, x < 11 ? x++ : (x = 0, y++)))
            {
                const yd = [-1, 0, 1, 1][dir];
                const xd = [1, 1, 1, 0][dir];
                if (y + (yd * 5) > 12 || y + (yd * 5) < 0 || x + (xd * 5) > 12 || x + (xd * 5) < 0)
                {
                    continue;
                }

                const rowOfSix = [];
                const highlight = [];

                for (let length = 0; length < 6; length++)
                {
                    rowOfSix.push(this.board[y + (yd * length)]?.[x + (xd * length)]);
                    highlight.push([y + (yd * length), x + (xd * length)]);
                }

                if (rowOfSix.all(piece))
                {
                    this.highlight = highlight;
                    this.end = 1;
                    this.winner = this.turn | 0;
                    break;
                }

                const maybeRow = [
                    rowOfSix.map(p => p === false ? 0 : p),
                    rowOfSix.map(p => p === false ? 1 : p) ];
                if (maybeRow[0].all(0) || maybeRow[1].all(1))
                {
                    this.end = 0;
                }
            }

            if (this.end == 2)
            {
                this.winner = 2;
            }

            if (this.end == 0)
            {
                this.turn = (this.turn + 0.5) % 2;
                this.highlight.push(move);
                this.player = this.players[this.turn | 0];
            }

            this.replay.push(Move);

            return false;
        },
        AITurn: function() {
            const priorityBoard = [
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
            const piece = this.players.indexOf(Client.user.id);
            const turn = (this.turn % 1) * 2;
            for (let dir = 0, y = 5, x = 0; dir < 4; x < [6, 6, 6, 11][dir] ? x++ : (x = 0, y < [11, 11, 6, 6][dir] ? y++ : (y = 0, dir++)))
            {
                const yDist = [-1, 0, 1, 1][dir];
                const xDist = [1, 1, 1, 0][dir];
                const rowCoords = [];
                const rowPieces = [];fy
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
                    const count = rowPieces.filter(p => p !== false).length;
                    rowCoords.forEach((p, i) => priorityBoard[p[0]][p[1]] += this.priorities.offense[turn][count]);
                }

                if (!rowPieces.some(p => p === piece))
                {
                    const count = rowPieces.filter(p => p !== false).length;
                    rowCoords.forEach((p, i) => priorityBoard[p[0]][p[1]] += this.priorities.defense[turn][count]);
                }
            }
        
            const Board = [];
            for (let y = 0, x = 0; y < 12; x < 12 ? x++ : (x = 0, y++))
            {
                if (this.board[y][x] === false)
                {
                    Board.push([y, x]);
                }
            }
        
            Board.sort((a, b) => priorityBoard[b[0]][b[1]] - priorityBoard[a[0]][a[1]]);
            const space = Board.filter(p => priorityBoard[p[0]][p[1]] == priorityBoard[Board[0][0]][Board[0][1]]).random();
            const Y = space[0] + 1;
            const X = (space[1] + 10).toString(36);
        
            return Y + X;
        },
        setPriorities: function() {
            this.priorities = {
                offense: [
                    [1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, Math.random() * 50 + 42, 250, 0],
                    [1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, Math.random() * 50 + 30, 250, 0] ],
                defense: [
                    [1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, Math.random() * 50 + 36, 200, 0],
                    [1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 20, Math.random() * 50 + 36, 200, 0] ] }
        }
    }
}