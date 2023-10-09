import { Color } from "../../assets/misc/color.js";
import { miniGames } from "../../games/miniGames.js";
import { drawBoard } from "../../assets/misc/drawLetters.js";
import { COMPONENT_TYPE, BUTTON_STYLE } from "../../index.js";

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
        const attachment = { attachment: await drawBoard(miniGame.letters), name: "board.png" };
        const embed = {
            author: { name: "letters", icon_url: "attachment://author.png" },
            image: { url: "attachment://board.png" },
            description: `Time's up <t:${(Date.now() / 1000 | 0) + 40}:R>`,
            color: new Color().random().toInt() };

        return interaction.update({ embeds: [embed], files: [author, attachment], components: [] });
    }
    else
    {
        miniGame.timer = 180;

        const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/letters.png", name: "author.png" };
        const attachment = { attachment: await drawBoard(miniGame.letters), name: "board.png" };
        const embed = {
            author: { name: "letters", icon_url: "attachment://author.png" },
            image: { url: "attachment://board.png" },
            fields: [ { name: "Choose Vowels and Consonants", value: `Times out <t:${(Date.now() / 1000 | 0) + 180}:R>` } ],
            color: new Color().random().toInt() };
        const actionRows = [
        {   type: COMPONENT_TYPE.ACTION_ROW,
            components: [
            {   type: COMPONENT_TYPE.BUTTON,
                style: BUTTON_STYLE.BLUE,
                label: "Vowel",
                customId: "letters.letter.vowel" },
            {   type: COMPONENT_TYPE.BUTTON,
                style: BUTTON_STYLE.BLUE,
                label: "Consonant",
                customId: "letters.letter.consonant" } ] } ];

        return interaction.update({ embeds: [embed], files: [author, attachment], components: actionRows });
    }
}