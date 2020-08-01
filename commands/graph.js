const Discord = require("discord.js");
const Canvas = require("canvas");
var { Color } = require("/app/assets/misc/color.js"),
	{ equ } = require("/app/assets/misc/equ.js"),
	graph;
exports.command = (cmd, args, input, message) => {
	if (["info", "about", "help"].includes(args[0])) {
		return message.channel.send(
			new Discord.MessageEmbed()
				.setTitle("How to use x!graph")
				.setThumbnail("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png")
				.setDescription("[Click here to go to the Wiki (github.com)](https://github.com/Xyvyrianeth/xyvybot/wiki/x!graph)")
				.setColor(new Color().random()));
	}
	else
	{
		// Draw blank graph
		canvas = new Canvas.createCanvas(299, 299);
		ctx = canvas.getContext('2d');
		ctx.drawImage(graph, 0, 0);
		ctx.translate(149.5, 149.5);
		e = input.toLowerCase().replace(/ /g, "").split('\n').filter(x => x != '');
		input = input.split('\n');
		colors = ["#ff0000", "#ff7f00", "#fefe33", "#90EE90", "#008000", "#0d98ba", "#0000ff", "#a020f0", "#964b00", "#ffc0cb"];
		if (/;$/.test(input))
			e.pop();
		let display = [],
			equations = {},
			a = true;

		for (let i = 0; i < e.length; i++)
		{
			// decide color
			let ic = e[i].split(';'),
				color = colors[i % 10],
				y = ic[0];
			if (a) console.log(y);
			if (ic.length == 2)
			{
				if (/#([0-9a-f]{6,}|[0-9a-f]{3,})/.test(ic[1].toLowerCase()))
					color = ic[1].toLowerCase();
				if (/^(red|orange|yellow|lime|green|teal|blue|purple|brown|pink)$/i.test(ic[1]))
					color = {
						"red": "#ff0000",
						"orange": "#ff7F00",
						"yellow": "#fefe33",
						"lime": "90EE90",
						"green": "#008000",
						"teal": "#0d98ba",
						"blue": "#0000ff",
						"purple": "#a020f0",
						"brown": "#964b00",
						"pink": "#ffc0cb"
					}[ic[1].toLowerCase()];
			}
			let egl = y.match(/^(y|[a-zA-Z]\(x\))(=|>=|>|__>__|≥|<=|<|__<__|≤)/),
				yf;
			if (egl != null)
			{
				yf = egl[1];
				y = y.replace(egl[0], '');
				switch (egl[2])
				{
					// =
					default:		egl = 0; break;
					case '=':		egl = 0; break;
					// ≤
					case '≤':		egl = 1; break;
					case '<='	 :	egl = 1; break;
					case '__<__':	egl = 1; break;
					// ≥
					case '≥':		egl = 2; break;
					case '>='	 :	egl = 2; break;
					case '__>__':	egl = 2; break;
					// <
					case '<':		egl = 3; break;
					// >
					case '>':		egl = 4; break;
				}
			}
			else
			{
				egl = 0;
				yf = "y";
			}

			// start graphing
			let canEquate = true,
				result;

			if (/(?<!infinit)y/.test(y))
				canEquate = false,
				result = "Output (*y*) must remain isolated in all equations.";
			else
			{
				result = [];
				for (let x = -150; x <= 150; x += 0.5)
				{
					let Y = equ(y, x, a, equations);
					if (Y[0] == "err")
					{
						result = [false, Y[1]];
						break;
					}
					else
					{
						if (/^[a-zA-Z]\(x\)$/.test(yf))
						{
							equations[yf[0]] = y;
						}
						X = Y[1] > 160 ? 160 : Y[1] < -160 ? -160 : Y[1];
						result.push([x, X]);
					}
				}
				if (result[0] === false)
					display.push(yf + ' ' + ['=', '≤', '≥', '<', '>'][egl] + ' ' + y + '  -  ' + result[1]);
				else
				{
					display.push(yf + ' ' + ['=', '≤', '≥', '<', '>'][egl] + ' ' + y + '  -  ' + (new Color(color).getName()));
					for (let i = 0; i < result.length; i++)
					{
						XY = result[i];
						let c = new Color(color);
						if (XY[1] == NaN || XY[1] == Infinity)
							continue;
						if (egl < 3)
						{
							ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},1)`;
							ctx.beginPath();
							ctx.moveTo(XY[0], -XY[1]);
							ctx.arc(XY[0], -XY[1], 0.75, 0, Math.PI * 2);
							ctx.stroke();
						}
						if (egl > 0)
						{
							ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.4)`;
							ctx.beginPath();
							ctx.moveTo(XY[0], -XY[1]);
							ctx.lineTo(XY[0], [-155, 155][egl % 2]);
							ctx.stroke();
						}
					}
				}
			}
		}
		console.log(equations);
		let text = "Equation" + (display.length > 1 ? 's' : '') + ":\n" + display.join('\n');
		return message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("x!graph | [Wiki]", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png", "https://github.com/Xyvyrianeth/xyvybot/wiki/x!graph")
				.setDescription("```\n" + text.replace(/\\/g, '') + "```")
				.attachFiles(new Discord.MessageAttachment(canvas.toBuffer(), "graph.png"))
				.setImage("attachment://graph.png")
				.setColor(new Color().random()));
	}
};
Canvas.loadImage("/app/assets/misc/graph.png").then(image => {
	graph = image;
});