const Discord = require("discord.js"),
	{ db } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js"),
	{ table } = require("/app/assets/misc/table.js");
exports.command = (cmd, args, input, message) => {
	if (message.author.id != "357700219825160194")
		return;
	if (message.content.startsWith("x!pg ```sql\n") && message.content.endsWith("```"))
		return db.query(input.substring(7, input.length - 3), (err, res) => {
			let embed = new Discord.MessageEmbed()
				.setTitle("x!pg")
				.setColor(new Color().random())
				.setTimestamp();
			if (err)
			{
				embed.setDescription("```" + err + "```");
				return message.channel.send(embed);
			}
			let Table = table(res);
			if (Table.length > 2048)
				embed.setDescription("Overflow");
			else
				embed.setDescription(table(res));
			return message.channel.send(embed);
		});
};