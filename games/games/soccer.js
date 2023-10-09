export function newGame(player, id) {
	return {
		ball: [5, 6],
		turnColors: ["#ff6666", "#6666ff"],
		board: [
			[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 2, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 0], [0, 0, 0, 0]],
			[[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]],
			[[2, 0, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [3, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [0, 0, 3, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
			[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] ],
		endMessage: function() {
			return [`It is <@${this.player}>'s turn.`,
				[	`<@${this.players[this.winner]}> has won!`,
					`<@${this.players[this.winner]}> has won because <@${this.player}> put the ball in the wrong goal!`,
					`<@${this.players[this.winner]}> has won because <@${this.player}> got the ball stuck!` ][this.endType] ][this.end];
		},
		takeTurn: function(Move) {
			let move;
			let goagain = false;

			this.end = 0;
			this.winner = false;

			if (/[1-8]/.test(Move))
			{
				move = Number(Move) - 1;
			}
			else
			if (/([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?)/i.test(Move))
			{
				move = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest",
						"n", "ne", "e", "se", "s", "sw", "w", "nw",
						"north", "eastnorth", "east", "eastsouth", "south", "westsouth", "west", "westnorth",
						"n", "en", "e", "es", "s", "ws", "w", "wn",
						"up", "upright", "right", "downright", "down", "downleft", "left", "upleft",
						"u", "ur", "r", "dr", "d", "dl", "l", "ul",
						"up", "rightup", "right", "rightdown", "down", "leftdown", "left", "leftup",
						"u", "ru", "r", "rd", "d", "ld", "l", "lu"].indexOf(Move.toLowerCase().replace(/\s{1,}/, '')) % 8;
			}

			this.highlight = move;

			let tempboard = this.board.clone();
			let tempBall = this.ball.clone();

			let y = tempBall[0];
			let x = tempBall[1];
			let y2 = [-1, -1, 0, 1, 1, 1, 0, -1][move];
			let x2 = [0, 1, 1, 1, 0, -1, -1, -1][move];

			if (((move < 2 || move == 7) && y == 1) || (move > 2 && move < 6 && y == 9) || (move > 4 && x == 1 && ((y == 4 && move != 5) && (y == 6 && move != 7) && y != 5)) || (move < 4 && move > 0 && x == 11 && ((y == 4 && move != 3) && (y == 6 && move != 1) && y != 5)))
			{
				return "You cannot move the ball passed the edge of the board.";
			}

			if (((move == 2 || move == 6) && (y == 1 || y == 9)) || (((move == 0 && (y > 6 || y < 5)) || (move == 4 && (y > 5 || y < 4))) && (x == 1 || x == 11)) || (x == 11 && (y == 4 || y == 6) && move == 2) || (x == 1 && (y == 4 || y == 6) && move == 6))
			{
				return "You cannot move the ball along the edge of the board, you have to bounce off.";
			}

			if ((move < 4 && tempboard[y][x][move] != 0) || (move > 3 && tempboard[y + y2][x + x2][move % 4] != 0))
			{
				return "This move will cross a path that has already been used.";
			}


			y += y2;
			x += x2;

			if (tempboard[y][x].some(p => p != 0) || tempboard[y + 1][x + 0][0] != 0 || tempboard[y + 1][x - 1][1] != 0 || tempboard[y + 0][x - 1][2] != 0 || tempboard[y - 1][x - 1][3] != 0)
			{
				goagain = true;
			}

			if (move > 3)
			{
				tempboard[y][x][move % 4] = this.turn + 1;
			}
			else
			{
				tempboard[y - y2][x - x2][move] = this.turn + 1;
			}

			tempBall[0] = y;
			tempBall[1] = x;

			if ((x == 0 || x == 12) && (y == 4 || y == 5 || y == 6))
			{
				this.winner = x == 0 ? 0 : 1;
				this.end = 1;
				this.endType = this.winner == this.turn ? 0 : 1;
			}
			else
			if (((y == 1 || y == 9) && (x == 1 || x == 11)) || (y == 1 && tempboard[y][x][3] != 0 && tempboard[y + 1][x][0] != 0 && tempboard[y + 1][x - 1][1] != 0) || (y == 9 && tempboard[y][x][0] != 0 && tempboard[y + 0][x][1] != 0 && tempboard[y - 1][x - 1][3] != 0) || (x == 1 && (y == 2 || y == 3 || y == 7 || y == 8) && !tempboard[y][x].clone().splice(1, 3).includes(0)) || (x == 11 && (y == 2 || y == 3 || y == 7 || y == 8) && ![tempboard[y - 1][x - 1][3], tempboard[y][x - 1][2], tempboard[y + 1][x - 1][1]].includes(0)) || (!tempboard[y][x].concat([tempboard[y - 1][x - 1][3], tempboard[y][x - 1][2], tempboard[y + 1][x - 1][1], tempboard[y + 1][x][0]]).includes(0)))
			{
				this.end = 1;
				this.endType = 2;
				this.winner = [1, 0][this.turn];
			}
			else
			if (!goagain)
			{
				this.turn = [1, 0][this.turn];
				this.player = this.players[this.turn];
			}

			this.board = tempboard;
			this.ball = tempBall;

			this.replay.push(Move);

			return false;
		}
	}
}