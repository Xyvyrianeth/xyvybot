const Canvas = require('canvas');
const { Color } = require('/app/assets/misc/color.js');
var titles = require('/app/assets/profile/titles.json');


exports.drawLeft = function(member, profile, avatar, background) {
	let width,
		height;
	if (background.height > 300 || background.width > 400)
	{
		if (background.height / background.width == 0.75)
			width = 400,
			height = 300;
		if (background.height / background.width <  0.75)
			width = 400,
			height = Math.round(background.height / background.width * 400);
		if (background.height / background.width >  0.75)
			width = Math.round(background.width / background.height * 300),
			height = 300;
	}
	else
		width = background.width,
		height = background.height;

	let canvas = new Canvas.createCanvas(width, height),
		ctx = canvas.getContext('2d'),
		color = new Color(profile.color),
		assets = [];
	for (let img = 0; img < 7; img++)
	{
		let w = [154, 154, 48, 48, 1, 1, 134][img],
			h = [152, 152, 47, 47, 47, 47, 99][img], // UPDATE WITH NEW GAMES (First two and last one)
			image = exports.Images.left[["border", "borderback", "corner", "cornerback", "extend", "extendback", "preText"][img]],
			border = new Canvas.createCanvas(w, h),
			bdrctx = border.getContext('2d');

		bdrctx.drawImage(image, 0, 0);
		let data = bdrctx.getImageData(0, 0, w, h);
		for (let i = 0; i < data.data.length; i += 4)
		{
			let val = img == 6 ? 63 : img % 2 == 0 ? 31 : 223;
			data.data[i]	 = Math.round(color.r - ((color.r - val) / 2)),
			data.data[i + 1] = Math.round(color.g - ((color.g - val) / 2)),
			data.data[i + 2] = Math.round(color.b - ((color.b - val) / 2)),
			data.data[i + 3] *= 0.8;
		}
		bdrctx.putImageData(data, 0, 0);
		assets.push(border);
	}

	// Text
	let h = 0,
		texts = [];
	for (let i = 0; i < 3; i++)
	{
		text = drawText([member.username + "#" + member.discriminator, member.id, titles[profile.title]][i]);
		let Text = new Canvas.createCanvas(text[1], 11),
			tectx = Text.getContext('2d');
		tectx.drawImage(text[0], 0, 0);
		let data = tectx.getImageData(0, 0, text[1], 11);
		for (let x = 0; x < data.data.length; x += 4)
			data.data[x]	 = Math.round(color.r - ((color.r - 63) / 2)),
			data.data[x + 1] = Math.round(color.g - ((color.g - 63) / 2)),
			data.data[x + 2] = Math.round(color.b - ((color.b - 63) / 2)),
			data.data[x + 3] *= 0.8;
		if (text[1] > [135, 120, 105][i] + h)
			h = text[1] - [135, 120, 105][i];
		tectx.putImageData(data, 0, 0);
		texts.push(Text);
	}

	// Score
	let scores = [];
	for (let y = 0; y < 9; y++) // UPDATE WITH NEW GAMES
	{
		let score;
		if (y < 7) // UPDATE WITH NEW GAMES
			score = profile["elo" + (y + 1)];
		else if (y == 7) // UPDATE WITH NEW GAMES
			score = profile["elo1"] + profile["elo2"] + profile["elo3"] + profile["elo4"] + profile["elo5"] + profile["elo6"] + profile["elo7"];
		else
			score = profile["money"];
		let Score = ' '.repeat(6 - JSON.stringify(score).length) + JSON.stringify(score),
			canvas = new Canvas.createCanvas(47, 9),
			ctx = canvas.getContext('2d');
		for (let x = 0; x < 6; x++) // DO NOT CHANGE WITH ADDITION TO NEW GAMES
			if (Score[x] !== ' ')
				ctx.drawImage(drawText(Score[x])[0], 8 * x - 1, 0);
		let data = ctx.getImageData(0, 0, 47, 9);
		for (let i = 0; i < data.data.length; i += 4)
		{
			data.data[i]	 = Math.round(color.r - ((color.r - 63) / 2)),
			data.data[i + 1] = Math.round(color.g - ((color.g - 63) / 2)),
			data.data[i + 2] = Math.round(color.b - ((color.b - 63) / 2)),
			data.data[i + 3] *= 0.8;
		}
		ctx.putImageData(data, 0, 0);
		scores.push(canvas);
	}

	ctx.drawImage(background, 0, 0, width, height);
	ctx.drawImage(assets[0], 0, 0);
	ctx.drawImage(assets[1], 0, 0);
	for (let i = 0; i < h; i++)
	{
		ctx.drawImage(assets[4], 152 + i, 0);
		ctx.drawImage(assets[5], 152 + i, 0);
	}
	ctx.drawImage(assets[2], 152 + h, 0);
	ctx.drawImage(assets[3], 152 + h, 0);
	for (let i = 0; i < 3; i++)
		ctx.drawImage(texts[i], 47, (i == 1 ? 4 : 3) + (15 * i));
	for (let i = 0; i < 7; i++) // UPDATE WITH NEW GAMES
		ctx.drawImage(scores[i], 103, 64 + (10 * i));
	ctx.drawImage(scores[7], 103, 139); // UPDATE WITH NEW GAMES
	ctx.drawImage(scores[8], 50, 139); // UPDATE WITH NEW GAMES
	ctx.drawImage(assets[6], 4, 49);
	ctx.drawImage(avatar, 2, 2, 43, 43);

	return canvas.toBuffer();
}

