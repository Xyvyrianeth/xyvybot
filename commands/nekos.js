const Discord = require("discord.js"),
	  nekos = require("nekos.life"),
	  Nekos = new nekos();
var { Color } = require("/app/assets/misc/color.js"),
	titles = require("/app/assets/profile/titles.json");
exports.command = (cmd, args, input, message) => {
	Nekos.sfw.neko().then(neko => {
		return message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("x!nsfw", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/nekos_life.png")
				.setImage(neko.url)
				.setDescription("Have a neko!")
				.setFooter("Powered by Nekos.Life")
				.setColor(new Color().random()));
	});
};