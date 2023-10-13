import { Client } from "../../index.js";

export function newGame() {
    return {
        turnColors: ["#6666ff", "#ff6666", "#66ff66"],
        highlight: false,
        board: [
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false],
            [false, false, false, false, false, false]],
        endMessage: function() {
            return [`<@${this.player}>'s turn.`,
                    `<@${this.players[this.winner]}> has won!`,
                    `<@${this.players[0]}> and <@${this.players[1]}> have tied!`][this.end];
        },
        playerTurn: function(Move) {
            let row = parseInt(Move, 36) - 10;
            this.end = 2;

            if (!this.board[row].includes(false))
            {
                return "this column is full.";
            }

            let column = this.board[row].indexOf(false);
            this.board[row][column] = this.turn;
            this.highlight = row;

            if (this.board.some(column => column.includes(false)))
            {
                this.end = 0;
            }

            for (let d = 0, y = 0, x = 0; d < 4; x < 6 ? x++ : (x = 0, y < 5 ? y++ : (y = 0, d++)))
            {
                let yd = [-1, 0, 1, 1][d];
                let xd = [1, 1, 1, 0][d];
                if (y + (yd * 3) > 6 || y + (yd * 3) < 0 || x + (xd * 3) > 7 || x + (xd * 3) < 0)
                {
                    continue;
                }

                const row = [];
                const highlight = [];
                for (let i = 0; i < 4; i++)
                {
                    row.push(this.board[y + (yd * i)][x + (xd * i)]);
                    highlight.push([y + (yd * i), x + (xd * i)]);
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
                this.turn = [1, 0][this.turn];
                this.player = this.players[this.turn];
            }
            if (this.end == 2)
            {
                this.winner = 2;
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