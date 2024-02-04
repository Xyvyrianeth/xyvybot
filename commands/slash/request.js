"use strict";

import { Client, bannedUsers } from "../../index.js";
import { Color } from "../../assets/misc/color.js";

export const command = async (interaction) => {
    if (bannedUsers.includes(interaction.user.id))
    {
        return interaction.reply({ content: "You have been barred from using this command", ephemeral: true });
    }

    const channel = await Xyvybot.channels.fetch("597907504155983874");
    const input = interaction.options._hoistedOptions[0].value;
    const author = { attachment: "./assets/authors/request.png", name: "author.png" };
    const embed = {
        author: { name: `${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`, icon_url: "attachment://author.png" },
        title: "User Request",
        description: "**Suggestion**:\n" + input,
        color: new Color().random().toInt() };
    channel.send({ embeds: [ embed ], files: [ author ] });
    return interaction.reply({ content: "Request sent! Thanks for the suggestion!", ephemeral: true });
};