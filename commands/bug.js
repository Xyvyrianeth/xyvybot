const Discord = require("discord.js");
const { db } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
exports.command = (cmd, args, input, message) => {
	if (message.channel.type == "dm")
		if (!input)
			return message.channel.send("Here is how to format a bug report:\n\n```\nx!reportbug [command that's bugged]\n[description of bug (less than 1000 characters, please)]```\nPlease take note that if you submit a fake bug report, your user ID will be blacklisted and you will no longer be able to use this command. Don't be a cunt.");

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
};