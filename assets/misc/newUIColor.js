"use strict";

import pkg from 'canvas';
const { createCanvas } = pkg;

export function newUIColor(image) {
	const { width, height } = image;
	const canvas = new createCanvas(width, height);
	const CTX = canvas.getContext('2d');
	const color = { r: 0, g: 0, b: 0 };
	const pixels = [];

	CTX.drawImage(image, 0, 0, width, height);
	const colorData = CTX.getImageData(0, 0, width, height);
	for (let i = 0; i < colorData.data.length; i += 4)
	{
		const [r, g, b] = [colorData.data[i], colorData.data[i + 1], colorData.data[i + 2]];
		if (!(r < 64 && g < 64 && b < 64) && !(r > 192 && g > 192 && b > 192))
		{
			pixels.push({ r: r, g: g, b: b });
		}
	}
	pixels.sort((a, b) => a.r - b.r == 0 ? a.g - b.g == 0 ? a.b - b.b : a.g - b.g : a.r - b.r);
	const current = { r: 0, g: 0, b: 0, t: 0 };
	const colors = [];
	pixels.forEach(pixel => {
		if (current.r == pixel.r && current.g == pixel.g && current.b == pixel.b)
		{
			current.t++;
		}
		else
		{
			colors.push(JSON.parse(JSON.stringify(current)));
			current.r = pixel.r;
			current.g = pixel.g;
			current.b = pixel.b;
			current.t = 1;
		}
	});
	colors.sort((a, b) => b.t - a.t);
	colors.splice(0, 256).forEach(c => {
		color.r += c.r;
		color.g += c.g;
		color.b += c.b;
	});
	color.r = color.r / 256 | 0;
	color.g = color.g / 256 | 0;
	color.b = color.b / 256 | 0;
	return color;
}