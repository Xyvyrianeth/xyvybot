"use strict";

import { Client } from "../../index.js";
import { Color } from "../../assets/misc/color.js";
import emoji from "../../assets/misc/emoji.json" assert { type: "json" };

export const command = async (interaction) => {
    const channel = await Xyvybot.channels.fetch(interaction.channelId);
    const permissions = await channel.permissionsFor(Xyvybot.user.id);
    const perms = [
        !(await permissions.has(1n << 10n)), // VIEW_CHANNEL
        !(await permissions.has(1n << 11n)), // SEND_MESSAGES
        !(await permissions.has(1n << 15n)), // ATTACH_FILES
        !(await permissions.has(1n << 38n)), // SEND_MESSAGES_IN_THREADS
        !(await permissions.has(1n << 18n)), // USE_EXTERNAL_EMOJIS
        !(await permissions.has(1n << 13n)), // MANAGE_MESSAGES
    ];
    const titles = [
        "View Channel",
        "Send Messages",
        "Attach Files",
        "Send Messages in Threads",
        "Use External Emojis",
        "Manage Messages",
    ];
    var threatLevel = 0;
    for (let i = 0; i < 4; i++)
    {
        if (perms[i])
        {
            threatLevel += 1;
        }
    }
    if (threatLevel == 0 && (perms[4] || perms[5]))
    {
        threatLevel = 1;
    }

    const description = perms.map((perm, index) => {
        const emote = perms[3] ? perm ? ":x:" : ":white_check_mark:" : perm ? `<:${emoji.uncheck.name}:${emoji.uncheck.id}>` : `<:${emoji.check.name}:${emoji.check.id}>`;
        return `${emote} **${titles[index]}**` });

    const note =
        perms[0] || perms[1] || perms[2] ?
            "This channel is not suitable. Features will be limited." :
        perms[3] ?
            "This channel is suitable; however, features will be limited in threads." :
        perms[4] ?
            "This channel is suitable; however, custom emoji will be disabled." :
        perms[5] ?
            "This channel is suitable; however, the Manage Messages permission is recommended for clutter control." :
            "This channel is perfectly suitable.";

    const embed = {
        title: "Permission Requirements for #" + channel.name,
        author: { name: "Xyvybot Setup", url: "./assets/authors/setup.png" },
        color: new Color(["#66DD66", "#FFFF66", "#FF9966", "#FF6666", "#990000"][threatLevel]).toInt(),
        description: description.join('\n'),
        fields: [{ name: "Verdict:", value: note }] };

    interaction.reply({ embeds: [ embed ] });
}