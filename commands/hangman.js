import { Color } from "../assets/misc/color.js";
import categories from "../assets/misc/hangmanWords.json" assert { type: "json" };
import { miniGames } from "../games/minigames.js";

export const command = (interaction) => {
	if (miniGames.some(miniGame => miniGame.channel == interaction.channelId && miniGame.type == "hangman"))
	{
		const miniGame = miniGames.find(miniGame => miniGame.channel == interaction.channelId && miniGame.type == "hangman");
		const display = [];
		miniGame.current.forEach((i) => {
			if (i === false)
			{
				display.push("__\u200b \u200b \u200b \u200b__");
			}
			else
			if (/^[A-Z0-9][\u0300-\u036f]?$/i.test(i))
			{
				display.push("__" + i + "__");
			}
			else
			{
				display.push(i);
			}
		});

		const hangman = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/hangman/" + miniGame.tries + ".png", name: "hangman.png" };
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/hangman.png", name: "author.png" };
		const embed = {
			author: { name: "Hangman", icon_url: "attachment://author.png" },
			thumbnail: { url: "attachment://hangman.png" },
			fields: [ { name: "A game of Hangman is already active in this channel!", value: `**${display.join("\u200b \u200b")}**\nCategory: **${miniGame.category}**${miniGame.answer.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\n\`${miniGame.tries}\` wrong guesses left\n__**Previous Guesses**__\n\`${miniGame.guesses.length == 0 ? "None" : miniGame.guesses.join("` `")}\`` } ],
			color: new Color(52, 152, 219).toInt() };
		interaction.reply({ embeds: [embed], files: [hangman, author] });
	}
	else
	{
		const category = interaction.options._hoistedOptions[0]?.value || Math.random() * 7 | 0;
		const word = categories[Object.keys(categories)[category]].random();
		const answer = [];
		const current = [];
		for (let i = 0; i < word.length; i++)
		{
			if (!/^[\u0300-\u036f]$/.test(word[i]))
			{
				answer.push(word[i]);
			}

			if (/^[a-z0-9]$/i.test(word[i]))
			{
				current.push(false);
			}
			else
			if (/^[\u0300-\u036f]$/.test(word[i]))
			{
				answer[i - 1] += word[i];
			}
			else
			{
				current.push(word[i]);
			}
		}

		const display = [];
		for (let i = 0; i < current.length; i++)
		{
			if (current[i] === false)
			{
				display.push("__\u200b \u200b \u200b \u200b__");
			}
			else
			if (/^[a-z0-9]$/.test(current[i]))
			{
				display.push(`__${current[i]}__`);
			}
			else
			{
				display.push(current[i]);
			}
		}

		const Category = ["Tabletop/Board/Card Games", "Movies", "TV Shows", "Video Games", "Anime/Manga", "Countries", "Pokémon"][category];
		const hangman = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/hangman/7.png", name: "hangman.png" };
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/hangman.png", name: "author.png" };
		const embed = {
			author: { name: "Hangman", icon_url: "attachment://author.png" },
			thumbnail: { url: "attachment://hangman.png" },
			fields: [ { name: "Guess letters and fill out the word!", value: `**${display.join("\u200b \u200b")}**\nCategory: **${Category}**\n${answer.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!" : ""}\n\n\`7\` wrong guesses left` } ],
			color: new Color("#880088").toInt() };

		interaction.reply({ embeds: [embed], files: [hangman, author] });

		miniGames.set(interaction.id, {
			type: "hangman",
			answer: answer,
			current: current,
			guesses: [],
			category: Category,
			tries: 7,
			timer: 180,
			channel: interaction.channelId,
			id: interaction.id });
	}
}