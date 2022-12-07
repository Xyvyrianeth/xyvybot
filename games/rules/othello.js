import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
export function newGame(player, id) {
	let _ = false;
	let O = true;
	return {
		score: [0, 0],
		turnColors: ["#000000", "#ffffff", "#66ff66"],
		possible: [
			[2, 3, [ [1, 0, 2] ]],
			[3, 2, [ [0, 1, 2] ]],
			[4, 5, [ [0, -1, 2] ]],
			[5, 4, [ [-1, 0, 2] ]] ],
		board: [
			[_, _, _, _, _, _, _, _],
			[_, _, _, _, _, _, _, _],
			[_, _, _, O, _, _, _, _],
			[_, _, O, 1, 0, _, _, _],
			[_, _, _, 0, 1, O, _, _],
			[_, _, _, _, O, _, _, _],
			[_, _, _, _, _, _, _, _],
			[_, _, _, _, _, _, _, _] ],
		endMessage: function() {
			return [`It is <@${this.player}>'s turn.`,
					`<@${this.players[this.winner]}> has won!`,
					`<@${this.players[0]}> and <@${this.players[1]}> have tied!`][this.end];
		},
		getPossible: function() {
			this.possible = [];
			let a = this.turn;
			let b = [1, 0][this.turn];
			for (let y = 0; y < 8; y++)
			{
				for (let x = 0; x < 8; x++)
				{
					if (this.board[y][x] === false)
					{
						let d = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]; // All 8 cardinal [d]irections
						let p = [];

						for (let i = 0; i < 8; i++)
						{
							if (y + d[i][0] < 8 && y + d[i][0] > -1 && x + d[i][1] < 8 && x + d[i][1] > -1)
							{
								let y1 = y + d[i][0]; // Y-coord of next space d
								let x1 = x + d[i][1]; // X-coord of next space d
								let p1 = 1;

								if (this.board[y1][x1] === b)
								{
									let yx = true;

									do
									{
										y1 += d[i][0];
										x1 += d[i][1];
										p1 += 1;

										if (y1 < 8 && y1 > -1 && x1 < 8 && x1 > -1)
										{
											if (this.board[y1][x1] === a)
											{
												p.push(d[i].concat(p1));
												yx = false;
											}
											else
											if (typeof this.board[y1][x1] == "boolean")
											{
												yx = false;
											}
										}
										else
										{
											yx = false;
										}
									}
									while (yx);
								}
							}
						}
						if (p.length > 0)
						{
							this.board[y][x] = true;
							this.possible.push([y, x, p]);
						}
					}
				}
			}
		},
		takeTurn: function(Move) {
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

			this.possible.forEach(p => {
				if (move[0] == p[0] && move[1] == p[1])
				{
					this.board[move[0]][move[1]] = this.turn;
					for (let x = 0; x < p[2].length; x++)
					{
						for (let y = 1; y < p[2][x][2]; y++)
						{
							this.board[move[0] + (p[2][x][0] * y)][move[1] + (p[2][x][1] * y)] = this.turn;
							this.highlight.push([move[0] + (p[2][x][0] * y), move[1] + (p[2][x][1] * y)]);
						}
					}
				}
			});

			this.highlight.unshift(move);

			// Turns all booleans to false for possible placement algorithm
			for (let y = 0; y < 8; y++)
			{
				for (let x = 0; x < 8; x++)
				{
					if (this.board[y][x] === true)
					{
						this.board[y][x] = false;
					}
				}
			}

			this.turn = [1, 0][this.turn];
			this.getPossible();

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
				let score = [0, 0];

				for (let y = 0; y < 8; y++)
				{
					for (let x = 0; x < 8; x++)
					{
						if (typeof this.board[y][x] == "number")
						{
							score[this.board[y][x]]++;
						}
					}
				}

				if (score[0] == score[1])
				{
					this.end = 2;
					this.winner = 2;
				}
				else
				{
					this.end = 1;
					this.winner = score[0] > score[1] ? 0 : 1;
				}
			}
			else
			{
				this.player = this.players[this.turn];
			}

			this.replay.push(Move);

			return false;
		}
	}
}