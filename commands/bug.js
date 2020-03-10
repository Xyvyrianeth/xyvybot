const Discord = require("discord.js");
const { db } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
exports.command = (cmd, args, input, message) => {
	if (message.channel.type == "dm")
		return db.query(`SELECT bug FROM bans`, (err, res) => {
			if (err)
				return message.channel.send("```" + err + "```");
			if (!res.rows[0].bug.includes(message.author.id))
			{
				if (!input)
					return message.channel.send("Here is how to format a bug report:\n\n```\nx!reportbug [command that's bugged]\n[description of bug (less than 1000 characters, please)]```\nPlease take note that if you submit a fake bug report, your user ID will be blacklisted and you will no longer be able to use this command. Don't be a cunt.");
				db.query(`SELECT * FROM timers WHERE id = '${message.author.id}`, (err, res) => {
					if (res.rows.length == 1 && res.rows[0].bug > 0)
						return message.channel.send("You can submit 1 bug every 2 hours. Xyvy doesn't like being spammed, you know.");
					let com = input.split("\n")[0],
						desc = input.substring(com.length).trim(),
						aliases = message.channel.type == "dm" ? aliases.user : aliases.guild,
						a = false;
					for (let i in aliases)
						if (aliases[i].includes(com))
						{
							a = true;
							break;
						}
					if (!a)
						return message.channel.send("That command does not exist!");

					let embed = new Discord.MessageEmbed()
						.setTitle("Bug Report")
						.setAuthor(
							message.author.username + '#' + message.author.discriminator + " (" + message.author.id + ')',
							`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.${message.author.avatar.startsWith("a_") ? "gif" : "png"}?size=2048`)
						.setDescription("**Command**: " + com + "\n\n" + desc)
						.setColor(new Color().random());
					client.guilds.cache.get("399327996076621825").channels.cache.get("467853697528102912").send(embed);
					message.channel.send("Bug report sent! Thanks for helping out!");
					if (res.rows.length == 0)
						return db.query(`INSERT INTO timers (id, bug, req) VALUES (${message.author.id}, 7200, 0);`);
					else
						return db.query(`UPDATE timers SET bug = 7200 WHERE id = '${message.author.id}'`);
				});
			}
			else
				return message.channel.send("You are not allowed to use this command, since you thought you were funny and tried to spam it at some point. Way to go, you're a dick. You should feel proud.");
		});
};