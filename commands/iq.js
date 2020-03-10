const Discord = require("discord.js");
var { Color } = require("/app/assets/misc/color.js"),
	{ games } = require("/app/Xyvy.js");
exports.command = (cmd, args, input, message) => {
	if (games.minigames.some((minigame) => minigame.channel == message.channel.id)) return;
	let a, b, c, d, ans, type, que, end, time, diff;
	let A = Math.random() * 9 | 0;
	switch (A) {
		case 0:
			{
				type = "Which letter appears twice?";
				a = [];
				for (let i = 0; i < 18; i++)
				{
					b = (Math.random() * 26 + 10 | 0).toString(36).toUpperCase();
					if (a.includes(b)) i--;
					else a.push(b);
				}
				a = a.shuffle();
				do {
					b = (Math.random() * 26 + 10 | 0).toString(36).toUpperCase();
					if (a.includes(b)) b = false;
				} while (b == false);
				ans = b;
				c = Math.random() * 18 | 0;
				do {
					d = Math.random() * 18 | 0;
				} while (Math.abs(c - d) < 7);
				a.splice(c, 0, b);
				a.splice(d, 0, b);
				que = "`" + a.join("` `") + "`";
				end = que + "\nAnswer: **" + ans + "** appears twice!";
				time = 20;
				diff = '';
				break;
			}
		case 1:
			{
				type = "Which digit is missing?";
				a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
				b = Math.random() * 10 | 0;
				ans = a[b];
				a.splice(b, 1);
				que = "`" + a.shuffle().join("` `") + "`";
				end = que + "\nAnswer: **" + ans + "** is missing!";
				time = 20;
				diff = '';
				break;
			}
		case 2:
			{
				type = "What is the next number in the pattern?";
				b = (Math.random() * 200 + 1 | 0) * [1, -1].random();
				c = (Math.random() * 25  + 5 | 0) * [1, -1].random();
				let equ = [b];
				for (let i = 0; i <= 2; i++)
				{
					b += c;
					if (i == 2) ans = b;
					else equ.push(b);
				}
				que = equ.join(", ") + ", __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
				end = equ.join(", ") + ", **__" + ans + "__**";
				diff = "\nDifficulty: **Easy**";
				time = 20;
				break;
			}
		case 3:
			{
				type = "What is the next number in the pattern?";
				a = Math.random() * 3 | 0;
				b = (Math.random() * 20 + 1 | 0) * [1, -1].random();
				c = (Math.random() * 4  + 2 | 0) * [1, -1].random();
				let equ = [b];
				for (let i = 0; i <= 2; i++)
				{
					b *= c;
					if (i == 2) ans = b;
					else equ.push(b);
				}
				que = equ.join(", ") + ", __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
				end = equ.join(", ") + ", **__" + ans + "__**";
				diff = "\nDifficulty: **Medium**";
				time = 30;
				break;
			}
		case 4:
			{
				type = "What is the next number in the pattern?";
				a = Math.random() * 3 | 0;
				b = (Math.random() * 20 + 1 | 0) * [1, -1].random();
				c = (Math.random() * 20 + 1 | 0) * [1, -1].random();
				d = (Math.random() * 20 + 1 | 0) * [1, -1].random();
				let equ = [b];
				for (let i = 0; i <= 2; i++)
				{
					c += d;
					b += c;
					if (i == 2) ans = b;
					else equ.push(b);
				}
				que = equ.join(", ") + ", __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
				end = equ.join(", ") + ", **__" + ans + "__**";
				diff = "\nDifficulty: **Hard**";
				time = 40;
				break;
			}
		case 5:
			{
				type = "What is the next number in the pattern?";
				a = Math.random() * 3 | 0;
				b = (Math.random() * 20 + 1 | 0) * [1, -1].random();
				c = (Math.random() * 20 + 1 | 0) * [1, -1].random();
				d = (Math.random() * 20 + 1 | 0) * [1, -1].random();
				let equ = [];
				ans = b;
				for (let i = 0; i <= 2; i++)
				{
					c += d;
					b += c;
					equ.unshift(b);
				}
				que = equ.join(", ") + ", __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
				end = equ.join(", ") + ", **__" + ans + "__**";
				diff = "\nDifficulty: **Hard**";
				time = 45;
				break;
			}
		case 6:
			{
				type = "Solve this:";
				a = Math.random() * 4 | 0;
				b = (Math.random() * 500 + 1 | 0) * [1, -1].random();
				c = Math.random() * 500 + 1 | 0;
				d = [1, -1].random();
				ans = b + (c * d);
				que = "**" + b + "** " + (d == 1 ? "+" : "-") + " **" + c + "** = __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
				end = "**" + b + "** " + (d == 1 ? "+" : "-") + " **" + c + "** = **__" + ans + "__**!";
				diff = "\nDifficulty: **Easy**";
				time = 15;
				break;
			}
		case 7:
			{
				type = "Solve this:";
				a = Math.random() * 4 | 0;
				b = (Math.random() * 100 + 1 | 0) * [1, -1].random();
				c = (Math.random() * 100 + 1 | 0) * [1, -1].random();
				ans = b * c;
				que = "**" + b + "** × **" + c + "** = __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__";
				end = "**" + b + "** × **" + c + "** = **__" + ans + "__**!";
				diff = "\nDifficulty: **Medium**";
				time = 35;
				break;
			}
		case 8:
			{
				type = "Solve this:";
				a = Math.random() * 4 | 0;
				b = (Math.random() * 20 + 5 | 0) * [1, -1].random();
				c = (Math.random() * 20 + 5 | 0) * [1, -1].random();
				ans = b;
				que = "**" + (b * c) + "** ÷ **" + c + "** = __\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b__" ;
				end = "**" + (b * c) + "** + **" + c + "** = **__" + ans + "__**!";
				diff = "\nDifficulty: **Hard**";
				time = 45;
				break;
			}
	}

	let embed = new Discord.MessageEmbed()
		.setColor(new Color(176, 14, 223).toHexa())
		.setTitle("IQ")
		.addField(type, que + diff + "\n\nYou have " + time + " seconds.");
	let embed2 = new Discord.MessageEmbed()
		.setColor(new Color(46, 204, 113).toHexa())
		.setTitle("IQ")
		.addField("Correct!", "$WINNER$ got it right!\n" + end);
	let embed3 = new Discord.MessageEmbed()
		.setColor(new Color(231, 76, 60).toHexa())
		.setTitle("IQ")
		.addField("Nobody got it in time!", end);

	message.channel.send(embed);
	games.minigames.push({
		type: "iq",
		ans: ans,
		timer: time,
		sTime: time,
		channel: message.channel.id,
		embeds: {
			win: embed2,
			lose: embed3
		}
	});
};