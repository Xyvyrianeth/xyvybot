"use strict";

import { Client, COMPONENT, BUTTON_STYLE } from "../../index.js";
import { Color } from "../../assets/misc/color.js";
import { Games } from "../../games/games.js";
import { replayImage } from "../../games/replayImage.js";

export const command = async (interaction) => {
    const command = interaction.isCommand() ? [interaction.commandName] : interaction.customId.split('.');
    const channel = await Client.channels.fetch(interaction.channelId);
    const gamename = {
        "othello":        "othello",
        "squares":        "squares",
        "rokumoku":       "rokumoku",
        "3dtictactoe":    "ttt3d",
        "connect4":       "connect4",
        "ordo":           "ordo",
        "papersoccer":    "soccer",
        "linesofaction":  "loa",
        "latrones":       "latrones" }[command[0]];
    const Gamename = {
        "othello":   "Othello",
        "squares":   "Squares",
        "rokumoku":  "Rokumoku",
        "ttt3d":     "3D Tic-Tac-Toe",
        "connect4":  "Connect Four",
        "ordo":      "Ordo",
        "soccer":    "Paper Soccer",
        "loa":       "Lines of Action",
        "latrones":  "Latrones" }[gamename];
    const gameDescription = {
        "othello":   "A Minute to Learn, a Lifetime to Master",
        "squares":   "Place your pieces and make the most squares",
        "rokumoku":  "It's, like, *really* big tic-tac-toe",
        "ttt3d":     "A game of Noughts and Crosses but in 3 dimensions",
        "connect4":  "A configurable 4-in-a-Row game!",
        "ordo":      "Reach for the other side and maintain your connection at the same time",
        "soccer":    "A classic paper-and-pencil soccer game, but digital",
        "loa":       "Be the first to connect all your pieces by moving them along their lines of action",
        "latrones":  "Ludus latrunculorum" }[gamename];
    const gamePreview = {
        "othello":   "c4",
        "squares":   "c4",
        "rokumoku":  "j11.c11.d10.h10.g10.g9.f8.f10.e9.e8.d8.h8.c8.j7.i7.h7.e7.g7.h6.i6.f6.k5.f5.j5.i5.h4.f2.h5.g5.i10.h9.i4.g4.g8.f7.h3.f3.e6.d5",
        "ttt3d":     "1b2.3c3.1a1.1c3.2a4.2a3.2a1.2b3.2d4.2c3.2d3.4c3",
        "connect4":  "d8.e8.f8.e7.d7.c8",
        "ordo":      "b3 c3",
        "soccer":    "ul.ur.l.d.r.ul.ul.ur.dr.dl.l.u.u.dr.dl.dl.r.ur.u.l.ul.dl.l.ur.dr.dr.d.r.ul.l.dr.dr.r.u.dl.u.dl.r.dr.u.dl.r.r.ul.r.d.dr.dl.d.ur.l.ul.u.ur.ur.ul.l.d.dr.u.l.ur.d.dr.dr.dl.d.d.ul.dl.ul.ur.ur.ur.u.ur.l.d.l.ul.u.dr.r.dr.dl.l.dr.r.ur.l.u.dr.ur.dr",
        "loa":       "b1 down",
        "latrones":  "c4" }[gamename].split('.');

    const options = interaction.options._hoistedOptions;
    const config = {
        "connect4": {
            "gravity":      options.find(option => option.name == "gravity")?.value || 0,
            "lineDeletion": options.find(option => option.name == "linetris")?.value || 0,
            "boardSize":    options.find(option => option.name == "size")?.value || 0 }
    }[gamename];

    const gamesWithAI = ["squares", "rokumoku", "ttt3d"];
    const configurableGames = ["connect4"];
    const configText = !configurableGames.includes(gamename) ? "" : {
        "connect4": `\n\n**Gravity**: ${["Down", "Outward", "Inward", "Disabled"][config.gravity]}\n**Linetris**: ${["Disabled", "Enabled"][config.lineDeletion]}\n**Board Size**: ${["8x8", "Classic"][config.boardSize]}`
    }[gamename];
    const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png", name: "author.png" };
    const attachment = { attachment: await replayImage(gamename, interaction.id, false, gamePreview), name: "preview.png" };
    const embed = {
        author: {
            name: Gamename + " | [Click for Rules]",
            icon_url: "attachment://author.png",
            url: `https://github.com/Xyvyrianeth/xyvybot_assets/wiki/${gamename}` },
        description: gameDescription + configText,
        image: { url: "attachment://preview.png" },
        color: new Color().random().toInt() };
    const playActionRow = {
        type: COMPONENT.ACTION_ROW,
        components: [
        {   type: COMPONENT.BUTTON,
            style: BUTTON_STYLE.BLUE,
            label: `Play ${Gamename}`,
            customId: `${command[0]}.start.global`,
            disabled: Games.some(Game => Game.channels.includes(interaction.channelId) && Game.started) },
        {   type: COMPONENT.BUTTON,
            style: BUTTON_STYLE.BLUE,
            label: `Play Locally`,
            customId: `${command[0]}.start.local`,
            disabled: channel.guildId == null || Games.some(Game => Game.channels.includes(interaction.channelId) && Game.started) },
        {   type: COMPONENT.BUTTON,
            style: BUTTON_STYLE.BLUE,
            label: "Play Against the Bot",
            customId: `${command[0]}.start.ai`,
            disabled: !gamesWithAI.includes(gamename) } ] };
    const rulesActionRow = {
        type: COMPONENT.ACTION_ROW,
        components: [
        {   type: COMPONENT.BUTTON,
            style: BUTTON_STYLE.LINK,
            label: "Click me to learn how to play!",
            url: `https://github.com/Xyvyrianeth/xyvybot_assets/wiki/${gamename}` } ] };

    return interaction.reply({ embeds: [ embed ], files: [ author, attachment ], components: [ playActionRow, rulesActionRow ] });
}