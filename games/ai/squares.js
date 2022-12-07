import { client } from "../../Xyvy.js";
export function myTurn() {
	let board = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	];
	let piece = this.players.indexOf(client.user.id);
	for (let size = 1; size < 10; size++)
	{
		for (let y = 0; y < 10 - size; y++)
		{
			for (let x = 0; x < 10 - size; x++)
			{
				let squareCoords = [[y, x], [y + size, x], [y, x + size], [y + size, x + size]];
				let squarePieces = squareCoords.map(p => this.board[p[0]][p[1]]);
				if (!squarePieces.some(p => p === false))
				{
					continue;
				}

				if (!squarePieces.some(p => p === piece))
				{
					let count = squarePieces.filter(p => p !== false).length
					squareCoords.forEach(p => board[p[0]][p[1]] += this.priorities.offense[count]);
				}

				if (!squarePieces.some(p => p === [1, 0][piece]))
				{
					let count = squarePieces.filter(p => p !== false).length
					squareCoords.forEach((p, i) => board[p[0]][p[1]] += this.priorities.defense[count]);
				}
			}
		}
	}

	let Board = [];
	for (let y = 0; y < 10; y++)
	{
		for (let x = 0; x < 10; x++)
		{
			if (this.board[y][x] === false)
			{
				Board.push([y, x]);
			}
		}
	}

	Board.sort((a, b) => board[b[0]][b[1]] - board[a[0]][a[1]]);
	let space = Board.filter(p => board[p[0]][p[1]] == board[Board[0][0]][Board[0][1]]).random();
	let Y = space[0] + 1;
	let X = (space[1] + 10).toString(36);

	return Y + X;
}
