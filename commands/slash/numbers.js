"use strict";

import { COMPONENT, BUTTON_STYLE } from "../../index.js";
import { Color } from "../../assets/misc/color.js";
import { miniGames } from "../../games/minigames.js";
import { drawBoard } from "../../assets/misc/drawNumbers.js";

export const command = async (interaction) => {
    if (miniGames.some(miniGame => miniGame.type == "numbers" && miniGame.channelId == interaction.channelId))
    {
        return interaction.reply({ content: "There is already an active numbers game in this channel.", ephemeral: true });
    }

    const miniGame = {
        id: interaction.id,
        picker: interaction.user.id,
        numbers: [],
        available: [
            [25, 50, 75, 100],
            [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10] ],
        type: "numbers",
        channelId: interaction.channelId,
        attempts: {},
        timer: 180 };
    miniGames.set(interaction.id, miniGame);

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
            customId: "numbers.number.large" },
        {   type: COMPONENT.BUTTON,
            style: BUTTON_STYLE.BLUE,
            label: "Small",
            customId: "numbers.number.small" } ] } ];

    return interaction.reply({ embeds: [ embed ], files: [ author, attachment ], components: actionRows, fetchReply: true }).then((message) => miniGame.messageId = message.id);
}