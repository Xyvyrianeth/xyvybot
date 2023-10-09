import { miniGames } from "../../games/miniGames.js";
import { Color } from "../../assets/misc/color.js";

export const command = (interaction) => {
	if (miniGames.some((miniGame) => miniGame.channel == interaction.channelId && miniGame.type == "iq"))
	{
		return;
	}

	let a, b, c, d, equ, answer, type, question, end, time, difference;
	switch (Math.random() * 9 | 0)
	{
		case 0:
		{
			type = "Which letter appears twice?";
			a = [];

			for (let i = 0; i < 18; i++)
			{
				b = (Math.random() * 26 + 10 | 0).toString(36).toUpperCase();

				if (a.includes(b))
				{
					i--;
				}
				else
				{
					a.push(b);
				}
			}

			a = a.shuffle();

			do
			{
				b = (Math.random() * 26 + 10 | 0).toString(36).toUpperCase();
				if (a.includes(b))
				{
					b = false;
				}
			}
			while (b == false);

			answer = b;
			c = Math.random() * 18 | 0;

			do
			{
				d = Math.random() * 18 | 0;
			}
			while (Math.abs(c - d) < 7);

			a.splice(c, 0, b);
			a.splice(d, 0, b);
			question = "`" + a.join("` `") + "`";
			end = question + "\nAnswer: **" + answer + "** appears twice!";
			time = 20;
			difference = '';
			break;
		}
		case 1:
		{
			type = "Which digit is missing?";
			a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
			b = Math.random() * 10 | 0;
			answer = a[b];
			a.splice(b, 1);
			question = "`" + a.shuffle().join("` `") + "`";
			end = question + "\nAnswer: **" + answer + "** is missing!";
			time = 20;
			difference = '';
			break;
		}
		case 2:
		{
			type = "What is the next number in the pattern?";
			a = (Math.random() * 200 + 1 | 0) * [1, -1].random();
			b = (Math.random() * 25  + 5 | 0) * [1, -1].random();
			equ = [a];
			for (let i = 0; i <= 2; i++)
			{
				a += b;
				if (i == 2) answer = a;
				else equ.push(a);
			}
			question = equ.join(", ") + ", __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
			end = equ.join(", ") + ", **__" + answer + "__**";
			difference = "\nDifficulty: **Easy**";
			time = 20;
			break;
		}
		case 3:
		{
			type = "What is the next number in the pattern?";
			a = (Math.random() * 20 + 1 | 0) * [1, -1].random();
			b = (Math.random() * 4  + 2 | 0) * [1, -1].random();
			equ = [a];
			for (let i = 0; i <= 2; i++)
			{
				a *= b;
				if (i == 2) answer = a;
				else equ.push(a);
			}
			question = equ.join(", ") + ", __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
			end = equ.join(", ") + ", **__" + answer + "__**";
			difference = "\nDifficulty: **Medium**";
			time = 30;
			break;
		}
		case 4:
		{
			type = "What is the next number in the pattern?";
			a = (Math.random() * 20 + 1 | 0) * [1, -1].random();
			b = (Math.random() * 20 + 1 | 0) * [1, -1].random();
			c = (Math.random() * 20 + 1 | 0) * [1, -1].random();
			equ = [a];
			for (let i = 0; i <= 2; i++)
			{
				b += c;
				a += b;
				if (i == 2)
				{
					answer = a;
				}
				else
				{
					equ.push(a);
				}
			}
			question = equ.join(", ") + ", __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
			end = equ.join(", ") + ", **__" + answer + "__**";
			difference = "\nDifficulty: **Hard**";
			time = 40;
			break;
		}
		case 5:
		{
			type = "What is the next number in the pattern?";
			a = (Math.random() * 20 + 1 | 0) * [1, -1].random();
			b = (Math.random() * 20 + 1 | 0) * [1, -1].random();
			c = (Math.random() * 20 + 1 | 0) * [1, -1].random();
			equ = [];
			answer = a;
			for (let i = 0; i <= 2; i++)
			{
				b += c;
				a += b;
				equ.unshift(a);
			}
			question = equ.join(", ") + ", __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
			end = equ.join(", ") + ", **__" + answer + "__**";
			difference = "\nDifficulty: **Hard**";
			time = 45;
			break;
		}
		case 6:
		{
			type = "Solve this:";
			a = (Math.random() * 500 + 1 | 0) * [1, -1].random();
			b = Math.random() * 500 + 1 | 0;
			c = [1, -1].random();
			answer = a + (b * c);
			question = "**" + a + "** " + (c == 1 ? "+" : "-") + " **" + b + "** = __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
			end = "**" + a + "** " + (c == 1 ? "+" : "-") + " **" + b + "** = **__" + answer + "__**!";
			difference = "\nDifficulty: **Easy**";
			time = 15;
			break;
		}
		case 7:
		{
			type = "Solve this:";
			a = (Math.random() * 100 + 1 | 0) * [1, -1].random();
			b = (Math.random() * 100 + 1 | 0) * [1, -1].random();
			answer = a * b;
			question = "**" + a + "** × **" + b + "** = __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
			end = "**" + a + "** × **" + b + "** = **__" + answer + "__**!";
			difference = "\nDifficulty: **Medium**";
			time = 35;
			break;
		}
		case 8:
		{
			type = "Solve this:";
			a = (Math.random() * 20 + 5 | 0) * [1, -1].random();
			b = (Math.random() * 20 + 5 | 0) * [1, -1].random();
			answer = a;
			question = "**" + (a * b) + "** ÷ **" + b + "** = __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__" ;
			end = "**" + (a * b) + "** + **" + b + "** = **__" + answer + "__**!";
			difference = "\nDifficulty: **Hard**";
			time = 45;
			break;
		}
	}

	const miniGame = {
		id: interaction.id,
		type: "iq",
		answer: String(answer),
		end: end,
		timer: time,
		sTime: time,
		channelId: interaction.channelId };
	miniGames.set(interaction.id, miniGame);

	const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/iq.png", name: "author.png" };
	const embed = {
		author: { name: "iq", icon_url: "attachment://author.png" },
		color: new Color(176, 14, 223).toInt(),
		fields: [ { name: type, value: `${question}${difference}\n\nTime's up <t:${(Date.now() / 1000 | 0) + time}:R>`} ] };

	if (interaction.isCommand())
	{
		interaction.reply({ embeds: [embed], files: [author] });
	}
	else
	{
		const newActionRow = {
			type: 1,
			components: [
			{	type: 2,
				style: 3,
				label: "TRY ANOTHER",
				customId: "iq",
				disabled: true } ] };
		interaction.update({ embeds: interaction.message.embeds, components: [newActionRow], attachments: [] });
		interaction.channel.send({ embeds: [embed], files: [author] });
	}
};