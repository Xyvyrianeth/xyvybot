import pkg from 'canvas';
const { createCanvas, loadImage } = pkg;
import { Color } from "../misc/color.js";
import { newUIColor } from "../misc/newUIColor.js";

export async function drawTop(users, user) {
	const backgroundIDs = "wc3NJcw rZnwTBY HQZPLug RXUcufl Q1n8x53 uYfpJKD t1D9XLq t1D9XLq OUscSSr iVUrJCR psW7uFT WWIaZcs lb1i5w2 EZ9fGKQ nQt5RNG ZfMIYm2 BREHc3Q 4OLpzfw".split(' ');
	const backgroundIndex = Math.random() * backgroundIDs.length | 0;
	const backgroundID = backgroundIDs[backgroundIndex];
	const background = await loadImage(`https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/backgrounds/${backgroundID}.png`);

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
		dimensions.width = background.width,
		dimensions.height = background.height;
	}

	const accountForWidth = (dimensions.width - 246) / 2;
	const Canvas = new createCanvas(dimensions.width, dimensions.height);
	const CTX = Canvas.getContext('2d');
	CTX.drawImage(background, 0, 0, dimensions.width, dimensions.height);

	const color = newUIColor(background, dimensions);
	const userHeight = 12 * users.length;
	const images = {};
	for (let asset in assets)
	{
		const border = new createCanvas(assets[asset].width, assets[asset].height);
		const borderCTX = border.getContext('2d');

		borderCTX.drawImage(assets[asset], 0, 0);
		const data = borderCTX.getImageData(0, 0, assets[asset].width, assets[asset].height);
		for (let i = 0; i < data.data.length; i += 4)
		{
			const val = asset.endsWith("Back") ? 223 : asset.endsWith("Text") ? 63 : 31;
			data.data[i]	 = Math.round(color.r - ((color.r - val) / 2));
			data.data[i + 1] = Math.round(color.g - ((color.g - val) / 2));
			data.data[i + 2] = Math.round(color.b - ((color.b - val) / 2));
			data.data[i + 3] *= 0.8;
		}
		borderCTX.putImageData(data, 0, 0);
		images[asset] = border;
	}

	const finalTexts = [];
	for (let info of users)
	{
		const rawTexts = [await drawNumber(info[1]), await drawText(info[0].username + '#' + info[0].discriminator), await drawNumber(info[2]), await drawNumber(info[5].replace("100.00%", "100%"))];
		const userTexts = rawTexts.map((text, index) => {
			const textCanvas = new createCanvas(text[1], 11);
			const textCTX = textCanvas.getContext('2d');
			textCTX.drawImage(text[0], 0, 0);
			const data = textCTX.getImageData(0, 0, text[1], 11);
			for (let x = 0; x < data.data.length; x += 4)
			{
				data.data[x]	 = Math.round(color.r - ((color.r - 63) / 2));
				data.data[x + 1] = Math.round(color.g - ((color.g - 63) / 2));
				data.data[x + 2] = Math.round(color.b - ((color.b - 63) / 2));
				data.data[x + 3] *= 0.8;
			}

			textCTX.putImageData(data, 0, 0);
			if (index == 3)
			{
				return [textCanvas, info[5] == "100.00%" ? 4 : 0];
			}
			else
			if (index == 1 && text[1] > 102)
			{
				const tooWideCanvas = new createCanvas(102, 11);
				const tooWideCanvasCTX = tooWideCanvas.getContext('2d');
				tooWideCanvasCTX.drawImage(textCanvas, 0, 0, 102, 11);
				return tooWideCanvas;
			}
			else
			{
				return textCanvas;
			}
		});

		const textCanvas = new createCanvas(241, 11);
		const textCanvasCTX = textCanvas.getContext('2d');
		textCanvasCTX.drawImage(userTexts[0],    0, 0);
		textCanvasCTX.drawImage(userTexts[1],    29, 0, userTexts[1].width, userTexts[1].height);
		textCanvasCTX.drawImage(userTexts[2],    137 + (8 * (6 - String(info[2]).length)), 0);
		textCanvasCTX.drawImage(userTexts[3][0], 192 + (info[5] == "100.00%" ? 4 : 0), 0);
		finalTexts.push(textCanvas);
	}

	const UserCanvas = new createCanvas(241, 11);
	const UserCTX = UserCanvas.getContext('2d');
	if (user)
	{
		const rawText = [await drawNumber(user[1]), await drawText(user[0].username + '#' + user[0].discriminator), await drawNumber(user[2]), await drawNumber(user[5].replace("100.00%", "100%"))];
		const userText = rawText.map((text, index) => {
			const textCanvas = new createCanvas(text[1], 11);
			const textCanvasCTX = textCanvas.getContext('2d');
			textCanvasCTX.drawImage(text[0], 0, 0);
			const data = textCanvasCTX.getImageData(0, 0, text[1], 11);
			for (let x = 0; x < data.data.length; x += 4)
			{
				data.data[x]	 = Math.round(color.r - ((color.r - 63) / 2));
				data.data[x + 1] = Math.round(color.g - ((color.g - 63) / 2));
				data.data[x + 2] = Math.round(color.b - ((color.b - 63) / 2));
				data.data[x + 3] *= 0.8;
			}

			textCanvasCTX.putImageData(data, 0, 0);

			if (index == 3)
			{
				return [textCanvas, user[5] == "100.00%" ? 4 : 0];
			}
			else
			if (index == 1 && text[1] > 102)
			{
				const tooWideCanvas = new createCanvas(102, 11);
				const tooWideCanvasCTX = tooWideCanvas.getContext('2d');
				tooWideCanvasCTX.drawImage(textCanvas, 0, 0, 102, 11);
				return tooWideCanvas;
			}
			else
			{
				return textCanvas;
			}
		});

		UserCTX.drawImage(userText[0],    0, 0);
		UserCTX.drawImage(userText[1],    29, 0, userText[1].width, userText[1].height);
		UserCTX.drawImage(userText[2],    137 + (8 * (6 - String(user[2]).length)), 0);
		UserCTX.drawImage(userText[3][0], 192 + (user[5] == "100.00%" ? 4 : 0), 0);
	}

	["top", "topBack", "place", "placeBack", "topText"].forEach(asset => CTX.drawImage(images[asset], dimensions.width - 245 - accountForWidth, asset.startsWith("top") ? 0 : 19, 246, asset.startsWith("top") ? 19 : userHeight));

	finalTexts.forEach((text, index) => CTX.drawImage(text, dimensions.width - 241 - accountForWidth, 20 + (12 * index)));

	if (user)
	{
		CTX.drawImage(images.bottom, dimensions.width - 245 - accountForWidth, 19 + userHeight);
		CTX.drawImage(images.bottomBack, dimensions.width - 245 - accountForWidth, 19 + userHeight);
		CTX.drawImage(UserCanvas, dimensions.width - 241 - accountForWidth, 25 + userHeight);
		CTX.drawImage(images.user, dimensions.width - 282 - accountForWidth, 22 + userHeight);
		CTX.drawImage(images.userBack, dimensions.width - 282 - accountForWidth, 22 + userHeight);
		CTX.drawImage(images.userText, dimensions.width - 282 - accountForWidth, 22 + userHeight);
	}
	else
	{
		CTX.drawImage(images.altBottom, dimensions.width - 245 - accountForWidth, 19 + userHeight);
		CTX.drawImage(images.altBottomBack, dimensions.width - 245 - accountForWidth, 19 + userHeight);
	}

	return Canvas.toBuffer();
}

