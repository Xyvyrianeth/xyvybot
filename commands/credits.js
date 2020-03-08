const Discord = require("discord.js");
exports.credits = (cmd, args, input, message) => {
	return message.channel.send(
		new Discord.MessageEmbed()
			.setTitle(
				"Credits",
				exports.Images.avatar)
			.addField(
				"Created, Authored, and Primarily Tested by",
				"Xyvyrianeth")
			.addField(
				"Code Dependencies",
				"[Heroku](https://heroku.com/), [Node.js](https://nodejs.org/en/), and the following NPM libraries:\n" +
				" -[Discord.js](https://npm.js/package/discord.js)\n" +
				" -[PostgreSQL](https://npm.js/package/pg)\n" +
				" -[Nekos.Life](https://npm.js/package/nekos.life)\n" +
				" -[Canvas](https://npm.js/package/canvas)\n" +
				"[Multiplayer Piano](https://multiplayerpiano.com) for all functions relating to [color hexadecimals](https://multiplayerpiano.com/Color.js).")
			.addField(
				"Images",
				"All profile backgrounds found on [Imgur](https://imgur.com/) and posted by user [u/Kizenkis](https://imgur.com/user/Kizenkis) throughout various posts.\n" +
				`All images from x!nekos${message.channel.nsfw ? " and x!nsfw " : " "}come directly from the [Nekos.Life](https://nekos.life/) API.\n` +
				"All other assets made by Xyvyrianeth.")
			.addField(
				"Special Thanks",
				"to various users from [The Officially Unofficial Server to the Unofficially Official Dan-Ball Community](https://discord.gg/gYVMUrM) for both support and player testing.")
			.setColor(new Color().random()));
};