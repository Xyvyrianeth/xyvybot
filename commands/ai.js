const Discord = require("discord.js");
var { Color } = require("/app/assets/misc/color.js");
exports.command = (cmd, args, input, message) => {
	return message.channel.send(
		new Discord.MessageEmbed()
			.setDescription("One day I needed to test a change I made to Squares, but I had nobody to test it with, so I created another bot to play the game with me and holy shit it kicks ass.\n\nI decided to make this new bot as public as Xyvybot so that other people can play against it, too! [Click here to invite it to your server](https://discordapp.com/oauth2/authorize?client_id=561578790837289002&scope=bot&permissions=3072)! Once you have it, just request a game with Xyvybot and then ping the AI bot!\nNote that this bot is completely useless if your server does not also have Xyvybot in it.\nAlso, the only game it can play right now is Squares. I haven't gotten around to letting it play other games, yet.")
			.setAuthor("Xyvybot - AI", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png")
			.setColor(new Color().random()));
};