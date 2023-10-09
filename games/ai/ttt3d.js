import { Xyvybot } from "../../index.js";
export function myTurn() {
	let board = {
		'1': { 'A': [0, 0, 0, 0], 'B': [0, 0, 0, 0], 'C': [0, 0, 0, 0], 'D': [0, 0, 0, 0], },
		'2': { 'A': [0, 0, 0, 0], 'B': [0, 0, 0, 0], 'C': [0, 0, 0, 0], 'D': [0, 0, 0, 0], },
		'3': { 'A': [0, 0, 0, 0], 'B': [0, 0, 0, 0], 'C': [0, 0, 0, 0], 'D': [0, 0, 0, 0], },
		'4': { 'A': [0, 0, 0, 0], 'B': [0, 0, 0, 0], 'C': [0, 0, 0, 0], 'D': [0, 0, 0, 0], }
	};
	let piece = this.players.indexOf(Xyvybot.user.id);
	let wins = [
		['1A0', '1A1', '1A2', '1A3'], ['1B0', '1B1', '1B2', '1B3'],
		['1C0', '1C1', '1C2', '1C3'], ['1D0', '1D1', '1D2', '1D3'],
		['2A0', '2A1', '2A2', '2A3'], ['2B0', '2B1', '2B2', '2B3'],
		['2C0', '2C1', '2C2', '2C3'], ['2D0', '2D1', '2D2', '2D3'],
		['3A0', '3A1', '3A2', '3A3'], ['3B0', '3B1', '3B2', '3B3'],
		['3C0', '3C1', '3C2', '3C3'], ['3D0', '3D1', '3D2', '3D3'],
		['4A0', '4A1', '4A2', '4A3'], ['4B0', '4B1', '4B2', '4B3'],
		['4C0', '4C1', '4C2', '4C3'], ['4D0', '4D1', '4D2', '4D3'],

		['1A0', '1B0', '1C0', '1D0'], ['1A1', '1B1', '1C1', '1D1'],
		['1A2', '1B2', '1C2', '1D2'], ['1A3', '1B3', '1C3', '1D3'],
		['2A0', '2B0', '2C0', '2D0'], ['2A1', '2B1', '2C1', '2D1'],
		['2A2', '2B2', '2C2', '2D2'], ['2A3', '2B3', '2C3', '2D3'],
		['3A0', '3B0', '3C0', '3D0'], ['3A1', '3B1', '3C1', '3D1'],
		['3A2', '3B2', '3C2', '3D2'], ['3A3', '3B3', '3C3', '3D3'],
		['4A0', '4B0', '4C0', '4D0'], ['4A1', '4B1', '4C1', '4D1'],
		['4A2', '4B2', '4C2', '4D2'], ['4A3', '4B3', '4C3', '4D3'],

		['1A0', '2A0', '3A0', '4A0'], ['1A1', '2A1', '3A1', '4A1'],
		['1A2', '2A2', '3A2', '4A2'], ['1A3', '2A3', '3A3', '4A3'],
		['1B0', '2B0', '3B0', '4B0'], ['1B1', '2B1', '3B1', '4B1'],
		['1B2', '2B2', '3B2', '4B2'], ['1B3', '2B3', '3B3', '4B3'],
		['1C0', '2C0', '3C0', '4C0'], ['1C1', '2C1', '3C1', '4C1'],
		['1C2', '2C2', '3C2', '4C2'], ['1C3', '2C3', '3C3', '4C3'],
		['1D0', '2D0', '3D0', '4D0'], ['1D1', '2D1', '3D1', '4D1'],
		['1D2', '2D2', '3D2', '4D2'], ['1D3', '2D3', '3D3', '4D3'],

		['1A0', '1B1', '1C2', '1D3'], ['2A0', '2B1', '2C2', '2D3'],
		['3A0', '3B1', '3C2', '3D3'], ['4A0', '4B1', '4C2', '4D3'],

		['1D0', '1C1', '1B2', '1A3'], ['2D0', '2C1', '2B2', '2A3'],
		['3D0', '3C1', '3B2', '3A3'], ['4D0', '4C1', '4B2', '4A3'],

		['1A0', '2A1', '3A2', '4A3'], ['1B0', '2B1', '3B2', '4B3'],
		['1C0', '2C1', '3C2', '4C3'], ['1D0', '2D1', '3D2', '4D3'],

		['1A3', '2A2', '3A1', '4A0'], ['1B3', '2B2', '3B1', '4B0'],
		['1C3', '2C2', '3C1', '4C0'], ['1D3', '2D2', '3D1', '4D0'],

		['1A0', '2B0', '3C0', '4D0'], ['1A1', '2B1', '3C1', '4D1'],
		['1A2', '2B2', '3C2', '4D2'], ['1A3', '2B3', '3C3', '4D3'],

		['1D0', '2C0', '3B0', '4A0'], ['1D1', '2C1', '3B1', '4A1'],
		['1D2', '2C2', '3B2', '4A2'], ['1D3', '2C3', '3B3', '4A3'],

		['1A0', '2B1', '3C2', '4D3'], ['1D3', '2C2', '3B1', '4A0'],
		['1A3', '2B2', '3C1', '4D0'], ['1D0', '2C1', '3B2', '4A3']];

	for (let i = 0; i < 76; i++)
	{
		let rowCoords = wins[i];
		let rowPieces = [
			this.board[rowCoords[0][0]][rowCoords[0][1]][rowCoords[0][2]],
			this.board[rowCoords[1][0]][rowCoords[1][1]][rowCoords[1][2]],
			this.board[rowCoords[2][0]][rowCoords[2][1]][rowCoords[2][2]],
			this.board[rowCoords[3][0]][rowCoords[3][1]][rowCoords[3][2]] ];
		if (!rowPieces.some(p => p === false))
		{
			continue;
		}

		if (!rowPieces.some(p => p === piece))
		{
			let count = rowPieces.filter(p => p !== false).length;
			rowCoords.forEach((p, i) => board[p[0]][p[1]][p[2]] += this.priorities.defense[count]);
		}

		if (!rowPieces.some(p => p === [1, 0][piece]))
		{
			let count = rowPieces.filter(p => p !== false).length;
			rowCoords.forEach((p, i) => board[p[0]][p[1]][p[2]] += this.priorities.offense[count]);
		}
	}

	let Board = [];
	for (let y = 0; y < 4; y++)
	{
		for (let x = 0; x < 4; x++)
		{
			for (let z = 0; z < 4; z++)
			{
				let Y = y + 1;
				let X = (x + 10).toString(36).toUpperCase();
				if (this.board[Y][X][z] === false)
				{
					Board.push([Y, X, z]);
				}
			}
		}
	}

	Board.sort((a, b) => board[b[0]][b[1]][b[2]] - board[a[0]][a[1]][a[2]]);
	let space = Board.filter(p => board[p[0]][p[1]][p[2]] == board[Board[0][0]][Board[0][1]][Board[0][2]]).random();

	return space[0] + ' ' + space[1] + (space[2] + 1);
}