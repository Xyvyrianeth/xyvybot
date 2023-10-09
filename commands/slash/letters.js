import { Color } from "../../assets/misc/color.js";
import { miniGames } from "../../games/miniGames.js";

export const command = async (interaction) => {
	if (miniGames.some(miniGame => miniGame.type == "letters" && miniGame.channel == interaction.channelId))
	{
		return interaction.reply({ content: "There is already an active letters game in this channel.", ephemeral: true });
	}

	const letters = {
		id: interaction.id,
		picker: interaction.user.id,
		letters: [],
		available: [
			"aaaaaaaaaaaaaaaeeeeeeeeeeeeeeeeeeeeeiiiiiiiiiiiiiooooooooooooouuuuu".split(''),
			"bbcccddddddddffggghhjklllllmmmmnnnnnnnnppppqrrrrrrrrrssssssssstttttttttvwxyz".split('') ],
		type: "letters",
		channelId: interaction.channelId,
		attempts: {},
		timer: 180 };
	miniGames.set(interaction.id, letters);

	const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/letters.png", name: "author.png" };
	const embed = {
		author: { name: "letters", icon_url: "attachment://author.png" },
		fields: [ { name: "Choose Vowels and Consonants", value: `Times out <t:${(Date.now() / 1000 | 0) + 180}:R>\n\n${":stop_button: \u200b ".repeat(8)}:stop_button:` } ],
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

	interaction.reply({ embeds: [embed], files: [author], components: [actionRow] });
}