import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
import { Color } from "../misc/color.js";
import { newUIColor } from "../misc/newUIColor.js";
import { gameCount } from "../../index.js";

export async function drawProfile(Side, user, profile, avatar, background, preview) {
	const dimensions = {};
	if (background.height > 300 || background.width > 400)
	{
		if (background.height / background.width == 0.75)
		{
			dimensions.width = 400;
			dimensions.height = 300;
		}

		if (background.height / background.width <  0.75)
		{
			dimensions.width = 400;
			dimensions.height = Math.round(background.height / background.width * 400);
		}

		if (background.height / background.width >  0.75)
		{
			dimensions.width = Math.round(background.width / background.height * 300);
			dimensions.height = 300;
		}
	}
	else
	{
		dimensions.width = background.width;
		dimensions.height = background.height;
	}

	const Canvas = new createCanvas(dimensions.width, dimensions.height);
	const ctx = Canvas.getContext('2d');
	const color = preview ? newUIColor(background, dimensions) : new Color(profile.color);
	const images = {};
	const side = Side ? 'left' : 'right';
	for (let asset in assets[side])
	{
		const Asset = assets[side][asset];
		const border = new createCanvas(Asset.width, Asset.height);
		const bdrctx = border.getContext('2d');
		const img = Object.keys(assets[side]).indexOf(asset);
		bdrctx.drawImage(Asset, 0, 0);

		const data = bdrctx.getImageData(0, 0, Asset.width, Asset.height);
		for (let i = 0; i < data.data.length; i += 4)
		{
			const val = img == 10 ? 63 : img % 2 == 0 ? 31 : 223;
			data.data[i]	 = Math.round(color.r - ((color.r - val) / 2));
			data.data[i + 1] = Math.round(color.g - ((color.g - val) / 2));
			data.data[i + 2] = Math.round(color.b - ((color.b - val) / 2));
			data.data[i + 3] *= 0.8;
			bdrctx.putImageData(data, 0, 0);
			images[asset] = border;
		}
	}

	// Text
	let h = 0;
	const top = [];
	for (let i = 0; i < 3; i++)
	{
		const info = [user.username + "#" + user.discriminator, user.id, profile.title.replace(/\u200b/g, "'")][i];
		const text = await drawText(info);
		const Text = new createCanvas(text[1], 11);
		const tectx = Text.getContext('2d');
		tectx.drawImage(text[0], 0, 0);
		const data = tectx.getImageData(0, 0, text[1], 11);
		for (let x = 0; x < data.data.length; x += 4)
		{
			data.data[x]	 = Math.round(color.r - ((color.r - 63) / 2));
			data.data[x + 1] = Math.round(color.g - ((color.g - 63) / 2));
			data.data[x + 2] = Math.round(color.b - ((color.b - 63) / 2));
			data.data[x + 3] *= 0.8;
		}

		if (text[1] > [135, 120, 105][i] + h)
		{
			h = text[1] - [135, 120, 105][i];
		}

		tectx.putImageData(data, 0, 0);
		top.push(Text);
	}

	// Games
	const games = ["OTHELLO", "SQUARES", "ROKUMOKU", "3D TIC-TAC-TOE", "CONNECT FOUR", "ORDO", "PAPER SOCCER", "LINES OF ACTION", "LATRONES", "SPIDER LINETRIS"];
	const gameText = [];
	for (let game of games)
	{
		const text = await drawText(game);
		const Text = new createCanvas(text[1], 11);
		const textx = Text.getContext('2d');
		textx.drawImage(text[0], 0, 0);
		const data = textx.getImageData(0, 0, text[1], 11);
		for (let x = 0; x < data.data.length; x += 4)
		{
			data.data[x]	 = Math.round(color.r - ((color.r - 63) / 2));
			data.data[x + 1] = Math.round(color.g - ((color.g - 63) / 2));
			data.data[x + 2] = Math.round(color.b - ((color.b - 63) / 2));
			data.data[x + 3] *= 0.8;
		}

		textx.putImageData(data, 0, 0);
		gameText.push(Text);
	}

	// Score
	const scores = [];
	for (let y = 0; y < 2 + gameCount; y++)
	{
		let score = 0;
		if (y < gameCount)
		{
			score = profile.elos[y];
		}
		else
		if (y == gameCount)
		{
			score = 0;
			for (let i = 0; i < gameCount; i++)
			{
				score += profile.elos[i];
			}
			score = score / gameCount | 0;
		}
		else
		{
			score = profile["money"] > 999999 ? 999999 : profile["money"];
		}

		const Score = ' '.repeat(6 - JSON.stringify(score).length) + JSON.stringify(score);
		const canvas = new createCanvas(47, 9);
		const ctx = canvas.getContext('2d');
		for (let x = 0; x < 6; x++)
		{
			if (Score[x] !== ' ')
			{
				const image = await drawText(Score[x]);
				ctx.drawImage(image[0], 8 * x - 1, 0);
			}
		}

		const data = ctx.getImageData(0, 0, 47, 9);
		for (let i = 0; i < data.data.length; i += 4)
		{
			data.data[i]	 = Math.round(color.r - ((color.r - 63) / 2));
			data.data[i + 1] = Math.round(color.g - ((color.g - 63) / 2));
			data.data[i + 2] = Math.round(color.b - ((color.b - 63) / 2));
			data.data[i + 3] *= 0.8;
		}

		ctx.putImageData(data, 0, 0);
		scores.push(canvas);
	}

	ctx.drawImage(background, 0, 0, dimensions.width, dimensions.height);
	ctx.drawImage(images.top, [0, dimensions.width - 154][Side ? 0 : 1], 0);
	ctx.drawImage(images.topBack, [0, dimensions.width - 154][Side ? 0 : 1], 0);
	ctx.drawImage(images.topExtend, [152, dimensions.width - (152 + h)][Side ? 0 : 1], 0, h, 47);
	ctx.drawImage(images.topExtendBack, [152, dimensions.width - (152 + h)][Side ? 0 : 1], 0, h, 47);
	ctx.drawImage(images.topEnd, [152 + h, dimensions.width - (200 + h)][Side ? 0 : 1], 0);
	ctx.drawImage(images.topEndBack, [152 + h, dimensions.width - (200 + h)][Side ? 0 : 1], 0);
	ctx.drawImage(images.game, [0, dimensions.width - 154][Side ? 0 : 1], 64, 154, 10 * gameCount);
	ctx.drawImage(images.gameBack, [0, dimensions.width - 154][Side ? 0 : 1], 64, 154, 10 * gameCount);
	ctx.drawImage(images.bottom, [0, dimensions.width - 154][Side ? 0 : 1], 64 + (10 * gameCount));
	ctx.drawImage(images.bottomBack, [0, dimensions.width - 154][Side ? 0 : 1], 64 + (10 * gameCount));
	ctx.drawImage(top[0], [47, dimensions.width - (47 + top[0].width)][Side ? 0 : 1], 3);
	ctx.drawImage(top[1], [47, dimensions.width - (47 + top[1].width)][Side ? 0 : 1], 19);
	ctx.drawImage(top[2], [47, dimensions.width - (47 + top[2].width)][Side ? 0 : 1], 33);
	for (let i = 0; i < gameCount; i++)
	{
		ctx.drawImage(gameText[i], [3, dimensions.width - 151][Side ? 0 : 1], 64 + (10 * i), gameText[i].width > 95 ? 95 : gameText[i].width, gameText[i].height);
		ctx.drawImage(scores[i], [103, dimensions.width - 51][Side ? 0 : 1], 64 + (10 * i));
	}

	ctx.drawImage(scores[gameCount], [103, dimensions.width - 51][Side ? 0 : 1], 69 + (10 * gameCount));
	ctx.drawImage(scores[gameCount + 1], [50, dimensions.width - 104][Side ? 0 : 1], 69 + (10 * gameCount));
	ctx.drawImage(images.preText, [4, dimensions.width - 150][Side ? 0 : 1], 49);
	ctx.drawImage(avatar, [2, dimensions.width - 45][Side ? 0 : 1], 2, 43, 43);

	return Canvas.toBuffer();
};

