export function newGame(player, id) {
    let _ = false;
    return {
        turnColors: ["#000000", "#ffffff", "#66ff66"],
        board: [
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _] ],
        endMessage: function() {
            return [`It is <@${this.player}>'s turn.`,
                    `<@${this.players[this.winner]}> has won!`,
                    `<@${this.players[0]}> and <@${this.players[1]}> have tied!`][this.end];
        },
        takeTurn: function(Move) {
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
                let yd = [-1, 0, 1, 1][dir];
                let xd = [1, 1, 1, 0][dir];
                if (y + (yd * 3) > 12 || y + (yd * 3) < 0 || x + (xd * 3) > 12 || x + (xd * 3) < 0)
                {
                    continue;
                }

                const rowOfSix = [];
                const highlight = [];

                for (let length = 0; length < 6; length++)
                {
                    rowOfSix.push(this.board[y + (yd * length)][x + (xd * length)]);
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
        }
    }
}