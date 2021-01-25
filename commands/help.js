const Discord = require("discord.js");
var { Color } = require("/app/assets/misc/color.js"),
	{ aliases, version } = require("/app/Xyvy.js");
exports.command = (cmd, args, input, message) => {
	if (!input)
	{
		let embed = new Discord.MessageEmbed()
			.setTitle("x!help")
			.setDescription("A list of all commands supported by Xyvybot\nFor more help about any specific command, do \"x!help `command`\"")
			.addField(
				"\u200b",
				"__**Featured Games**__\n`othello`\n`squares`\n`3dtictactoe`\n`connect4`\n`rokumoku`\n`ordo`\n`papersoccer`\n`linesofaction`\n`latrones`\n\n" +
				"__**Planned Games**__\n[Ludus latrunculorum](https://en.wikipedia.org/wiki/Ludus_latrunculorum)\n[Go](https://en.wikipedia.org/wiki/Go_(game))\n\n" +
				"__**Game-Related Commands**__\n`profile`\n`leaderboard`\n`history`", true)
			.addField(
				"\u200b",
				"__**Minigames**__\n`minesweeper`\n`iq`\n`hangman`\n\n" +
				"__**Utility**__\n`help`\n`aliases`\n`invite`\n`request`\n`bug`\n\n" +
				"__**Miscellaneous**__\n`nekos`\n`calculate`\n`graph`\n`about`\n`credits`\n`ai`", true)
			.setColor(new Color().random())
			.setFooter("Xyvybot version " + version);
		if (message.channel.type == "dm" || message.channel.nsfw)
			embed.addField("NSFW", `NSFW command only available in DMs or NSFW-marked channels (if you're seeing this, then you can use it here). Say \"x!nsfw help\" for a list of all the lewds I'm capable of.`);
		return message.channel.send(embed);
	}
	else
	{
		let embed = new Discord.MessageEmbed()
			.setTitle("x!help")
			.setDescription("Sorry, but I can't do that right now. This feature is still being planned out and should be available soon.")
			.setColor(new Color().random())
			.setFooter("Xyvybot version " + version);
		return message.channel.send(embed);
	}
};