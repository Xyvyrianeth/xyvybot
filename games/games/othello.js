export function newGame(player, id) {
	let _ = false;
	let O = true;
	return {
		score: [2, 2],
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
			for (let y = 0, x = 0; y < 8; x < 7 ? x++ : (y++, x = 0))
			{
				if (this.board[y][x] !== false)
				{
					continue;
				}

				let d = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
				let p = [];

				for (let D of d)
				{
					if (y + D[0] > 7 || y + D[0] < 0 || x + D[1] > 7 || x + D[1] < 0)
					{
						continue;
					}

					let y2 = y + D[0];
					let x2 = x + D[1];
					let p1 = 1;
					if (this.board[y2][x2] !== b)
					{
						continue;
					}

					currentLine: while (true)
					{
						y2 += D[0];
						x2 += D[1];
						p1 += 1;

						if (y2 > 7 || y2 < 0 || x2 > 7 || x2 < 0)
						{
							break currentLine;
						}
						if (this.board[y2][x2] === a)
						{
							p.push(D.concat(p1));
							break currentLine;
						}
						else
						if (typeof this.board[y2][x2] == "boolean")
						{
							break currentLine;
						}
					}
				}
				if (p.length > 0)
				{
					this.board[y][x] = true;
					this.possible.push([y, x, p]);
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

			const captures = this.possible.find(p => move[0] == p[0] && move[1] == p[1])[2];
			this.board[move[0]][move[1]] = this.turn;
			for (let dir of captures)
			{
				for (let dis = 0; dis < dir[2]; dis++)
				{
					const space = [move[0] + dir[0] * dis, move[1] + dir[1] * dis];
					this.board[space[0]][space[1]] = this.turn;
					this.highlight.push(space);
				}
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
	}
}