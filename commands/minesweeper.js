const Discord = require("discord.js");
exports.command =  (cmd, args, input, message) => {
	let w, h, d;
	if (["help"].includes(input))
	{
		return message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("MineSweeper", exports.Images.minesweeper)
				.setDescription(
					"You can control 3 aspects of a game: height, width, and the number of bombs. Here are the 3 possible syntaxes:\n" +
					"```md\n" +
					"x!minesweeper [width] [height] [bombs]\n" +
					"x!minesweeper [width] [height]\n" +
					"x!minesweeper [bombs]\n" +
					"```\n" +
					"The maximum height you can set a game to is 20.\n" +
					"The maximum width you can set a game to is 16, but may have to be lower depending on the height (max number of total tiles is 198).\n" +
					"The maximum number of bombs depends on the number of tiles total (height * width). You can also set the number of bombs with a % instead of an exact number, OR you can use a preset difficulty (type `x!ms diff` to get a list).")
				.addField(
					"Examples",
					"```js\n" +
					"`x!minesweeper 11 18 50`\n" +
					"   // 11x18 board with 50 bombs\n" +
					"`x!minesweeper 30`\n" +
					"   // 10x10 board with 30 bombs\n" +
					"`x!minesweeper 12 12`\n" +
					"   // 12x12 board with 14 bombs\n" +
					"`x!minesweeper 10 15 30%`\n" +
					"   // 10x15 board with 45 bombs\n" +
					"`x!minesweeper 14 14 hard`\n" +
					"   // 14x14 board with 39 bombs\n" +
					"```")
				.setTitle("Help")
				.setColor(new Color().random()));
	}
	else
	if (["diff", "difficulty", "difficulties"].includes(input))
	{
		return message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("MineSweeper", exports.Images.minesweeper)
				.addField("5%", "`novice`\n`beginner`")
				.addField("10%", "`easy`\n`apprentice`")
				.addField("15%", "`medium`\n`normal`\n`adept`")
				.addField("20%", "`hard`\n`expert`")
				.addField("25%", "`legendary`\n`master`")
				.setTitle("Difficulties")
				.setColor(new Color().random())); g
	}
	else
	{
		h = !input || args.length == 1 || args.length > 3 ?
				10 :
			!/^[1-9][0-9]*$/.test(args[1]) ?
				10 :
			Number(args[1]) > 20 ?
				20 :
			Number(args[1]);
		w = !input || args.length == 1 || args.length > 3 ?
				10 :
			!/^[1-9][0-9]*$/.test(args[0]) ?
				10 :
			Number(args[0]) * h > 198 ?
				Math.floor(198 / h) > 16 ?
					16 :
				Math.floor(198 / h) :
			Number(args[0]) > 16 ?
				16 :
			Number(args[0]);
		wh = w * h;
		D = args.length == 1 || args.length > 3 ?
				args[1] :
			args.length == 3 ?
				args[2] :
			"easy";
		d = !input ?
				10 :
			args.length == 2 ?
				Math.round(wh * 0.1) :
			/^[1-9][0-9]*%?$/.test(D) ?
				/%/.test(D) ?
					Number(D.substring(0, D.length - 1)) > 100 ?
						wh :
					Math.round(wh * (Number(D.substring(0, D.length - 1)) / 100)) :
				Number(D) > wh ?
					wh :
				Number(D) :
			"novice beginner easy apprentice medium normal adept hard expert legendary master".split(' ').includes(D) ?
				Math.round(wh * {
					"novice": 0.05,
					"beginner": 0.05,
					"easy": 0.1,
					"apprentice": 0.1,
					"medium": 0.15,
					"normal": 0.15,
					"adept": 0.15,
					"hard": 0.2,
					"expert": 0.2,
					"legendary": 0.25,
					"master": 0.25
				}[D]) :
			Math.round(wh * 0.1);
		a = [];
		for (let y = h; y--;)
		{
			let b = [];
			for (let x = w; x--;)
				b.push(0);
			a.push(b);
		}
		k = [];
		do
		{
			let x = Math.random() * w | 0;
			let y = Math.random() * h | 0;
			if (typeof a[y][x] == "number")
				a[y][x] = "💥", k.push([y, x]);
		}
		while (k.length < d);
		for (let b = d; b--;)
		{
			y = k[b][0], x = k[b][1], z = [true, true, true, true, true, true, true, true];
			if (y == 0)
				z[0] = z[1] = z[2] = false;
			if (y == h - 1)
				z[4] = z[5] = z[6] = false;
			if (x == 0)
				z[0] = z[7] = z[6] = false;
			if (x == w - 1)
				z[2] = z[3] = z[4] = false;
			for (let xy = 8; xy--;)
				if (z[xy])
				{
					Y = y + [-1, -1, -1, 0, 1, 1, 1, 0][xy], X = x + [-1, 0, 1, 1, 1, 0, -1, -1][xy];
					if (typeof a[Y][X] == "number")
						a[Y][X] += 1;
				}
		}
		for (let y = h; y--;)
			for (let x = w; x--;)
				if (typeof a[y][x] == "number")
					a[y][x] = "0⃣ 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣".split(' ')[a[y][x]];
		for (let y = h; y--;)
			a[y] = a[y].join("||||");
		let embed = new Discord.MessageEmbed()
			.setAuthor("MineSweeper", exports.Images.minesweeper)
			.setDescription("||" + a.join("||\n||") + "||")
			.setFooter("Height: " + h + " | Width: " + w + " | Bombs: " + d)
			.setColor(new Color().random());
		message.channel.send(embed);
	}
}