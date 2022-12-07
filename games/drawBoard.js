import pkg from "canvas";
const { createCanvas, loadImage } = pkg;

export async function drawBoard(Game, replay) {
	switch (Game.game)
	{
		case "soccer":
		{
			const p1lines = new createCanvas(311, 235);
			const p2lines = new createCanvas(311, 235);
			const p1tx = p1lines.getContext('2d');
			const p2tx = p2lines.getContext('2d');

			const images = {
				goals: {
					RightLeft: assets.soccer.goalRightLeft,
					RightRight: assets.soccer.goalRightRight,
					WrongLeft: assets.soccer.goalWrongLeft,
					WrongRight: assets.soccer.goalWrongRight },
				paths: [
					assets.soccer.path0,
					assets.soccer.path1,
					assets.soccer.path2,
					assets.soccer.path3 ],
				playerText: [
					assets.texts.red,
					assets.texts.blue ],
				ball: assets.soccer.ball
			}

			for (let y = 0; y <= 10; y++)
			{
				for (let x = 0; x <= 12; x++)
				{
					for (let i in Game.board[y][x])
					{
						if (Game.board[y][x][i] == 1 || Game.board[y][x][i] == 2)
						{
							let tempImg = new createCanvas(28, 53);
							let ttx = tempImg.getContext("2d");
							ttx.drawImage(images.paths[i], 0, 0);
							let data = ttx.getImageData(0, 0, 28, 53);

							for (let d = 0; d < data.data.length; d += 4)
							{
								if (data.data[d + 3] != 0)
								{
									data.data[d + 0] = [255, 0][Game.board[y][x][i] - 1];
									data.data[d + 1] = [0, 0][Game.board[y][x][i] - 1];
									data.data[d + 2] = [0, 255][Game.board[y][x][i] - 1];
									data.data[d + 3] = [100, 100][Game.board[y][x][i] - 1];
								}
							}

							ttx.putImageData(data, 0, 0);

							[p1tx, p2tx][Game.board[y][x][i] - 1].drawImage(tempImg, x * 25 + 4, (y - 1) * 25 + 3);
						}
					}
				}
			}

			const lines = new createCanvas(311, 235);
			const ltx = lines.getContext("2d");

			ltx.drawImage(p1lines, 0, 0);
			ltx.drawImage(p2lines, 0, 0);

			const data = ltx.getImageData(0, 0, 311, 235);

			for (let d = 0; d < data.data.length; d += 4)
			{
				if (data.data[d + 3] != 0)
				{
					if (data.data[d + 0] != 0 && data.data[d + 1] == 0 && data.data[d + 2] == 0)
					{
						data.data[d + 0] = 255;
						data.data[d + 1] = 102;
						data.data[d + 2] = 102;
					}
					else
					if (data.data[d + 0] == 0 && data.data[d + 1] == 0 && data.data[d + 2] != 0)
					{
						data.data[d + 0] = 102;
						data.data[d + 1] = 102;
						data.data[d + 2] = 255;
					}
					else
					if (data.data[d + 0] != 0 && data.data[d + 1] == 0 && data.data[d + 2] != 0)
					{
						data.data[d + 0] = 150;
						data.data[d + 1] = 102;
						data.data[d + 2] = 150;
					}

					data.data[d + 3] = 255;
				}
			}

			ltx.putImageData(data, 0, 0);

			const canvas = new createCanvas(311, 235);
			const ctx = canvas.getContext('2d');

			ctx.drawImage(assets.boards.soccer, 0, 0);
			ctx.drawImage(lines, 0, 0);
			if (Game.end != 0 && Game.endType == 1)
			{
				ctx.drawImage(images.goals[["Right", "Wrong"][Game.winner == Game.turn ? 0 : 1] + ["Left", "Right"][Game.winner]], [4, 279][Game.winner], 103);
			}
			ctx.drawImage(images.ball, Game.ball[1] * 25 + 1, Game.ball[0] * 25);

			if (replay)
			{
				const textless = new createCanvas(311, 211);
				const ttx = textless.getContext("2d");
				ttx.drawImage(canvas, 0, -24);
				return textless.toBuffer();
			}

			if (Game.end == 0)
			{
				ctx.drawImage(images.playerText[Game.turn], [104, 97][Game.turn], 7);
				ctx.drawImage(assets.texts.turn, [140, 147][Game.turn], 5);
			}
			else
			{
				ctx.drawImage(images.playerText[Game.winner], [110, 103][Game.winner], 7);
				ctx.drawImage(assets.texts.win, [152, 159][Game.winner], 7);
			}

			return canvas.toBuffer();
		}

		case "ttt3d":
		{
			const canvas = new createCanvas(316, 230);
			const ctx = canvas.getContext('2d');

			ctx.drawImage(assets.boards["3DT"], 0, 0);

			const images = {
				board: assets.boards["3DT"],
				player: [ assets.pieces["3DTX"], assets.pieces["3DTO"] ],
				playerText: [ assets.texts["3DTX"], assets.texts["3DTO"] ],
				highlight: [ assets.highlight["3DTXYellow"], assets.highlight["3DTOYellow"], assets.highlight["3DTXGreen"], assets.highlight["3DTOGreen"] ] };

			for (let y = 0; y < 4; y++)
			{
				for (let x = 0; x < 4; x++)
				{
					for (let z = 0; z < 4; z++)
					{
						let Y = y + 1;
						let X = (x + 10).toString(36).toUpperCase();
						let space = Game.board[Y][X][z];
						let coords = Y + X + z;

						if (space !== false)
						{
							ctx.drawImage(images.player[space], [7, 145, 55, 193][y] + (x * 8) + (z * 20), [6, 54, 102, 150][y] + (x * 16));
						}

						if (Game.end === 0 && Game.highlight && coords == Game.highlight)
						{
							ctx.drawImage(images.highlight[space], [7, 145, 55, 193][y] + (x * 8) + (z * 20), [6, 54, 102, 150][y] + (x * 16));
						}
						else
						if (Game.end === 1 && Game.highlight.includes(coords))
						{
							ctx.drawImage(images.highlight[space + 2], [7, 145, 55, 193][y] + (x * 8) + (z * 20), [6, 54, 102, 150][y] + (x * 16));
						}
					}
				}
			}

			if (replay)
			{
				return canvas.toBuffer();
			}

			if (Game.end == 0)
			{
				ctx.drawImage(images.playerText[Game.turn], 140, 10);
				ctx.drawImage(assets.texts.turn, 167, 10);
			}
			if (Game.end == 1)
			{
				ctx.drawImage(images.playerText[Game.winner], 140, 10);
				ctx.drawImage(assets.texts.win, 177, 12);
			}
			if (Game.end == 2)
			{
				ctx.drawImage(assets.texts.tie, 140, 10);
			}

			if (Game.highlight.length == 0)
			{
				ctx.drawImage(assets.texts["3DTFirst"], 72, 193);
			}

			return canvas.toBuffer();
		}

		default:
		{
			const dimensions = {
				"connect4": [7, 6],
				"latrones": [8, 8],
				"loa": [8, 8],
				"ordo": [10, 8],
				"othello": [8, 8],
				"rokumoku": [12, 12],
				"spiderlinetris": [8, 8],
				"squares": [8, 8]
			}[Game.game];

			const images = {
				board: assets.boards[{
					"connect4": "7x6",
					"latrones": "8x8",
					"loa": "8x8",
					"ordo": "10x8",
					"othello": "8x8",
					"rokumoku": "12x12",
					"spiderlinetris": "8x8",
					"squares": "8x8" }[Game.game]],
				player: [
					assets.pieces[{
						"connect4": "red",
						"latrones": "black",
						"loa": "black",
						"ordo": "blue",
						"othello": "black",
						"rokumoku": "white",
						"spiderlinetris": "black",
						"squares": "black" }[Game.game]],
					assets.pieces[{
						"connect4": "blue",
						"latrones": "white",
						"loa": "white",
						"ordo": "white",
						"othello": "white",
						"rokumoku": "black",
						"spiderlinetris": "white",
						"squares": "white" }[Game.game]]],
				playerText: [
					assets.texts[{
						"connect4": "red",
						"latrones": "black",
						"loa": "black",
						"ordo": "blue",
						"othello": "black",
						"rokumoku": "white",
						"spiderlinetris": "black",
						"squares": "black" }[Game.game]],
					assets.texts[{
						"connect4": "blue",
						"latrones": "white",
						"loa": "white",
						"ordo": "white",
						"othello": "white",
						"rokumoku": "black",
						"spiderlinetris": "white",
						"squares": "white" }[Game.game]] ],
				highlight: {
					"connect4": [assets.highlight.pieceYellow, assets.highlight.pieceGreen],
					"latrones": [assets.highlight.pieceYellow, assets.highlight.pieceGreen, assets.highlight.pieceRed, assets.highlight.pieceBlue],
					"loa": [assets.highlight.pieceYellow, assets.highlight.pieceGreen],
					"ordo": [assets.highlight.pieceYellow, assets.highlight.pieceRed, assets.highlight.pieceGreen, assets.highlight.spaceWhite, assets.highlight.spaceBlue],
					"othello": [assets.highlight.pieceYellow, assets.highlight.pieceGreen, assets.highlight.spaceBlue],
					"rokumoku": [assets.highlight.pieceYellow, assets.highlight.pieceGreen],
					"spiderlinetris": [assets.highlight.pieceYellow, assets.highlight.pieceGreen, assets.highlight.spaceBlue],
					"squares": [assets.highlight.pieceYellow, assets.highlight.pieceGreen, assets.highlight.pieceBlue] }[Game.game],
				scoreboard: {
					"othello": assets.scoreboards.blackVSwhite,
					"squares": assets.scoreboards.blackVSred }[Game.game],
				movement: {
					"spiderlinetris": assets.movement.red }[Game.game] };

			const canvas = new createCanvas((25 * dimensions[0]) + 21, (25 * dimensions[1]) + 45);
			const ctx = canvas.getContext("2d");

			ctx.drawImage(images.board, 0, 0);

			// Pieces
			for (let y = 0; y < dimensions[1]; y++)
			{
				for (let x = 0; x < dimensions[0]; x++)
				{
					const X = 17 + (x * 25);
					const Y = 30 + (y * 25);

					// Pieces
					if (Game.game == "connect4")
					{
						if (typeof Game.board[x][y] == "number")
						{
							ctx.drawImage(images.player[Game.board[x][y]], (x * 25) + 17, (y * -25) + 155);
						}
					}
					else
					if (typeof Game.board[y][x] != "boolean")
					{
						if (typeof Game.board[y][x] == "number")
						{
							ctx.drawImage(images.player[Game.board[y][x]], X, Y);
						}
						else
						if (Game.game == "latrones")
						{
							ctx.drawImage(images.player[Game.board[y][x][0]], X, Y);
							ctx.drawImage(assets.pieces.latronesBlock, X, Y);
						}
					}
				}
			}

			// Highlights
			switch (Game.game)
			{
				case "connect4": {
					if (Game.end == 1)
					{
						for (let i of Game.highlight)
						{
							ctx.drawImage(images.highlight[1], (25 * i[0]) + 17, (25 * i[1]) + 30);
						}
					}
					else
					{
						ctx.drawImage(images.highlight[0], (25 * Game.highlight) + 17, (25 * Game.board[Game.highlight].indexOf(false)) + 30);
					}
					break;
				}
				case "latrones": {
					for (let i of Game.highlight)
					{
						ctx.drawImage(images.highlight[i[2]], (i[1] * 25) + 17, (i[0] * 25) + 30);
					}
					break;
				}
				case "loa": {
					if (Game.highlight)
					{
						ctx.drawImage(images.highlight[0], (Game.highlight[0][1] * 25) + 17, (Game.highlight[0][0] * 25) + 30);
						ctx.drawImage(images.highlight[1], (Game.highlight[1][1] * 25) + 17, (Game.highlight[1][0] * 25) + 30);
					}
					break;
				}
				case "ordo":
				{
					for (let i = 0; i < 10; i++)
					{
						ctx.drawImage(images.highlight[3], (i * 25) + 17, 30);
						ctx.drawImage(images.highlight[4], (i * 25) + 17, 205);
					}
					if (Game.end > 0)
					{
						for (let i of Game.highlight[1])
						{
							ctx.drawImage(images.highlight[0], (i[1] * 25) + 17, (i[0] * 25) + 30);
						}
					}
					else
					{
						for (let h in Game.highlight)
						{
							for (let i of Game.highlight[h])
							{
								ctx.drawImage(images.highlight[h - -1], (i[1] * 25) + 17, (i[0] * 25) + 30);
							}
						}
					}
					break;
				}
				case "othello": {
					for (let i = 0; i < Game.possible.length; i++)
					{
						let spot = Game.possible[i];
						ctx.drawImage(images.highlight[2], (spot[1] * 25) + 17, (spot[0] * 25) + 30);
					}
					for (let i in Game.highlight)
					{
						let h = Game.highlight[i];
						ctx.drawImage(i == 0 ? images.highlight[0] : images.highlight[1], (h[1] * 25) + 17, (h[0] * 25) + 30);
					}
					break;
				}
				case "rokumoku": {
					for (let i of Game.highlight)
					{
						ctx.drawImage(images.highlight[Game.end], (i[1] * 25) + 17, (i[0] * 25) + 30);
					}
					break;
				}
				case "squares": {
					for (let h in Game.highlight)
					{
						for (let i of Game.highlight[h])
						{
							ctx.drawImage(images.highlight[h], (i[1] * 25) + 17, (i[0] * 25) + 30)
						}
					}
					break;
				}
				case "spiderlinetris": {
					if (Game.end == 0)
					{
						for (let i = 0; i < Game.possible.length; i++)
						{
							let spot = Game.possible[i];
							ctx.drawImage(images.highlight[2], (spot[1] * 25) + 17, (spot[0] * 25) + 30);
						}

						if (Game.highlight.length == 2)
						{
							ctx.drawImage(images.highlight[0], (Game.highlight[0][1] * 25) + 17, (Game.highlight[0][0] * 25) + 30);
							if (Game.highlight[1])
							{
								for (let x = 0; x < 8; x++)
								{
									for (let y = 0; y < 8; y++)
									{
										if (Game.board[y][x] !== false)
										{
											ctx.drawImage(images.movement[Game.highlight[1]], (x * 25) - 8, (y * 25) + 5);
										}
									}
								}
							}
						}
					}
					else
					{
						for (let i of Game.highlight)
						{
							ctx.drawImage(images.highlight[1], (25 * i[1]) + 17, (25 * i[0]) + 30);
						}
					}
					break;
				}
			}

			if (replay)
			{
				const textless = new createCanvas((25 * dimensions[0]) + 21, (25 * dimensions[1]) + 21);
				const ttx = textless.getContext("2d");
				ttx.drawImage(canvas, 0, -24);
				return textless.toBuffer();
			}
			else
			if (["othello", "squares"].includes(Game.game))
			{
				ctx.drawImage(images.scoreboard, 145, 2);
			}

			if (Game.end == 0)
			{
				ctx.drawImage(images.playerText[Game.turn | 0], 20, 6);
				ctx.drawImage(assets.texts.turn, 21 + images.playerText[Game.turn | 0].width, 4);
			}
			else
			if (Game.end == 1)
			{
				ctx.drawImage(images.playerText[Game.winner], 20, 6);
				ctx.drawImage(assets.texts.win, 26 + images.playerText[Game.turn | 0].width, 6);
			}
			else
			if (Game.end == 2)
			{
				ctx.drawImage(assets.texts.tie, 20, 6);
			}

			return canvas.toBuffer();
		}
	}
}

