import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
export function newGame(player, id) {
	let _ = false;
	return {
		score: [0, 0],
		turnColors: ["#000000", "#ff6666", "#66ff66"],
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
		imageName: function() {
			return [`squares_0_${this.players[0]}vs${this.players[1]}.png`,
					`squares_1_${this.players[this.winner]}.png`,
					`squares_2_tie.png`][this.end];
		},
		takeTurn: function(Move) {
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

			for (let size = 1; size < 8; size++)
			{
				for (let y = 0; y < 8 - size; y++)
				{
					for (let x = 0; x < 8 - size; x++)
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
		}
	}
}