const drawText = async function(text) {
	const typeface = await loadImage("./assets/profile/alphabet.png");
	const alphabet = (await import("./alphabet.json", { assert: { type: "json" } })).default;
	const canvas1 = new createCanvas(64, 132);
	const ctx1 = canvas1.getContext("2d");
	ctx1.drawImage(typeface, 0, 0);

	const canvas2 = new createCanvas(335, 11);
	const ctx2 = canvas2.getContext('2d');
	// const text
	let width = 1;

	for (let a of text.split(''))
	{
		if (alphabet.hasOwnProperty(a))
		{
			const letter = alphabet[a];
			const glyph = ctx1.getImageData(letter[0] * 8, letter[1] * 11, letter[2], 11);
			if (letter[3])
			{
				width -= 1;
			}

			ctx2.putImageData(glyph, width, 0);
			width += letter[2] + 1;
		}
	}
	return [canvas2, width];
}

const assets = {
	left: {
		top: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/top.png"),
		topBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/topBack.png"),
		topExtend: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/topExtend.png"),
		topExtendBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/topExtendBack.png"),
		topEnd: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/topEnd.png"),
		topEndBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/topEndBack.png"),
		game: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/game.png"),
		gameBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/gameBack.png"),
		bottom: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/bottom.png"),
		bottomBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/bottomBack.png"),
		preText: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/left/preText.png"),
	},
	right: {
		top: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/top.png"),
		topBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/topBack.png"),
		topExtend: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/topExtend.png"),
		topExtendBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/topExtendBack.png"),
		topEnd: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/topEnd.png"),
		topEndBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/topEndBack.png"),
		game: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/game.png"),
		gameBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/gameBack.png"),
		bottom: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/bottom.png"),
		bottomBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/bottomBack.png"),
		preText: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/right/preText.png"),
	}
};