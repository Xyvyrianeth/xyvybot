"use strict";

import { Client, dataBase, version, bannedUsers } from "../../index.js";
import DiscordJS from "discord.js";
import { Color } from "../../assets/misc/color.js";
import { table } from "../../assets/misc/table.js";
import { Games } from "../../games/games.js";
import { Rules } from "../../games/rules.js";
import { miniGames } from "../../games/minigames.js";
import Canvas from "canvas";
import allWords from "../../assets/misc/dictionary.json" assert { type: "json" };
import { drawText } from "../../assets/drawText/drawText.js";

export const command = async (input, message) => {
    if (message.author.id == "357700219825160194" && message.content.startsWith("x!js ```js\n") && message.content.endsWith("```"))
    {
        const toEval = input.substring(6, input.length - 3);
        const author = { attachment: "./assets/authors/js.png", name: "author.png" };
        const attachments = [author];
        const embed = {
            author: { name: "x!js", icon_url: "attachment://author.png" },
            color: new Color().random().toInt() };

        try
        {
            const output = [];
            const print = function() {
                for (let i of arguments)
                {
                    output.push(i);
                }
            }
            const image = (canvas) => {
                const attachment = { attachment: canvas.toBuffer(), name: "image.png" };
                attachments.push(attachment);
                embed.image = { url: "attachment://image.png" };
            }

            const evaled = await eval(`(async () => { ${toEval} })()`);
            if (output == "")
            {
                embed.description = "```js\n" + JSON.stringify(evaled) + "```";
            }
            else
            {
                embed.description = "```md\n" + output.join("\n") + "```";
            }

            await message.reply({ embeds: [ embed ], files: attachments });
        }
        catch (err)
        {
            const stack = err.stack.split('\n');
            let a = stack.length;
            for (let i = 0; i < stack.length; i++)
            {
                if (stack[i].includes("at Client.emit"))
                {
                    a = i;
                    break;
                }
            }

            const Err = [];
            let b = false;
            for (let i = 1; i < a; i++)
            {
                Err.push(stack[i]);
                if (/<anonymous>:[0-9]+:[0-9]+/.test(stack[i]))
                {
                    const c = stack[i].match(/<anonymous>:[0-9]+:[0-9]+/)[0].split(':');
                    b = [toEval.split('\n')[Number(c[1]) - 1], Number(c[2]) - 1];
                }
            }

            if (!b)
            {
                embed.description = "```" + err + "``````\n" + Err.join("\n") + "```";
            }
            else
            {
                embed.description = "```" + err + "``````" + b[0] + '\n' + ' '.repeat(b[1]) + "^```";
            }
            await message.reply({ embeds: [ embed ], files: attachments });
        }
    }
}