exports.drawRight = function(member, profile, avatar, background) {
	let width, height;
	if (background.height > 300 || background.width > 400)
	{
		if (background.height / background.width == 0.75)
			width = 400,
			height = 300;
		if (background.height / background.width <  0.75)
			width = 400,
			height = Math.round(background.height / background.width * 400);
		if (background.height / background.width >  0.75)
			width = Math.round(background.width / background.height * 300),
			height = 300;
	}
	else
		width = background.width,
		height = background.height;

	let canvas = new Canvas.createCanvas(width, height),
		ctx = canvas.getContext('2d'),
		color = new Color(profile.color),
		assets = [];
	for (let img = 0; img < 7; img++)
	{
		let w = [154, 154, 48, 48, 1, 1, 134][img],
			h = [152, 152, 47, 47, 47, 47, 99][img], // UPDATE WITH NEW GAMES (First two and last one)
			image = exports.Images.right[["border", "borderback", "corner", "cornerback", "extend", "extendback", "preText"][img]],
			border = new Canvas.createCanvas(w, h),
			bdrctx = border.getContext('2d');
		bdrctx.drawImage(image, 0, 0);
		let data = bdrctx.getImageData(0, 0, w, h);
		for (let i = 0; i < data.data.length; i += 4)
		{
			let val = img == 6 ? 63 : img % 2 == 0 ? 31 : 223;
			data.data[i]	 = Math.round(color.r - ((color.r - val) / 2)),
			data.data[i + 1] = Math.round(color.g - ((color.g - val) / 2)),
			data.data[i + 2] = Math.round(color.b - ((color.b - val) / 2)),
			data.data[i + 3] *= 0.8;
		}
		bdrctx.putImageData(data, 0, 0);
		assets.push(border);
	}

	// Text
	let h = 0;
	let texts = [];
	for (let i = 0; i < 3; i++)
	{
		text = drawText([member.username + "#" + member.discriminator, member.id, titles[profile.title]][i]);
		let Text = new Canvas.createCanvas(text[1], 11),
			tectx = Text.getContext('2d');
		tectx.drawImage(text[0], 0, 0);
		let data = tectx.getImageData(0, 0, text[1], 11);
		for (let x = 0; x < data.data.length; x += 4)
			data.data[x]	 = Math.round(color.r - ((color.r - 63) / 2)),
			data.data[x + 1] = Math.round(color.g - ((color.g - 63) / 2)),
			data.data[x + 2] = Math.round(color.b - ((color.b - 63) / 2)),
			data.data[x + 3] *= 0.8;
		if (text[1] > [135, 120, 105][i] + h)
			h = text[1] - [135, 120, 105][i];
		tectx.putImageData(data, 0, 0);
		texts.push(Text);
	}

	// Score
	let scores = [];
	for (let y = 0; y < 9; y++) // UPDATE WITH NEW GAMES
	{
		let score;
		if (y < 7) // UPDATE WITH NEW GAMES
			score = profile["elo" + (y + 1)];
		else if (y == 7) // UPDATE WITH NEW GAMES
			score = profile["elo1"] + profile["elo2"] + profile["elo3"] + profile["elo4"] + profile["elo5"] + profile["elo6"] + profile["elo7"];
		else
			score = profile["money"];
		let Score = ' '.repeat(6 - JSON.stringify(score).length) + JSON.stringify(score),
			canvas = new Canvas.createCanvas(47, 9),
			ctx = canvas.getContext('2d');
		for (let x = 0; x < 6; x++) // DO NOT CHANGE WITH ADDITION TO NEW GAMES
			if (Score[x] !== ' ')
				ctx.drawImage(drawText(Score[x])[0], 8 * x - 1, 0);
		let data = ctx.getImageData(0, 0, 47, 9);
		for (let i = 0; i < data.data.length; i += 4)
			data.data[i]	 = Math.round(color.r - ((color.r - 63) / 2)),
			data.data[i + 1] = Math.round(color.g - ((color.g - 63) / 2)),
			data.data[i + 2] = Math.round(color.b - ((color.b - 63) / 2)),
			data.data[i + 3] *= 0.8;
		ctx.putImageData(data, 0, 0);
		scores.push(canvas);
	}

	ctx.drawImage(background, 0, 0, width, height);
	ctx.drawImage(assets[0], width - 154, 0);
	ctx.drawImage(assets[1], width - 154, 0);
	for (let i = 0; i < h; i++)
	{
		ctx.drawImage(assets[4], width - (153 + i), 0);
		ctx.drawImage(assets[5], width - (153 + i), 0);
	}
	ctx.drawImage(assets[2], width - (200 + h), 0);
	ctx.drawImage(assets[3], width - (200 + h), 0);
	for (let i = 0; i < 3; i++)
		ctx.drawImage(texts[i], width - (47 + texts[i].width), (i == 1 ? 4 : 3) + (15 * i));
	for (let i = 0; i < 7; i++) // UPDATE WITH NEW GAMES
		ctx.drawImage(scores[i], width - 51, 64 + (10 * i));
	ctx.drawImage(scores[7], width - 51, 139); // UPDATE WITH NEW GAMES
	ctx.drawImage(scores[8], width - 104, 139); // UPDATE WITH NEW GAMES
	ctx.drawImage(assets[6], width - 150, 49);
	ctx.drawImage(avatar, width - 45, 2, 43, 43);

	return canvas.toBuffer();
}

