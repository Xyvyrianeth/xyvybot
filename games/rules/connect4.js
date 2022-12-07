import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
export function newGame() {
	return {
		turnColors: ["#6666ff", "#ff6666", "#66ff66"],
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
		takeTurn: function(Move) {
			let row = parseInt(Move, 36) - 10;
			this.highlight = [];
			this.end = 2;

			if (!this.board[row].includes(false))
			{
				return "this column is full.";
			}

			let column = this.board[row].indexOf(false);
			this.board[row][column] = this.turn;
			this.highlight = row;

			for (let i = 7; i--;)
			{
				if (this.board[i].includes(false))
				{
					this.end = 0;
					break;
				}
			}

			let yDist = [-1, 0, 1, 1];
			let xDist = [1, 1, 1, 0];

			winCheck:
			for (let dir = 0; dir < 4; dir++)
			{
				for (let x = 0; x < [4, 4, 4, 7][dir]; x++)
				{
					for (let y = [3, 0, 0, 0][dir]; y < [6, 6, 3, 3][dir]; y++)
					{
						const row = [];
						const highlight = [];
						for (let i = 0; i < 4; i++)
						{
							row.push(this.board[y + (yDist[dir] * i)][x + (xDist[dir] * i)]);
							highlight.push([y + (yDist[dir] * i), x + (xDist[dir] * i)]);
						}

						if (row.all(this.turn))
						{
							this.end = 1;
							this.winner = this.turn;
							this.highlight = highlight;
							break winCheck;
						}
					}
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
		}
	}
}