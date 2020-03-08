const Discord = require("discord.js");
exports.command = (cmd, args, input, message) => {
	return message.channel.send(
		new Discord.MessageEmbed()
			.setTitle("Bots by Xyvy")
			.setDescription("Are you tired of sorting through countless Discord bot listings trying to find one that does exactly what you need one to do? Well, stop doing that. Sometimes, a bot that does what you need it to do just doesn't exist. But it *can*, and that's where I come in! If you have money and a lack of programming knowledge and really need a bot that doesn't exist, I'll make it for you! Just click [this link](https://sites.google.com/site/botsbyxyvy/), read the information, and submit a commission request so we can get to work!")
			.setColor(new Color().random()));
};