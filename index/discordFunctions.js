"use strict";

import { Client, gameCount, dataBase } from "../index.js";
import images from "../assets/profile/backgrounds.json" assert { type: "json" };
import { Color } from "../assets/misc/color.js";

import "../assets/prototypes/math.js";
import "../assets/prototypes/array.js";

export const sendMessage = async (payload, channel) => {
    if (!channel)
    {
        console.log(message, payload);
        return console.log("Channel does not exist");
    }
    const permissions = await channel.permissionsFor(Client.user.id);
    if (!(await permissions.has(1n << 11n)))
    {
        return console.log("Lacking permission");
    }
    channel.send(payload);
}

export const deleteMessage = async (message, where) => {
    if (!message)
    {
        return console.log("Message does not exist", where);
    }
    const channel = message.channel;
    if (!channel)
    {
        return console.log("Channel does not exist", where);
    }
    const permissions = await channel.permissionsFor(Client.user.id);
    if (!(await permissions.has(1n << 13n)))
    {
        return console.log("Lacking permission");
    }
    await message.delete();
}

export const botError = async (err, object, isMessage) => {
    const errorChannel = await Client.channels.fetch("847316212203126814");
    const errs = [];
    for (let i = 0; i < err.stack.split('\n').length; i++)
    {
        if (err.stack.split('\n')[i].includes("at Client.emit"))
        {
            break;
        }
        else
        {
            errs.push(err.stack.split('\n')[i]);
        }
    }

    if (isMessage && !(object.author.bot || !object.content.startsWith("x!")))
    {
        const author = { attachment: "./assets/misc/avatar.png", name: "author.png" };
        const embed = {
            author: { name: "Xyvybot", icon_url: "attachment://author.png" },
            title: "Error on command: " + object.content.split(' ')[0].substring(2),
            description: "```\n" + errs.join('\n').replace(/[a-zA-Z0-9]*:[\/\\][a-zA-Z0-9\/\\:]*[\/\\]xyvybot[\/\\]/g, "xyvybot:").replace(/xyvybot:node_modules[\/\\](.+)[\/\\]/g, "$1:") + "\n```",
            color: new Color().random().toInt() };

        await object[object.replied ? "editReply" : "reply"]({ embeds: [ embed ], files: [ author ] });
        await errorChannel.send({ embeds: [ embed ], files: [ author ] });
        return;
    }
    if (!isMessage)
    {
        const author = { attachment: "./assets/misc/avatar.png", name: "author.png" };
        const embed = {
            author: { name: "Xyvybot", icon_url: "attachment://author.png" },
            title: "Error on command: " + (object.commandName || object.customId.split('.')[0]),
            description: "```\n" + errs.join('\n').replace(/[a-zA-Z0-9]*:[\/\\][a-zA-Z0-9\/\\:]*[\/\\]xyvybot[\/\\]/g, "xyvybot:").replace(/xyvybot:node_modules[\/\\](.+)[\/\\]/g, "$1:") + "\n```",
            color: new Color().random().toInt() };

        await object[object.replied ? "editReply" : "reply"]({ embeds: [ embed ], files: [ author ] });
        await errorChannel.send({ embeds: [ embed ], files: [ author ] });
        return;
    }
}

export const newUser = async (id) => {
    const image = Object.keys(images).random();
    const query =
        `INSERT INTO profiles (\n` +
        `     id, elo, elos, win, wins, los, loss, tie, ties, money, color, title, lefty, background, backgrounds\n` +
        `) VALUES (\n` +
        `     '${id}',` +
        `    ${1000 * gameCount}, ARRAY[1000${", 1000".repeat(gameCount - 1)}],\n` +
        `    0, ARRAY[0${", 0".repeat(gameCount - 1)}],\n` +
        `    0, ARRAY[0${", 0".repeat(gameCount - 1)}],\n` +
        `    0, ARRAY[0${", 0".repeat(gameCount - 1)}],\n` +
        `    0, '#2f3136', 'Casual Gamer', ${images[image].right ? false : true}, '${image}', ARRAY['${image}']\n` +
        `);`;
    await dataBase.query(query).catch((err) => console.log(err));
    const profile = {
        id: id, color: "#aaa", title: "Casual Gamer", background: image, backgrounds: [ image ],
        lefty: !images[image].right, money: 500,
        elos: [],
        wins: [],
        loss: [],
        ties: [] };
    for (let i = 0; i < gameCount; i++)
    {
        profile.elos.push(1000);
        profile.wins.push(0);
        profile.loss.push(0);
        profile.ties.push(0);
    }
    return profile;
}