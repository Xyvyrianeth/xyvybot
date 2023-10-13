import { COMPONENT, BUTTON_STYLE } from "../../index.js";
import { Color } from "../../assets/misc/color.js";
import { miniGames } from "../../games/miniGames.js";
import { solverRunAllSolutions } from "../../assets/misc/solver_engine.js";
import { drawBoard } from "../../assets/misc/drawNumbers.js";

export const command = async (interaction) => {
    const miniGame = miniGames.get(interaction.message.interaction.id);
    if (!miniGame || miniGame.picker !== interaction.user.id)
    {
        return interaction.deferUpdate();
    }

    const command = interaction.customId.split('.');
    const type = ["large", "small"].indexOf(command[2]);
    const number = miniGame.available[type].random();
    miniGame.available[type].remove(number);
    miniGame.numbers[["unshift", "push"][type]](number);

    if (miniGame.numbers.length == 6)
    {
        const target = Math.random() * 899 + 101 | 0;
        miniGame.timer = 40;
        miniGame.target = target;
        solverRunAllSolutions(miniGame.numbers, target, null, results => {
            miniGame.solution = results.nearestExpressions.map(result => [result.value, result.stringValue])[0];
        });

        const author = { attachment: "./assets/authors/numbers.png", name: "author.png" };
        const attachment = { attachment: await drawBoard(miniGame.numbers, miniGame.target), name: "board.png" };
        const embed = {
            author: { name: "numbers", icon_url: "attachment://author.png" },
            description: `Times up <t:${(Date.now() / 1000 | 0) + 40}:R>`,
            image: { url: "attachment://board.png" },
            color: new Color().random().toInt() };

        return interaction.update({ embeds: [ embed ], files: [ author, attachment ], components: [] });
    }
    else
    {
        miniGame.timer = 180;

        const author = { attachment: "./assets/authors/numbers.png", name: "author.png" };
        const attachment = { attachment: await drawBoard(miniGame.numbers, false), name: "board.png" };
        const embed = {
            author: { name: "numbers", icon_url: "attachment://author.png" },
            fields: [ { name: "Choose Large and Small Numbers", value: `Times out <t:${(Date.now() / 1000 | 0) + 180}:R>` } ],
            image: { url: "attachment://board.png" },
            color: new Color().random().toInt() };
        const actionRows = [
        {   type: COMPONENT.ACTION_ROW,
            components: [
            {   type: COMPONENT.BUTTON,
                style: BUTTON_STYLE.BLUE,
                label: "Large",
                customId: "numbers.number.large",
                disabled: miniGame.available[0].length == 0 },
            {   type: COMPONENT.BUTTON,
                style: BUTTON_STYLE.BLUE,
                label: "Small",
                customId: "numbers.number.small" } ] } ];

        return interaction.update({ embeds: [ embed ], files: [ author, attachment ], components: actionRows });
    }
}