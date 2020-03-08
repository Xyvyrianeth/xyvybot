const Discord = require("discord.js");
exports.command = (cmd, args, input, message) => {
	return message.channel.send(
		new Discord.MessageEmbed()
			.setTitle(
				"About me",
				exports.Images.avatar)
			.setDescription(
				"Let's start off by saying that the only reason this bot exists is because someone else told me I should make it. Not for any reason in particular, they were just testing me to see if I could do it.\n" +
				"Well, I did it, and then I found I enjoyed making it, so I kept building on it. It's still kinda rough on the edges, but it works, and that's all that matters, right?\n" +
				"\n" +
				"Fast-forward 2 years and I find myself interested in [abstract strategy games](https://en.wikipedia.org/wiki/Abstract_strategy_game), like Go and Othello. It's not easy using a completely different application or software to play simple games with my friends on Discord, so I made this bot able to do what those other apps did, and we had fun.\n" +
				"*Then*, someone suggested I make this bot go public so *other people* won't have the same problem. Thank that person (I forgot who, honestly) for telling me to solve that problem for you if you had it as well.\n" +
				"\n" +
				"Currently, I'm building up to starting a community centered around abstract strategy games. I plan to run tournaments where people play these games and win prizes, like money and Steam codes and more.\n" +
				"Once I feel the bot is in a state of relative completeness, said server will go public. Please look forward to it.")
			.setColor(new Color().random()));
};