"use strict";

export class othelloInstance {
    constructor() {
        let _ = false;
        let O = true;
        this.game = "othello";
        this.score = [2, 2];
        this.turnColors = ["#000000", "#ffffff", "#66ff66"];
        this.possible = [
            [2, 3, [2, 0, 0, 0, 0, 0, 0, 0]],
            [3, 2, [0, 0, 2, 0, 0, 0, 0, 0]],
            [5, 4, [0, 0, 0, 0, 2, 0, 0, 0]],
            [4, 5, [0, 0, 0, 0, 0, 0, 2, 0]] ];
        this.board = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _],
            [_, _, O, 1, 0, _, _, _],
            [_, _, _, 0, 1, O, _, _],
            [_, _, _, _, O, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _] ];
    }

    endMessage() {
        return  [   `It is <@${this.player}>'s turn.`,
                    `<@${this.players[this.winner]}> has won!`,
                    `<@${this.players[0]}> and <@${this.players[1]}> have tied!`][this.end];
    }

    getPossible() {
        this.possible = [];
        let a = this.turn;
        let b = [1, 0][this.turn];
        for (let y = 0, x = 0; y < 8; x < 7 ? x++ : (y++, x = 0)) {
            if (this.board[y][x] !== false)
            {
                continue;
            }

            let directions = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
            let distances = [0, 0, 0, 0, 0, 0, 0, 0];

            for (let d in directions)
            {
                let direction = directions[d];
                if (y + direction[0] > 7 || y + direction[0] < 0 || x + direction[1] > 7 || x + direction[1] < 0)
                {
                    continue;
                }

                let y2 = y + direction[0];
                let x2 = x + direction[1];
                let distance = 1;
                if (this.board[y2][x2] !== b)
                {
                    continue;
                }

                currentLine:
                while (true)
                {
                    y2 += direction[0];
                    x2 += direction[1];
                    distance += 1;

                    if (y2 > 7 || y2 < 0 || x2 > 7 || x2 < 0)
                    {
                        break currentLine;
                    }
                    if (this.board[y2][x2] === a)
                    {
                        distances[d] = distance;
                        break currentLine;
                    }

                    else if (typeof this.board[y2][x2] == "boolean")
                    {
                        break currentLine;
                    }
                }
            }
            if (distances.length > 0)
            {
                this.board[y][x] = true;
                this.possible.push([y, x, distances]);
            }
        }
    }

    playerTurn(Move) {
        let move = [Move.match(/[1-8]/)[0] - 1, 'abcdefgh'.indexOf(Move.toLowerCase().match(/[a-h]/)[0])];
        this.highlight = [];
        this.end = 0;
        this.winner = false;

        if (typeof this.board[move[0]][move[1]] != "boolean")
        {
            return "this space is not empty.";
        }
        if (this.board[move[0]][move[1]] === false)
        {
            return "playing in this space would not capture anything.";
        }

        const dirs = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
        const dists = this.possible.find(p => move[0] == p[0] && move[1] == p[1])[2];
        this.board[move[0]][move[1]] = this.turn;
        for (let dir = 0, dist = 1; dir < 8; dist <= dists[dir] ? dist++ : (dist = 1, dir++))
        {
            const space = [move[0] + (dirs[dir][0] * dist), move[1] + (dirs[dir][1] * dist)];
            this.board[space[0]][space[1]] = this.turn;
            this.highlight.push(space);
        }

        this.highlight.unshift(move);

        for (let y = 0, x = 0; y < 8; x < 7 ? x++ : (y++, x = 0))
        {
            if (this.board[y][x] === true)
            {
                this.board[y][x] = false;
            }
        }

        this.turn = [1, 0][this.turn];
        this.getPossible();
        this.score = [0, 0];
        for (let y = 0, x = 0; y < 8; x < 7 ? x++ : (y++, x = 0))
        {
            if (typeof this.board[y][x] == "number")
            {
                this.score[this.board[y][x]]++;
            }
        }

        if (this.possible.length == 0)
        {
            this.turn = [1, 0][this.turn];
            this.getPossible();

            if (this.possible.length == 0)
            {
                this.end = true;
            }
        }
        if (this.end)
        {
            if (this.score[0] == this.score[1])
            {
                this.end = 2;
                this.winner = 2;
            }

            else
            {
                this.end = 1;
                this.winner = this.score[0] > this.score[1] ? 0 : 1;
            }
        }
        else
        {
            this.player = this.players[this.turn];
        }

        this.replay.push(Move);

        return false;
    }

    AITurn() {
        const possible = this.possible.map(space => {
            return [space[0], space[1], Math.sum(0, 8, space[2])];
        });

        possible.sort((a, b) => a[2] - b[2]);

        return (possible[0][0] + 1) + possible[0][1].toString(18);
    }
    setPriorities() {

    }
}