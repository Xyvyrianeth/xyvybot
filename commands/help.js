const Discord = require("discord.js");
var { Color } = require("/app/assets/misc/color.js"),
	{ aliases, version } = require("/app/Xyvy.js");
exports.command = (cmd, args, input, message) => {
	if (!input)
	{
		let helps =
			[	"__**Featured Games**__\n`othello`  `squares`  `3dtictactoe`  `connect4`  `rokumoku`  `ordo`  `papersoccer`\n__**Possible Future Releases**__:\n`go`\n__**Related Commands**__:\n`games`  `profile`",
				"`minesweeper`  `iq`  `hangman`",
				"`help`  `about`  `credits`  `aliases`",
				"`nekos`  `calculate`  `graph`  `ai`  `botsbyxyvy`"];
		if (message.channel.type == "dm")
			helps[2] += "  `bugreport`  `request`";
		let embed = new Discord.MessageEmbed()
			.setTitle("Help")
			.setDescription("A list of all commands supported by Xyvybot\n" + (message.channel.type == "dm" ? "Some of these commands are not supported in servers" : "Some of these commands are not supported in DMs") + "\nFor more help about any specific command, do \"x!`command` help\"")
			.addField("Games", helps[0])
			.addField("Minigames", helps[1])
			.addField("Utility", helps[2])
			.addField("Miscellaneous", helps[3])
			.setColor(new Color().random())
			.setFooter("Xyvybot version " + version);
		if (message.channel.type == "dm" || message.channel.nsfw)
			embed.addField("NSFW", `NSFW command only available in DMs or NSFW-marked channels (if you're seeing this, then you can use it here). Say \"x!nsfw help\" for a list of all the lewds I'm capable of.`);
		return message.channel.send(embed);
	}
	else
	{
		Object.values(aliases[message.channel.type == "dm" ? "user" : "guild"]).forEach((alias, index) => {
			if (alias.includes(input))
			{
				let help = [
					["x!games `leaderboard|statistics` `game name|user ID`", "The umbrella command for checking out all game statistics for any user in Discord.", "x!games statistics 357700219825160194"],
					["x!othello `start|rules`", "Othello, or Reversi, is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!othello start"],
					["x!squares `start|rules`", "Squares is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that I created that can be played with my bot against other people.", "x!squares start"],
					["x!rokumoku `start|rules`", "Rokumoku is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!rokumoku start"],
					["x!ttt3d `start|rules`", "3D Tic Tac Toe is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!ttt3d start"],
					["x!connect4 `start|rules`", "Connect Four, or Vertical Checkers, is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!connect4 start"],
					["x!ordo `start|rules`", "Ordo is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!ordo start"],
					["x!papersoccer `start|rules`", "Paper Soccer is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!papersoccer start"],
					["x!profile `user`", "Show of your own profile card that shows your game stats and rank. It has a customizable background and overlay color.", "x!profile 357700219825160194"],
					["x!minesweeper `width` `height` `difficulty`", "A classic game of Minesweeper right here on Discord. Wouldn't be possible without the ||spoiler|| feature.", "x!minesweeper 10 15 20%"],
					["x!iq", "Gives you a quick and easy logic puzzle that you have to answer as fast as you can!", "x!iq"],
					["x!hangman", "Lets you and your friends play a game of Hangman with each other!", "x!hangman"],
					["x!about", "Just a bit of information about what this bot does and some history about it.", "x!about"],
					["x!help `command`", "Generates a list of commands, or gives a short description about a specific command.", "x!help help"],
					["x!aliases `command`", "Get a list of all available keywords you can use to trigger a command.", "x!aliases help"],
					["x!bug `command`\n`description`", "If you find a feature that you don't think should be a feature, use this command so that the dev will know about it. Be sure to be descriptive! Can only be used in direct messages. Can be used once per user every 2 hours.", "x!bug minesweeper\nDimensions don't match what's requested."],
					["x!request `description`", "If there's a feature the bot does not yet support and you want to see supported, use this command so the dev will know about it. Be sure to be descriptive! Can only be used in direct messages. Can be used once per user every 2 hours.", "x!request Add more profile backgrounds"],
					["x!neko", "Get a picture of a cute anime girl with cat ears.", "x!neko"],
					["x!calc `equation`", "Solves a simple equation for you like a calculator.", "x!calc 2 + 2"],
					["x!graph `equation`", "Draws out an equation on a coordinate grid. You can graph up to 10 equations at once.", "x!graph 2x + 7"],
					["x!ai", "Gives you a link to invite Xyvybot - AI to your server.", "x!ai"],
					["x!botsbyxyvy", "Gives you a link to the site where you request a commission for a custom-made Discord bot by Xyvyrianeth.", "x!botsbyxyvy"],
					["x!nsfw `tag`", "Get a naughty hentai image. This command can only be used in channels marked as NSFW or in direct messages.", "x!nsfw gif"]
				][index];
				return message.channel.send(
					new Discord.MessageEmbed()
						.setTitle("Help!")
						.setAuthor("Command: " + Object.keys(aliases.guild)[index])
						.setDescription("__**Usage**__:\n" + help[0] + "\n\n" + help[1] + "\n\n__**Example**__:\n" + help[2])
						.setColor(new Color().random())
						.setFooter("Xyvybot version " + version));
			}
			else
			if (index == Object.keys(aliases[message.channel.type == "dm" ? "user" : "guild"]).length)
				message.channel.send("That command does not exist.");
		});
	}
}