function drawText(text) {
	let canvasA = new Canvas.createCanvas(64, 132),
		Alphabet = canvasA.getContext("2d")
	Alphabet.drawImage(exports.Images.alphabet, 0, 0);

	let canvasB = new Canvas.createCanvas(335, 11),
		ctx = canvasB.getContext('2d'),
		h = 1;

	for (let i = 0; i < text.length; i++) {
		let a = text.split('')[i];
		if (exports.alphabet.hasOwnProperty(a))
		{
			let A = exports.alphabet[a],
				letter = Alphabet.getImageData(A[0] * 8, A[1] * 11, A[2], 11);
			if (A[3]) h -= 1;
			ctx.putImageData(letter, h, 0);
			h += A[2] + 1;
		}
	}
	return [canvasB, h];
}

exports.Images = {};
exports.Images.left = {};
exports.Images.right = {};
Canvas.loadImage("/app/assets/alphabet/alphabet.png").then(image => {
	exports.Images.alphabet = image;
});
exports.alphabet = require("/app/assets/alphabet/alphabet.json");

// Left
Canvas.loadImage("/app/assets/profile/left/border.png").then(image => {
	exports.Images.left.border = image;
});
Canvas.loadImage("/app/assets/profile/left/borderback.png").then(image => {
	exports.Images.left.borderback = image;
});
Canvas.loadImage("/app/assets/profile/left/corner.png").then(image => {
	exports.Images.left.corner = image;
});
Canvas.loadImage("/app/assets/profile/left/cornerback.png").then(image => {
	exports.Images.left.cornerback = image;
});
Canvas.loadImage("/app/assets/profile/left/extend.png").then(image => {
	exports.Images.left.extend = image;
});
Canvas.loadImage("/app/assets/profile/left/extendback.png").then(image => {
	exports.Images.left.extendback = image;
});
Canvas.loadImage("/app/assets/profile/left/preText.png").then(image => {
	exports.Images.left.preText = image;
});

// Right
Canvas.loadImage("/app/assets/profile/right/border.png").then(image => {
	exports.Images.right.border = image;
});
Canvas.loadImage("/app/assets/profile/right/borderback.png").then(image => {
	exports.Images.right.borderback = image;
});
Canvas.loadImage("/app/assets/profile/right/corner.png").then(image => {
	exports.Images.right.corner = image;
});
Canvas.loadImage("/app/assets/profile/right/cornerback.png").then(image => {
	exports.Images.right.cornerback = image;
});
Canvas.loadImage("/app/assets/profile/right/extend.png").then(image => {
	exports.Images.right.extend = image;
});
Canvas.loadImage("/app/assets/profile/right/extendback.png").then(image => {
	exports.Images.right.extendback = image;
});
Canvas.loadImage("/app/assets/profile/right/preText.png").then(image => {
	exports.Images.right.preText = image;
});