const Discord = require("discord.js");
const { db } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
exports.command = (cmd, args, input, message) => {
	if (message.channel.type == "dm")
		if (!input)
			return message.channel.send("Here is how to format a request:\n\n```\nx!request [description of suggestion]```\nPlease take note that if you submit a fake request, your user ID will be blacklisted and you will no longer be able to use this command. Don't be a cunt.");
		let embed = new Discord.MessageEmbed()
			.setTitle("User Request")
			.setAuthor(
				message.author.username + '#' + message.author.discriminator + " (" + message.author.id + ')',
				`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.${message.author.avatar.startsWith("a_") ? "gif" : "png"}?size=2048`)
			.setDescription("**Suggestion**:\n" + input)
			.setColor(new Color().random());
		client.guilds.cache.get("399327996076621825").channels.cache.get("468245442388295691").send(embed);
		message.channel.send("Request sent! Thanks for the suggestion!");
};