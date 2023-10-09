import Canvas from "canvas";
const { createCanvas, loadImage } = Canvas;

export const drawText = async function(text, monospace, doItBig) {
	const typeface = await loadImage("./assets/drawText/alphabet.png");
	const alphabet = (await import("./alphabet.json", { assert: { type: "json" } })).default;

	if (monospace)
	{
		const trueCanvas = new createCanvas(text.length * 8, 11);
		const trueContext = trueCanvas.getContext("2d");
		for (let x = 0; x < text.length; x++)
		{
			if (text[x] !== " ")
			{
				const drawnText = await drawText(text[x]);
				trueContext.drawImage(drawnText, 8 * x + ("1.".includes(text[x]) ? 2 : 0), 0);
			}
		}

		return trueCanvas;
	}

	// ABCDEFGHIJKLMNOPQRSTUVWXYZ01234—–-abcdefghijklmnopqrstuvwxyz56789_!?.,:;/\\()[]{}|~+×@#$%^&*÷=\"'<>`¡¿€£¥°•≠≈¢™✓¶∆ΩπΠμ
	const kerning = {
		pre: {
			'T': "—–-abceghkmnopqrsuvwxyz_.,πμ",
			'j': "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234—–-abcdefghijklmnopqrstuvwxyz56789∆ΩπΠμ",
			',': "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234—–-abcdefghijklmnopqrstuvwxyz56789∆ΩπΠμ",
			';': "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234—–-abcdefghijklmnopqrstuvwxyz56789∆ΩπΠμ",
			"'": ".,",
			'"': ".,",
			'™': "Labceghkmnopqrstuvwxyz.,"
		},
		post: {
			'T': "—–-acdegmnopqrsuvwxyz_.,πμ",
			'f': "Jacdegijmnopqrsuvwxyz?.,:∆πμ",
			't': "™",
			'.': "\"'",
			',': "\"'",
			'✓': "Jacdegijmnopqrsuvwxyz?.,:/~+@#^÷<`¿€£•≈¢™✓∆πμ"
		}
	};
	const spriteCanvas = new createCanvas(64, 165);
	const spriteContext = spriteCanvas.getContext("2d");
	spriteContext.drawImage(typeface, 0, 0);

	let trueWidth = -1;
	text.split('').forEach((letter, index) => {
		if (alphabet.hasOwnProperty(letter))
		{
			const letterData = alphabet[letter];
			const lastLetter = index > 0 ? text[index - 1] : false;
			const nextLetter = index < text.length ? text[index + 1] : false;
			trueWidth -= (lastLetter && kerning.pre.hasOwnProperty(letter) && kerning.pre[letter].includes(lastLetter)) ? 1 : 0;
			trueWidth -= (nextLetter && kerning.post.hasOwnProperty(letter) && kerning.post[letter].includes(nextLetter)) ? 1 : 0;
			trueWidth += letterData[2] + 1;
		}
	});

	const trueCanvas = new createCanvas(trueWidth, 11);
	const trueContext = trueCanvas.getContext('2d');

	let width = 0;
	text.split('').forEach((letter, index) => {
		if (alphabet.hasOwnProperty(letter))
		{
			const letterData = alphabet[letter];
			const lastLetter = index > 0 ? text[index - 1] : false;
			const nextLetter = index < text.length ? text[index + 1] : false;
			const glyph = spriteContext.getImageData(letterData[0] * 8, letterData[1] * 11, letterData[2], 11);
			const letterCanvas = createCanvas(letterData[2], 11);
			const letterContext = letterCanvas.getContext('2d');
			letterContext.putImageData(glyph, 0, 0);
			width -= (lastLetter && kerning.pre.hasOwnProperty(letter) && kerning.pre[letter].includes(lastLetter)) ? 1 : 0;
			trueContext.drawImage(letterCanvas, width, 0);
			width -= (nextLetter && kerning.post.hasOwnProperty(letter) && kerning.post[letter].includes(nextLetter)) ? 1 : 0;
			width += letterData[2] + 1;
		}
	});

	if (doItBig)
	{
		const bigCanvas = new createCanvas(trueWidth * 10, 110);
		const bigContext = bigCanvas.getContext('2d');
		bigContext.imageSmoothingEnabled = false;
		bigContext.drawImage(trueCanvas, 0, 0, trueWidth * 10, 110);

		return bigCanvas;
	}

	return trueCanvas;
}