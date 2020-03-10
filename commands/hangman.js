const Discord = require("discord.js");
var { Color } = require("/app/assets/misc/color.js"),
	{ words } = require("/app/games/hangmanWords.js"),
	{ minigames } = require("/app/Xyvy.js");
exports.command = (cmd, args, input, message) => {
	if (minigames.some((minigame) => minigame.channel == message.channel.id)) return;
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
	minigames.push({
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