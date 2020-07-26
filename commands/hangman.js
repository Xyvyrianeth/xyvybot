const Discord = require("discord.js");
var { Color } = require("/app/assets/misc/color.js"),
	{ words } = require("/app/games/hangmanWords.js"),
	{ games } = require("/app/Xyvy.js");
exports.command = (cmd, args, input, message) => {
	if (games.minigames.some((minigame) => minigame.channel == message.channel.id))
		games.minigames.forEach((minigame, index) => {
			if (minigame.channel == message.channel.id)
			{
				if (minigame.type == "hangman")
				{
					let display = [];
					minigame.right.forEach((i) => {
						if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/i.test(i)) display.push("__" + i + "__");
						else display.push(i);
					});
					let embed = new Discord.MessageEmbed()
						.setTitle("Hangman")
						.setAuthor("Hangman", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/hangman.png")
						.addField("A game of Hangman is already active in this channel!", `**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\`\nWrong guesses${(minigame.tries == 7 ? "" : " left")}: \`${minigame.tries}\``)
						.setColor(new Color(52, 152, 219).toHexa());
					message.channel.send(embed);
				}
				else
				{
					let embed = new Discord.MessageEmbed()
						.setTitle("Hangman")
						.setAuthor("Hangman", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/hangman.png")
						.setDescription("Another minigame is being played in this channel right now. Try again later.")
						.setColor(new Color(231, 76, 60).toHexa());
					message.channel.send(embed);
				}
			}
		});
	else
	{
		let category = Math.random() * 6 | 0;
		let word = words[category].split('|').random(), ans = [], right = [];
		for (let i = 0; i < word.length; i++)
		{
			if (!/^[\u0300-\u036f]$/.test(word[i])) ans.push(word[i]);
			if (/^[a-z0-9]$/i.test(word[i])) right.push("\u200b \u200b \u200b \u200b");
			else if (/^[\u0300-\u036f]$/.test(word[i])) ans[i - 1] += word[i];
			else right.push(word[i]);
		}
		let display = [];
		for (let i = 0; i < right.length; i++)
		{
			if (/^([a-z0-9]|\u200b \u200b \u200b \u200b)$/.test(right[i])) display.push(`__${right[i]}__`);
			else display.push(right[i]);
		}
		category = ["Tabletop/Board/Card Games", "Movies", "TV Shows", "Video Games", "Anime", "Countries"][category];
		let embed = new Discord.MessageEmbed()
			.setTitle("Hangman")
			.setColor(new Color(176, 14, 223).toHexa())
			.addField("Guess letters and fill out the word!", `**${display.join("\u200b \u200b")}**\nCategory: **${category}**\n${ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!" : ""}\n\nWrong guesses: \`7\``);
		message.channel.send(embed);
		games.minigames.push({
			type: "hangman",
			category: category,
			ans: ans,
			right: right,
			guesses: [],
			tries: 7,
			timer: 180,
			channel: message.channel.id
		});
	}
}