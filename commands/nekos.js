const Discord = require("discord.js");
const nekos = require("nekos.life");
const Nekos = new nekos();
exports.nekos = (cmd, args, input, message) => {
	Nekos.sfw.neko().then(neko => {
		return message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("x!nsfw", exports.Images.nekosLife)
				.setImage(neko.url)
				.setDescription("Have a neko!")
				.setFooter("Powered by Nekos.Life")
				.setColor(new Color().random()));
	});
};