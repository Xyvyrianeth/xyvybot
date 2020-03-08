const Discord = require("discord.js");
const { db } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
exports.command = (cmd, args, input, message) => {
	return db.query(`SELECT req FROM bans`, (err, res) => {
		if (err)
			return message.channel.send("```" + err + "```");
		if (!res.rows[0].req.includes(message.author.id))
		{
			if (!input)
				return message.channel.send("Here is how to format a request:\n\n```\nx!request [description of suggestion]```\nPlease take note that if you submit a fake request, your user ID will be blacklisted and you will no longer be able to use this command. Don't be a cunt.");
			else
				db.query(`SELECT * FROM timers WHERE id = '${message.author.id}`, (err, res) => {
					if (res.rows.length == 1 && res.rows[0].req > 0)
						return message.channel.send("You can submit 1 request every 2 hours. Xyvy doesn't like being spammed, you know.");

					let embed = new Discord.MessageEmbed()
						.setTitle("User Request")
						.setAuthor(
							message.author.username + '#' + message.author.discriminator + " (" + message.author.id + ')',
							`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.${message.author.avatar.startsWith("a_") ? "gif" : "png"}?size=2048`)
						.setDescription("**Suggestion**:\n" + input)
						.setColor(new Color().random());
					client.guilds.cache.get("399327996076621825").channels.cache.get("468245442388295691").send(embed);
					message.channel.send("Request sent! Thanks for the suggestion!");
					if (res.rows.length == 0)
						return db.query(`INSERT INTO timers (id, bug, req) VALUES (${message.author.id}, 0, 7200);`);
					else
						return db.query(`UPDATE timers SET req = 7200 WHERE id = '${message.author.id}'`);
				});
		}
		else
			return message.channel.send("You are not allowed to use this command, since you thought you were funny and tried to spam it at some point. Way to go, you're a dick. You should feel proud.");
	});
};