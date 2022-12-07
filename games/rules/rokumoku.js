import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
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

			const board = this.board;
			const piece = this.turn | 0;

			winCheck:
			for (let dir = 0; dir < 4; dir++)
			{
				for (let x = 0; x < [7, 7, 7, 12][dir]; x++)
				{
					for (let y = [5, 0, 0, 0][dir]; y < [12, 12, 7, 7][dir]; y++)
					{

						const rowOfSix = [];
						const highlight = [];
						const xDist = [1, 1, 1, 0][dir];
						const yDist = [-1, 0, 1, 1][dir];

						for (let length = 0; length < 6; length++)
						{
							rowOfSix.push(board[y + (yDist * length)][x + (xDist * length)]);
							highlight.push([y + (yDist * length), x + (xDist * length)]);
						}

						if (rowOfSix.all(piece))
						{
							this.highlight = highlight;
							this.end = 1;
							this.winner = this.turn | 0;
							break winCheck;
						}

						const maybeRow = [
							rowOfSix.map(p => p === false ? 0 : p),
							rowOfSix.map(p => p === false ? 1 : p) ];
						if (maybeRow[0].all(0) || maybeRow[1].all(1))
						{
							this.end = 0;
						}
					}
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