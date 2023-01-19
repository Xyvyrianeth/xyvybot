import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
import { Color } from "../assets/misc/color.js";
import { client } from "../index.js";

export const command = async (interaction) => {
	if (interaction.options._subcommand == "help")
	{
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/graph.png", name: "author.png" };
		const embed = {
			author: { name: "How to use /graph", icon_url: "attachment://author.png" },
			description: "[Click here to go to the Wiki (github.com)](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/x!graph)",
			color: new Color().random().toInt() };

		return interaction.reply({ embeds: [embed], files: [author], ephemeral: true });
	}

	const customEmoji = client.channels.cache.get(interaction.channelId).permissionsFor(client.user.id).has(1n << 18n);
	const loadingAuthor = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/graph.png", name: "author.png" };
	const loadingEmbed = {
		author: { name: "Profile", icon_url: "attachment://author.png" },
		description: `Generating graph ${customEmoji ? "<a:loading:1010988190250848276>" : ":hourglass:"}`,
		color: new Color().random().toInt() };
	await interaction.reply({ embeds: [loadingEmbed], files: [loadingAuthor] });

	const canvas = new createCanvas(299, 299);
	const ctx = canvas.getContext('2d');
	const blankGraphImage = await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/misc/blankGraph.png");
	const equations = interaction.options._hoistedOptions.map(option => option.value.replace(/ /g, ''));
	const defaultColors = ["#ff0000", "#ff7f00", "#fefe33", "#90EE90", "#008000", "#0d98ba", "#0000ff", "#a020f0", "#964b00", "#ffc0cb"];
	ctx.drawImage(blankGraphImage, 0, 0);
	ctx.translate(149.5, 149.5);

	const display = [];
	const functions = {};

	for (let i = 0; i < equations.length; i++)
	{
		const ic = equations[i].split(';');
		let color = defaultColors[i % 10];
		let y = ic[0];

		if (ic.length == 2)
		{
			if (/#([0-9a-f]{6,}|[0-9a-f]{3,})/.test(ic[1].toLowerCase()))
			{
				color = ic[1].toLowerCase();
			}

			if (/^(red|orange|yellow|lime|green|teal|blue|purple|brown|pink|black|gr[ae]y)$/i.test(ic[1]))
			{
				color = {
					"red": "#ff0000",
					"orange": "#ff7f00",
					"yellow": "#fefe33",
					"lime": "bfff00",
					"green": "#008000",
					"teal": "#008080",
					"blue": "#0000ff",
					"purple": "#a020f0",
					"brown": "#964b00",
					"pink": "#ffc0cb",
					"black": "#000000",
					"grey": "#888888",
					"gray": "#888888" }[ic[1].toLowerCase()];
			}

			if (ic[1].toLowerCase() == "hidden")
			{
				color = "hidden";
			}
		}

		let egl = y.match(/^(y|[a-df-wz]\(x\))(=|>=|>|__>__|≥|<=|<|__<__|≤)/);
		let yf;

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

		let result;

		if (/(?<!infinit)y/.test(y))
		{
			result = "Output (*y*) must remain isolated in all equations.";
		}
		else
		{
			if (color == "hidden")
			{
				result = [false, "Hidden"];

				if (/^[a-zA-Z]\(x\)$/.test(yf))
				{
					functions[yf[0]] = y;
				}
			}
			else
			{
				result = [];

				if (/^[a-zA-Z]\(x\)$/.test(yf))
				{
					functions[yf[0]] = y;
				}

				for (let x = -3000; x <= 3000; x++)
				{
					const xCoord = x / 20;
					const value = Math.calculate(y, xCoord, functions);

					if (value[0] == "err")
					{
						result = [false, value[1]];
						break;
					}
					else
					{
						const xValue = value[1] > 160 ? 160 : value[1] < -160 ? -160 : value[1];
						result.push([xCoord, xValue]);
					}
				}
			}
			if (result[0] === false)
			{
				display.push(yf + ' ' + ['=', '≤', '≥', '<', '>'][egl] + ' ' + y + '  -  ' + result[1]);
			}
			else
			{
				display.push(yf + ' ' + ['=', '≤', '≥', '<', '>'][egl] + ' ' + y + '  -  ' + (new Color(color).getName()));

				for (let i = 0; i < result.length; i++)
				{
					const XY = result[i];
					const c = new Color(color);

					if (XY[1] == NaN || XY[1] == Infinity)
					{
						continue;
					}

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
						ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.04)`;
						ctx.beginPath();
						ctx.moveTo(XY[0], -XY[1]);
						ctx.lineTo(XY[0], [-155, 155][egl % 2]);
						ctx.stroke();
					}
				}
			}
		}
	}

	const text = "Equation" + (display.length > 1 ? 's' : '') + ":\n" + display.join('\n');
	const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/graph.png", name: "author.png" };
	const Graph = { attachment: canvas.toBuffer(), name: "graph.png" };
	const embed = {
		author: { name: "x!graph | [Wiki]", icon_url: "attachment://author.png", url: "https://github.com/Xyvyrianeth/xyvybot_assets/wiki/x!graph" },
		description: "```\n" + text.replace(/\\/g, '') + "```",
		image: { url: "attachment://graph.png" },
		color: new Color().random().toInt() };

	return interaction.editReply({ embeds: [embed], files: [author, Graph] });
};