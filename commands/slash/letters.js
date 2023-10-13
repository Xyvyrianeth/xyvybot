import { COMPONENT, BUTTON_STYLE } from "../../index.js";
import { Color } from "../../assets/misc/color.js";
import { miniGames } from "../../games/miniGames.js";
import { drawBoard } from "../../assets/misc/drawLetters.js";

export const command = async (interaction) => {
    if (miniGames.some(miniGame => miniGame.type == "letters" && miniGame.channel == interaction.channelId))
    {
        return interaction.reply({ content: "There is already an active letters game in this channel.", ephemeral: true });
    }

    const miniGame = {
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
    miniGames.set(interaction.id, miniGame);

    const author = { attachment: "./assets/authors/letters.png", name: "author.png" };
	const attachment = { attachment: await drawBoard(miniGame.letters), name: "board.png" };
    const embed = {
        author: { name: "letters", icon_url: "attachment://author.png" },
        image: { url: "attachment://board.png" },
        fields: [ { name: "Choose Vowels and Consonants", value: `Times out <t:${(Date.now() / 1000 | 0) + 180}:R>` } ],
        color: new Color().random().toInt() };
	const actionRows = [
	{   type: COMPONENT.ACTION_ROW,
		components: [
		{   type: COMPONENT.BUTTON,
			style: BUTTON_STYLE.BLUE,
			label: "Vowel",
			customId: "letters.letter.vowel" },
		{   type: COMPONENT.BUTTON,
			style: BUTTON_STYLE.BLUE,
			label: "Consonant",
			customId: "letters.letter.consonant" } ] } ];

    interaction.reply({ embeds: [ embed ], files: [ author, attachment ], components: actionRows });
}