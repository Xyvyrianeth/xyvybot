const Discord = require("discord.js");
var { Color } = require("/app/assets/misc/color.js");
var { aliases } = require("/app/Xyvy.js");
exports.command = (cmd, args, input, message) => {
	if (!input)
		return message.channel.send("To view all the aliases for a command, do x!aliases `command name`");
	for (let i in aliases.guild)
		if (aliases.guild[i].includes(input))
			return message.channel.send(
				new Discord.MessageEmbed()
					.setTitle("Aliases for " + i)
					.setDescription('`' + aliases.guild.join("`  `") + '`')
					.setColor(new Color().random()));
};