const URL = "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/main/games/";
const assets = {
	boards: {
		"3DT": await loadImage(URL + "boards/3DT.png"),
		"7x6": await loadImage(URL + "boards/7x6.png"),
		"8x8": await loadImage(URL + "boards/8x8.png"),
		"10x8": await loadImage(URL + "boards/10x8.png"),
		"10x10": await loadImage(URL + "boards/10x10.png"),
		"12x12": await loadImage(URL + "boards/12x12.png"),
		"soccer": await loadImage(URL + "boards/soccer.png")
	},
	highlight: {
		"3DTOGreen": await loadImage(URL + "highlight/3DTOGreen.png"),
		"3DTOYellow": await loadImage(URL + "highlight/3DTOYellow.png"),
		"3DTXGreen": await loadImage(URL + "highlight/3DTXGreen.png"),
		"3DTXYellow": await loadImage(URL + "highlight/3DTXYellow.png"),
		"pieceBlue": await loadImage(URL + "highlight/pieceBlue.png"),
		"pieceGreen": await loadImage(URL + "highlight/pieceGreen.png"),
		"pieceRed": await loadImage(URL + "highlight/pieceRed.png"),
		"pieceYellow": await loadImage(URL + "highlight/pieceYellow.png"),
		"spaceBlue": await loadImage(URL + "highlight/spaceBlue.png"),
		"spaceWhite": await loadImage(URL + "highlight/spaceWhite.png")
	},
	movement: {
		red: [
			await loadImage(URL + "movement/red/0.png"),
			await loadImage(URL + "movement/red/1.png"),
			await loadImage(URL + "movement/red/2.png"),
			await loadImage(URL + "movement/red/3.png"),
			await loadImage(URL + "movement/red/4.png"),
			await loadImage(URL + "movement/red/5.png"),
			await loadImage(URL + "movement/red/6.png"),
			await loadImage(URL + "movement/red/7.png")
		]
	},
	numbers: {
		"0": await loadImage(URL + "numbers/0.png"),
		"1": await loadImage(URL + "numbers/1.png"),
		"2": await loadImage(URL + "numbers/2.png"),
		"3": await loadImage(URL + "numbers/3.png"),
		"4": await loadImage(URL + "numbers/4.png"),
		"5": await loadImage(URL + "numbers/5.png"),
		"6": await loadImage(URL + "numbers/6.png"),
		"7": await loadImage(URL + "numbers/7.png"),
		"8": await loadImage(URL + "numbers/8.png"),
		"9": await loadImage(URL + "numbers/9.png")
	},
	pieces: {
		"3DTO": await loadImage(URL + "pieces/3DTO.png"),
		"3DTX": await loadImage(URL + "pieces/3DTX.png"),
		"black": await loadImage(URL + "pieces/black.png"),
		"blue": await loadImage(URL + "pieces/blue.png"),
		"latronesBlock": await loadImage(URL + "pieces/latronesBlock.png"),
		"red": await loadImage(URL + "pieces/red.png"),
		"white": await loadImage(URL + "pieces/white.png")
	},
	scoreboards: {
		"blackVSred": await loadImage(URL + "scoreboards/blackVSred.png"),
		"blackVSwhite": await loadImage(URL + "scoreboards/blackVSwhite.png")
	},
	soccer: {
		"ball": await loadImage(URL + "soccer/ball.png"),
		"goalRightLeft": await loadImage(URL + "soccer/goalRightLeft.png"),
		"goalRightRight": await loadImage(URL + "soccer/goalRightRight.png"),
		"goalWrongLeft": await loadImage(URL + "soccer/goalWrongLeft.png"),
		"goalWrongRight": await loadImage(URL + "soccer/goalWrongRight.png"),
		"path0": await loadImage(URL + "soccer/path0.png"),
		"path1": await loadImage(URL + "soccer/path1.png"),
		"path2": await loadImage(URL + "soccer/path2.png"),
		"path3": await loadImage(URL + "soccer/path3.png")
	},
	texts: {
		"3DTFirst": await loadImage(URL + "texts/3DTFirst.png"),
		"3DTO": await loadImage(URL + "texts/3DTO.png"),
		"3DTX": await loadImage(URL + "texts/3DTX.png"),
		"black": await loadImage(URL + "texts/black.png"),
		"blue": await loadImage(URL + "texts/blue.png"),
		"latronesPhase1": await loadImage(URL + "texts/latronesPhase1.png"),
		"latronesPhase2": await loadImage(URL + "texts/latronesPhase2.png"),
		"red": await loadImage(URL + "texts/red.png"),
		"tie": await loadImage(URL + "texts/tie.png"),
		"turn": await loadImage(URL + "texts/turn.png"),
		"white": await loadImage(URL + "texts/white.png"),
		"win": await loadImage(URL + "texts/win.png")
	}
}