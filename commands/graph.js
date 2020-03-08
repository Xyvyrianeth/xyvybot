const Discord = require("discord.js");
var { Color } = require("/app/assets/misc/color.js");
var { equ } = require("/app/assets/misc/equ.js");
exports.command = (cmd, args, input, message) => {
	if (["info", "about", "history"].includes(args[0])) {
		return message.channel.send(
			new Discord.MessageEmbed()
				.setTitle("Brief History of the Xyvyrianethian Graphic Calculator")
				.setAuthor("By Xyvyrianeth", exports.Images.avatar)
				.setDescription(
					"Okay, well, I made this simply because I had nothing better to do with my time. When I started, it was 100% text-drawn, " +
					"and it was really cool because I could add a lot of features to it when it didn't have to be accurate. Then I moved to " +
					"Node Canvas and had to start over. I'm still not anywhere near the level of Desmos, but I'm proud of myself with what " +
					"I have.\n" +
					"\n" +
					"In order to have a more advanced calculator, there needs to be a more strict syntax. I had to change a lot of things in " +
					"the old syntax just to enable something simple like square root, cube root, or n-root of x, and I'll have to change even " +
					"more if I want to add something like Π and ∑. I also had to change the method it uses to calculate almost entirely: instead " +
					"of it trying to do everything at once, it has to solve it step by step. It has its own order of operation it has to follow.\n" +
					"\n" +
					"I'm constantly refining it little by little, and soon it'll be something. Maybe not great, but something.")
				.addField("Full Cheat Sheet:", "https://github.com/Xyvyrianeth/xyvybot/wiki/x!graph")
				.setColor(new Color().random()));
	}
	else
	{
		// Draw blank graph
		canvas = new Canvas.createCanvas(301, 301);
		ctx = canvas.getContext('2d');
		ctx.drawImage(exports.Images.graph, 0, 0);
		ctx.translate(150.5, 150.5);
		e = input.toLowerCase().replace(/ /g, "").split('\n').filter(x => x != '');
		input = input.split('\n');
		colors = ["#ff0000", "#ff7f00", "#fefe33", "#90EE90", "#008000", "#0d98ba", "#0000ff", "#a020f0", "#964b00", "#ffc0cb"];
		if (/;$/.test(input))
			e.pop();
		if (e.length > colors.length)
			return message.channel.send("`Too many equations!`");
		let display = [];

		for (let i = 0; i < e.length; i++)
		{
			// decide color
			let ic = e[i].split(';'),
				color = colors[i],
				y = ic[0];
			if (ic.length == 2)
			{
				if (/#([0-9a-f]{6,}|[0-9a-f]{3,})/.test(ic[1].toLowerCase()))
					color = ic[1].toLowerCase();
				if (/^(red|orange|yellow|(?:light||blue)green|blue|purple|brown|pink)$/i.test(ic[1]))
					color = {
						"red": "#ff0000",
						"orange": "#ff7F00",
						"yellow": "#fefe33",
						"lightgreen": "90EE90",
						"green": "#008000",
						"bluegreen": "#0d98ba",
						"blue": "#0000ff",
						"purple": "#a020f0",
						"brown": "#964b00",
						"pink": "#ffc0cb"
					}[ic[1].toLowerCase()];
			}
			let egl = y.match(/^y(?:=|>|>=|__>__|≥|<|<=|__<__|≤)/);
			if (egl != null)
				switch (egl[0])
				{
					default:       egl = 0; break;
					case 'y=':     egl = 0; break;
					case 'y≤':     egl = 1; break;
					case 'y<=':    egl = 1; break;
					case 'y__<__': egl = 1; break;
					case 'y≥':     egl = 2; break;
					case 'y>=':    egl = 2; break;
					case 'y__>__': egl = 2; break;
					case 'y<':     egl = 3; break;
					case 'y>':     egl = 4; break;
				}
			else
				egl = 0;

			y = y.replace(/^y(?:=|>|>=|__>__|≥|<|<=|__<__|≤)/, '');

			// start graphing
			let canEquate = true,
				result;

			if (y.includes('y') && !y.includes("infinity"))
				canEquate = false,
				result = "Output (*y*) must remain isolated in all equations.";
			else
			{
				result = [];
				for (let x = -150; x <= 150; x += 0.5)
				{
					let Y = equ(y, x);
					if (Y[0] == "err")
					{
						result = [false, Y[1]];
						break;
					}
					else
					{
						X = Math.abs(Y[1]) > 160 ? 160 : Y[1];
						result.push([x, X]);
					}
				}
				if (result[0] === false)
					display.push('y ' + ['=', '≤', '≥', '<', '>'][egl] + ' ' + y + '  -  ' + result[1]);
				else
				{
					display.push('y ' + ['=', '≤', '≥', '<', '>'][egl] + ' ' + y + '  -  ' + (new Color(color).getName()));
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
		let text = "Equation" + (display.length > 1 ? 's' : '') + ":\n" + display.join('\n');
		return message.channel.send(
			new Discord.MessageEmbed()
				.setTitle("x!graph")
				.setDescription("```\n" + text + "```")
				.attachFiles(new Discord.MessageAttachment(canvas.toBuffer(), "graph.png"))
				.setImage("attachment://graph.png")
				.setColor(new Color().random()));
	}
};