const drawText = async function(text) {
	const letters = await loadImage("./assets/profile/alphabet.png");
	const alphabet = (await import("../profile/alphabet.json", { assert: { type: "json" } })).default;
	const canvas1 = new createCanvas(64, 132);
	const CTX1 = canvas1.getContext('2d');
	CTX1.drawImage(letters, 0, 0);

	const canvas2 = new createCanvas(335, 11);
	const CTX2 = canvas2.getContext('2d');
	const Text = String(text).split('').filter(letter => alphabet.hasOwnProperty(letter));
	let h = alphabet[Text[0]][3] ? 1 : 0;

	for (let i of Text)
	{
		const A = alphabet[i];
		const letter = CTX1.getImageData(A[0] * 8, A[1] * 11, A[2], 11);
		if (A[3])
		{
			h -= 1;
		}

		CTX2.putImageData(letter, h, 0);
		h += A[2] + 1;
	}
	return [canvas2, h - 1];
}
const drawNumber = async function(number) {
	const typeface = await loadImage("./assets/profile/alphabet.png");
	const alphabet = (await import("../profile/alphabet.json", { assert: { type: "json" } })).default;
	const canvas1 = new createCanvas(64, 132);
	const CTX1 = canvas1.getContext('2d');
	CTX1.drawImage(typeface, 0, 0);

	const canvas2 = new createCanvas(335, 11);
	const CTX2 = canvas2.getContext('2d');
	const text = String(number);
	let width = 0;

	for (let a of text.split(''))
	{
		const letter = alphabet[a];
		const glyph = CTX1.getImageData(letter[0] * 8, letter[1] * 11, letter[2], 11);
		if (a == '1')
		{
			width += 3;
		}

		CTX2.putImageData(glyph, width, 0);
		width += letter[2] + 1;
	}
	return [canvas2, width - 1];
}

const assets = {
	top: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/top.png"),
	place: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/place.png"),
	bottom: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/bottom.png"),
	user: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/user.png"),
	altBottom: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/altBottom.png"),
	topBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/topBack.png"),
	placeBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/placeBack.png"),
	bottomBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/bottomBack.png"),
	userBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/userBack.png"),
	altBottomBack: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/altBottomBack.png"),
	topText: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/topText.png"),
	userText: await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/leaderboard/userText.png")
};