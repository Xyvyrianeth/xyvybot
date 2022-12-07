import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
export function newGame(player, id) {
	let _ = false;
	return {
		turnColors: ["#000000", "#ffffff", "#66ff66"],
		board: {
			'1': { 'A': [_, _, _, _], 'B': [_, _, _, _], 'C': [_, _, _, _], 'D': [_, _, _, _], },
			'2': { 'A': [_, _, _, _], 'B': [_, _, _, _], 'C': [_, _, _, _], 'D': [_, _, _, _], },
			'3': { 'A': [_, _, _, _], 'B': [_, _, _, _], 'C': [_, _, _, _], 'D': [_, _, _, _], },
			'4': { 'A': [_, _, _, _], 'B': [_, _, _, _], 'C': [_, _, _, _], 'D': [_, _, _, _], } },
		endMessage: function() {
			return [`<@${this.player}>'s turn.`,
					`<@${this.players[this.winner]}> has won!`,
					`<@${this.players[0]}> and <@${this.players[1]}> have tied!`][this.end];
		},
		takeTurn: function(Move) {
			let X = Move.match(/[1-4]/g)[0];
			let Y = Move.match(/[a-d]/i)[0].toUpperCase();
			let Z = Move.match(/[1-4]/g)[1] - 1;

			this.winner = false;

			if (this.board[X][Y][Z] !== false)
			{
				return "this space is not empty.";
			}
			else
			{
				this.board[X][Y][Z] = this.turn;
			}

			// I don't know how to make this simpler, I'm sorry...
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

			this.highlight = X + Y + Z;

			for (let i = 0; i < 76; i++)
			{
				let w = wins[i];
				let rowOfFour = [0, 1, 2, 3].map(p => this.board[w[p][0]][w[p][1]][w[p][2]]);

				if (rowOfFour.all(this.turn))
				{
					this.end = 1;
					this.winner = this.turn;
					this.highlight = [w[0], w[1], w[2], w[3]];

					break;
				}

				let maybeRow = [
					rowOfFour.map(p => p === false ? 0 : p),
					rowOfFour.map(p => p === false ? 1 : p) ];
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
				this.turn = [1, 0][this.turn];
				this.player = this.players[this.turn];
			}

			this.replay.push(Move);

			return false;
		}
	}
}