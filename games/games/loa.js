"use strict";

export class loaInstance {
    constructor() {
        this.game = "loa";
        this.turnColors = ["#000000", "#ffffff"],
        this.board = [
            [ false,     1,     1,     1,     1,     1,     1, false ],
            [     2, false, false, false, false, false, false,     2 ],
            [     2, false, false, false, false, false, false,     2 ],
            [     2, false, false, false, false, false, false,     2 ],
            [     2, false, false, false, false, false, false,     2 ],
            [     2, false, false, false, false, false, false,     2 ],
            [     2, false, false, false, false, false, false,     2 ],
            [ false,     1,     1,     1,     1,     1,     1, false ] ];
    }

    endMessage() {
        return  [   `It is <@${this.player}>'s turn.`,
                    `<@${this.players[this.winner]}> has won by combining all of their pieces into a single group!`,
                    `<@${this.players[this.winner]}> has won because all of their pieces have been combined into a single group by their opponent!`][this.end];
    }

    playerTurn(Move) {
        let dir = [
            "north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest",
            "n", "ne", "e", "se", "s", "sw", "w", "nw",
            "north", "eastnorth", "east", "eastsouth", "south", "westsouth", "west", "westnorth",
            "n", "en", "e", "es", "s", "ws", "w", "wn",
            "up", "upright", "right", "downright", "down", "downleft", "left", "upleft",
            "u", "ur", "r", "dr", "d", "dl", "l", "ul",
            "up", "rightup", "right", "rightdown", "down", "leftdown", "left", "leftup",
            "u", "ru", "r", "rd", "d", "ld", "l", "lu"].indexOf(Move.split(' ')[1].toLowerCase().replace(/\s{1,}/, '')) % 8;
        let from = [
            Move.split(' ')[0].match(/[1-8]{1}/)[0] - 1,
            'abcdefgh'.indexOf(Move.split(' ')[0].toLowerCase().match(/[a-j]/)[0]),
            [-1, -1, 0, 1, 1, 1, 0, -1][dir],
            [0, 1, 1, 1, 0, -1, -1, -1][dir]
        ];

        if (typeof this.board[from[0]][from[1]] == "boolean" || this.board[from[0]][from[1]] != this.turn)
        {
            return "you do not have a piece in that space.";
        }

        let count = 1;

        for (let f = 1; f < 8; f++)
        {
            let F = [from[0] + (f * from[2]), from[1] + (f * from[3])];
            let B = [from[0] - (f * from[2]), from[1] - (f * from[3])];

            if (F[0] >= 0 && F[0] < 8 && F[1] >= 0 && F[1] < 8 && typeof this.board[F[0]][F[1]] != "boolean")
            {
                count++;
            }

            if (B[0] >= 0 && B[0] < 8 && B[1] >= 0 && B[1] < 8 && typeof this.board[B[0]][B[1]] != "boolean")
            {
                count++;
            }
        }

        if ((from[0] + (count * from[2])) < 0 || (from[0] + (count * from[2])) > 7 || (from[1] + (count * from[3])) < 0 || (from[1] + (count * from[3])) > 7)
        {
            return "this move will take the piece off the edge of the board.";
        }

        let to = [from[0] + (count * from[2]), from[1] + (count * from[3])];

        if (typeof this.board[to[0]][to[1]] != "boolean" && this.board[to[0]][to[1]] == this.turn)
        {
            return "one of your own pieces already occupies that space.";
        }

        let jumpingoverenemypieces = false;

        for (let i = 0; i < count; i++)
        {
            if (typeof this.board[from[0] + (i * from[2])][from[1] + (i * from[3])] != "boolean" && this.board[from[0] + (i * from[2])][from[1] + (i * from[3])] != this.turn)
            {
                jumpingoverenemypieces = true;
                break;
            }
        }

        if (jumpingoverenemypieces)
        {
            return "you cannot jump over enemy pieces.";
        }

        this.board[to[0]][to[1]] = this.turn;
        this.board[from[0]][from[1]] = false;
        this.end = 0;
        this.winner = false;

        let pieceCount = 0;

        for (let y = 0, x = 0; y < 8; x < 7 ? x++ : (y++, x = 0))
        {
            if (typeof this.board[y][x] != "boolean" && this.board[y][x] == this.turn)
            {
                pieceCount++;
            }
        }

        let queue = [to];
        let confirmed = [];
        let groupCount = 0;

        while (queue.length != 0)
        {
            for (let i = 0; i < queue.length; i++)
            {
                let a = queue.shift();
                confirmed.push(a);
                groupCount++;

                for (let d = 0; d < 8; d++)
                {
                    let dir = [
                        a[0] + [-1, -1, 0, 1, 1, 1, 0, -1][d],
                        a[1] + [0, 1, 1, 1, 0, -1, -1, -1][d] ];

                    if (dir[0] >= 0 && dir[0] < 8 && dir[1] >= 0 && dir[1] < 8 && this.board[dir[0]][dir[1]] === this.turn && !queue.some(a => a[0] == dir[0] && a[1] == dir[1]) && !confirmed.some(a => a[0] == dir[0] && a[1] == dir[1]))
                    {
                        queue.push(dir);
                    }
                }
            }
        }

        if (groupCount == pieceCount)
        {
            this.end = 1;
            this.winner = this.turn;
        }

        pieceCount = 0;
        queue = false;
        confirmed = [];
        groupCount = 0;

        for (let y = 0, x = 0; y < 8; x < 7 ? x++ : (y++, x = 0))
        {
            if (typeof this.board[x][y] != "boolean" && this.board[x][y] == [1, 0][this.turn])
            {
                if (!queue)
                {
                    queue = [[x, y]];
                }

                pieceCount++;
            }
        }

        do
        {
            for (let i = 0; i < queue.length; i++)
            {
                let a = queue.shift();
                confirmed.push(a);
                groupCount++;

                for (let d = 0; d < 8; d++)
                {
                    let dir = [
                        a[0] + [-1, -1, 0, 1, 1, 1, 0, -1][d],
                        a[1] + [0, 1, 1, 1, 0, -1, -1, -1][d] ];

                    if (dir[0] >= 0 && dir[0] < 8 && dir[1] >= 0 && dir[1] < 8 && typeof this.board[dir[0]][dir[1]] != "boolean" && this.board[dir[0]][dir[1]] == [1, 0][this.turn] && !queue.some(a => a[0] == dir[0] && a[1] == dir[1]) && !confirmed.some(a => a[0] == dir[0] && a[1] == dir[1]))
                    {
                        queue.push(dir);
                    }
                }
            }
        }
        while (queue.length != 0);

        if (groupCount == pieceCount)
        {
            this.end = 2;
            this.winner = [1, 0][this.turn];
        }

        this.highlight = [to, from];

        if (this.end == 0)
        {
            this.turn = [1, 0][this.turn];
            this.player = this.players[this.turn];
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