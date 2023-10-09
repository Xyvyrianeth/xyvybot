import { Color } from "../../assets/misc/color.js";
import { miniGames } from "../../games/miniGames.js";

export const command = async (interaction) => {
	const miniGame = miniGames.get(interaction.message.interaction.id);
	if (!miniGame || miniGame.picker !== interaction.user.id)
	{
		return interaction.deferUpdate();
	}

	const command = interaction.customId.split('.');
	const type = ["vowel", "consonant"].indexOf(command[2]);
	const letter = miniGame.available[type].random();
	miniGame.available[type].remove(letter);
	miniGame.letters.push(letter);

	if (miniGame.letters.length == 9)
	{
		miniGame.timer = 40;

		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/letters.png", name: "author.png" };
		const embed = {
			author: { name: "letters", icon_url: "attachment://author.png" },
			description: `Time's up <t:${(Date.now() / 1000 | 0) + 40}:R>\n\n:regional_indicator_${miniGame.letters.join(": \u200b :regional_indicator_")}:`,
			color: new Color().random().toInt() };

		return interaction.update({ embeds: [embed], files: [author], components: [] });
	}
	else
	{
		miniGame.timer = 180;

		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/letters.png", name: "author.png" };
		const embed = {
			author: { name: "letters", icon_url: "attachment://author.png" },
			fields: [ { name: "Choose Vowels and Consonants", value: `Times out <t:${(Date.now() / 1000 | 0) + 180}:R>\n\n:regional_indicator_${miniGame.letters.join(": \u200b :regional_indicator_")}:${" \u200b :stop_button:".repeat(9 - miniGame.letters.length)}` } ],
			color: new Color().random().toInt() };
		const actionRow = {
			type: 1,
			components: [
			{	type: 2,
				style: 1,
				label: "Vowel",
				customId: "letters.letter.vowel" },
			{	type: 2,
				style: 1,
				label: "Consonant",
				customId: "letters.letter.consonant" } ] };

		return interaction.update({ embeds: [embed], files: [author], components: [actionRow] });
	}
}