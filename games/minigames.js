import { Collection } from "discord.js";
import { Xyvybot, COMPONENT_TYPE, BUTTON_STYLE } from "../index.js";
import { Color } from "../assets/misc/color.js";
import { deleteMessage } from "../index/discordFunctions.js";
import allWords from "../assets/misc/dictionary.json" assert { type: "json" };
import { drawBoard as drawNumbers } from "../assets/misc/drawLetters.js";
import { drawBoard as drawLetters } from "../assets/misc/drawLetters.js";
export const miniGames = new Collection();
const margin = 5;

const interval = () => {
    miniGames.forEach(async (miniGame, id) => {
        if (--miniGame.timer > 0)
        {
            return;
        }

        if (miniGame.type == "trivia")
        {
            if (miniGame.completed)
            {
                miniGames.delete(id);
                return;
            }

            const channel = await Xyvybot.channels.fetch(miniGame.channelId);
            const message = await channel.messages.fetch(miniGame.messageId);

            const newEmbed = message.embeds[0].toJSON();
            newEmbed.description = "Nobody got it in time";
            newEmbed.fields[1] = { name: "Wrong People", value: miniGame.wrongPeople.length > 0 ? `<@${miniGame.wrongPeople.join("> <@")}>` : "Nobody got it wrong either" };
            const newComponents = message.components.map(component => {
                const button = component.toJSON();
                button.components[0].disabled = button.components[0].custom_id !== "trivia.correct";
                button.components[0].style = button.components[0].custom_id == "trivia.correct" ? 3 : 4;
                return button;
            });

            message.edit({ embeds: [newEmbed], components: newComponents, attachments: [] });
            miniGames.delete(id);
        }

        if (miniGame.type == "letters")
        {
            const channel = await Xyvybot.channels.fetch(miniGame.channelId);
            const message = await channel.messages.fetch(miniGame.messageId);

            if (miniGame.letters.length !== 9)
            {
                miniGames.delete(id);
                deleteMessage(message);
                return;
            }

            const possibleWords = allWords.filter(word => {
                if (word.split('').some(letter => !miniGame.letters.includes(letter)))
                {
                    return false;
                }

                const usedLetters = word.split('');
                const availableLetters = miniGame.letters.concat();
                for (const letter of usedLetters)
                {
                    const i = availableLetters.indexOf(letter);
                    if (i !== -1)
                    {
                        availableLetters[i] = false;
                    }
                    else
                    {
                        return false;
                    }
                };
                return true;
            });
            const longestPossible = possibleWords.sort((a, b) => b.length - a.length)[0].length;
            const longestWords = possibleWords.filter(word => word.length == longestPossible);

            const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/letters.png", name: "author.png" };
            const attachment = { attachment: await drawLetters(miniGame.letters), name: "board.png" };
            const embed = {
                author: { name: "letters", icon_url: "attachment://author.png" },
                image: { url: "attachment://board.png" },
                description: `Time's up!`,
                fields: [
                {   name: "Results",
                    value: Object.keys(miniGame.attempts).map(userId => {
                        const attempt = miniGame.attempts[userId];
                        const satisfactory =
                            allWords.includes(attempt) ?
                                ":white_check_mark:" :
                                ":x:";
                        return `${satisfactory} <@${userId}> – ${attempt.length}\n${"\u200b ".repeat(margin)}\`${attempt.toUpperCase()}\``;
                    }).sort((a, b) => {
                        const aLength = a.split('\n')[1].length;
                        const bLength = b.split('\n')[1].length;
                        if (aLength > bLength) return -1;
                        if (aLength < bLength) return 1;
                        if (a.includes(":white_check_mark:") && b.includes(":x:")) return -1;
                        if (a.includes(":x:") && b.includes(":white_check_mark:")) return 1;
                    }).join('\n') || "No one answered in time" },
                {   name: `Longest Possible — ${longestPossible} Letters`,
                    value: `\`${longestWords.join('` \u200b `')}\`` } ] };
            const actionRow = {
                type: COMPONENT_TYPE.ACTION_ROW,
                components: [
                {   type: COMPONENT_TYPE.BUTTON,
                    style: BUTTON_STYLE.GREEN,
                    label: "TRY ANOTHER",
                    customId: "letters.restart" } ] };

            message.edit({ embeds: [embed], files: [author, attachment], components: [], attachments: [] });
            miniGames.delete(id);
            return;
        }

        if (miniGame.type == "numbers")
        {
            const channel = await Xyvybot.channels.fetch(miniGame.channelId);
            const message = await channel.messages.fetch(miniGame.messageId);

            if (miniGame.numbers.length !== 6)
            {
                miniGames.delete(id);
                deleteMessage(message);
                return;
            }

            const value = Object.values(miniGame.attempts).some(value => value == miniGame.target) ?
                miniGame.attempts[Object.keys(miniGame.attempts).filter(a => miniGame.attempts[a][0] == miniGame.target)[0]][1] :
                miniGame.solution[1];
            const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/numbers.png", name: "author.png" };
            const attachment = { attachment: await drawNumbers(miniGame.numbers, miniGame.target), name: "board.png" };
            const embed = {
                author: { name: "numbers", icon_url: "attachment://author.png" },
                description: "Times up!",
                image: { url: "attachment://board.png" },
                fields: [
                {   name: "Results",
                    value: Object.keys(miniGame.attempts).map(userId => {
                        const attempt = miniGame.attempts[userId];
                        const closeness =
                            attempt[0] == miniGame.target ?
                                ":white_check_mark:" :
                            Math.abs(miniGame.target - attempt[0]) <= 10 ?
                                ":negative_squared_cross_mark:" :
                                ":x:";
                        return `${closeness} <@${userId}> – ${attempt[0]}\n${"\u200b ".repeat(margin)}\`${attempt[1]}\``;
                    }).sort((a, b) => {
                        const aResult = Number(a.split('\n')[0].match(/[0-9]+/g)[1]);
                        const bResult = Number(b.split('\n')[0].match(/[0-9]+/g)[1]);
                        const aDist = Math.abs(miniGame.target - aResult);
                        const bDist = Math.abs(miniGame.target - bResult);
                        return aDist - bDist;
                    }).join('\n') || "No one answered in time" } ] };
            const actionRow = {
                type: COMPONENT_TYPE.ACTION_ROW,
                components: [
                {   type: COMPONENT_TYPE.BUTTON,
                    style: BUTTON_STYLE.GREEN,
                    label: "TRY ANOTHER",
                    customId: "numbers.restart" } ] };

            
            const bestSolution = {
                name: `Solution — ${miniGame.solution[0] == miniGame.target ? miniGame.target + " (Exact)": " (Closest Possible)"}`,
                value: `${"\u200b ".repeat(margin)}\`${value}\`` };
            if (!Object.keys(miniGame.attempts).some(userId => miniGame.attempts[userId][0] == miniGame.solution[0]))
            {
                embed.fields.push(bestSolution);
            }

            message.edit({ embeds: [embed], files: [author, attachment], components: [], attachments: [] });
            miniGames.delete(id);
            return;
        }

        if (miniGame.type == "hangman")
        {
            const display = [];
            for (let i = 0; i < miniGame.answer.length; i++)
            {
                if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/.test(miniGame.answer[i]))
                {
                    display.push("__" + miniGame.answer[i] + "__");
                }
                else
                {
                    display.push(miniGame.answer[i]);
                }
            }

            const hangman = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/hangman/7.png", name: "hangman.png" };
            const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/hangman.png", name: "author.png" };
            const embed = {
                author: { name: "hangman", icon_url: "attachment://author.png" },
                thumbnail: { url: "attachment://hangman.png" },
                fields: [ { name: "Looks like nobody's playing anymore!", value: `**${display.join("\u200b \u200b")}**\n\n**__Guesses__**: \`${miniGame.guesses.join("` `")}\`` } ],
                color: new Color("#FF6666").toInt() };
            const actionRow = {
                type: COMPONENT_TYPE.ACTION_ROW,
                components: [
                {   type: COMPONENT_TYPE.BUTTON,
                    style: BUTTON_STYLE.GREEN,
                    label: "TRY ANOTHER",
                    customId: "hangman" } ] };

            const channel = await Xyvybot.channels.fetch(miniGame.channelId);
            channel.send({ embeds: [embed], files: [hangman, author], components: [actionRow] });
            const messageId = await channel.messages.fetch(miniGame.messageId);
            deleteMessage(messageId);
            if (miniGame.hasOwnProperty("lastUserMessage")) {
                const lastUserMessage = await channel.messages.fetch(miniGame.lastUserMessage);
                deleteMessage(lastUserMessage);
            }
            miniGames.delete(id);
            return;
        }

        if (miniGame.type == "iq")
        {
            const channel = await Xyvybot.channels.fetch(miniGame.channelId);
            const message = await channel.messages.fetch(miniGame.messageId);
            const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/main/iq.png", name: "author.png" };
            const embed = {
                author: { name: "iq", icon_url: "attachment://author.png" },
                fields: [ { name: "Nobody got it in time!", value: miniGame.end } ],
                color: new Color("#FF6666").toInt() };
            const actionRow = {
                type: COMPONENT_TYPE.ACTION_ROW,
                components: [
                {   type: COMPONENT_TYPE.BUTTON,
                    style: BUTTON_STYLE.GREEN,
                    label: "TRY ANOTHER",
                    customId: "iq" } ] };

            channel.send({ embeds: [embed], files: [author], components: [actionRow] });
            miniGames.delete(id);
            deleteMessage(message);
            return;
        }
    });
}
setInterval(interval, 1000);