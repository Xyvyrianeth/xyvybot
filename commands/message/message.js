"use strict";

import { Client, COMPONENT, BUTTON_STYLE } from "../../index.js";
import { Rules } from "../../games/rules.js";
import { Color } from "../../assets/misc/color.js";
import { Games } from "../../games/games.js";
import { miniGames } from "../../games/minigames.js";
import slashCommandData from "../../assets/misc/slashCommandData.json" assert { type: "json" };
import { deleteMessage } from "../../index/discordFunctions.js";
import emoji from "../../assets/misc/emoji.json" assert { type: "json" };
import { drawBoard } from "../../assets/misc/drawLetters.js";

export const command = async (message) => {
    if (message.author.id == Client.user.id)
    {
        if (message.embeds[0]?.image)
        {
            const img = message.embeds[0].image.url;
            const reg = /(?:connect4|squares|othello|rokumoku|ttt3d|ordo|soccer|loa|latrones)_[0-3]_([0-9]+)\.png$/;
            if (message.channel.type == "GUILD_TEXT" && reg.test(img))
            {
                const id = img.match(reg)[1];
                const Game = Games.get(id);
                Game.messages[Game.channels.indexOf(message.channelId)].push(message.id);
            }
            return;
        }

        if (message.content.startsWith("**__Illegal Play__**\n"))
        {
            const Game = Games.find(game => game.channels.includes(message.channelId));
            Game.messages[Game.channels.indexOf(message.channelId)].push(message.id);
            return;
        }

        if (/(letter|number|compute)/.test(message.content))
        {
            setTimeout(() => { deleteMessage(message); }, 10000);
            return;
        }

        if (/(hangman)/.test(message.embeds[0]?.author.name) && miniGames.some(miniGame => miniGame.channelId == message.channelId))
        {
            const miniGame = miniGames.find(miniGame => miniGame.channelId == message.channelId);
            miniGame.lastBotMessage = message.id;
        }

        return;
    }

    if (message.author.bot)
    {
        return;
    }

    const channel = await Client.channels.fetch(message.channelId);
    if (channel.guildId !== null && !channel.permissionsFor(Client.user.id).has([1n << 11n, 1n << 15n]))
    {
        return;
    }
    if (channel.guildId == null && message.attachments.size > 0)
    {
        const images = Array.from(message.attachments).map(m => m[1].url);
        const owner = await Client.users.fetch("357700219825160194");
        return owner.send(`Images from user ${message.author}: \n${images.join('\n')}`);
    }

    if ((message.content == "x!setCommands" || message.content == "x!removeCommands") && ["357700219825160194"].includes(message.author.id))
    {
        const successfulServers = [];
        const failedServers = [];

        if (Client.user.id == "398606274721480725")
        {
            Client.application.commands.set(message.content == "x!setCommands" ? slashCommandData : []).then(console.log);

            const author = { attachment: "./assets/authors/_template.png", name: "author.png" };
            const embed = {
                author: { name: "x!setCommands", icon_url: "attachment://author.png" },
                description: `__Successfully updated commands for all servers__`,
                color: new Color().random().toInt() };
            return await message.reply({ embeds: [ embed ], files: [ author ] });
        }
        else
        {
            for (let guild of Client.guilds.cache)
            {
                try
                {
                    await guild[1].commands.set(message.content == "x!setCommands" ? slashCommandData : []);
                    successfulServers.push(guild[1].name);
                }
                catch (error)
                {
                    failedServers.push([guild[1].name, error.stack.split('\n')[0].split(': ')[1]]);
                }
            }

            const author = { attachment: "./assets/authors/_template.png", name: "author.png" };
            const embed = {
                author: { name: "x!setCommands", icon_url: "attachment://author.png" },
                description: `__Successfully updated commands for__:\n- ${successfulServers.join('\n- ')}\n\n` +
                            `__Failed to update commands for__:\n- ${failedServers.map(server => server[0] + " — " + server[1]).join('\n- ')}`,
                color: new Color().random().toInt() };
            return await message.reply({ embeds: [ embed ], files: [ author ] });
        }
    }
    if (message.content.startsWith("x!js") && ["357700219825160194"].includes(message.author.id))
    {
        // return await Commands.message.get("js")(message.content.substring(5), message);
        return await import(`./js.js`).then(module => module.command(message.content.substring(5), message));
    }
    if (message.content.startsWith("x!pg") && ["357700219825160194"].includes(message.author.id))
    {
        // return await Commands.message.get("pg")(message.content.substring(5), message);
        return await import(`./pg.js`).then(module => module.command(message.content.substring(5), message));
    }

    if (Games.some(Game => Game.player == message.author.id && Game.channels.includes(message.channelId) && Game.canHaveTurn))
    {
        const Game = Games.find(Game => Game.player == message.author.id && Game.channels.includes(message.channelId));
        if (!Game)
        {
            return;
        }

        const regEx = {
            "squares": /^([a-h] ?[1-8]|[1-8] ?[a-h])$/i,
            "othello": /^([a-h] ?[1-8]|[1-8] ?[a-h])$/i,
            "rokumoku": /^([a-s] ?1?[0-9]+|1?[0-9]+ ?[a-s])$/i,
            "connect4": [/^([a-h] ?[1-8]|[1-8] ?[a-h])$/, /^([a-g] ?[1-6]|[1-6] ?[a-g])$/][Game.ruleset.size],
            "ttt3d": /^[1-4] ?([1-4] ?[a-d]|[a-d] ?[1-4])$/i,
            "ordo": /^(([a-j][1-8] [a-j][1-8]|[1-8][a-j] [1-8][a-j])|([a-j][1-8]-[a-j][1-8]|[1-8][a-j]-[1-8][a-j]) (up|right|down|left|[urdl]|north|south|east|west|[nsew]) [1-9])$/i,
            "soccer": /^([1-8]|([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?))$/i,
            "loa": /^([1-8][a-h]|[a-h][1-8]) ([1-8]|([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?))$/i,
            "latrones": /^(([1-8][a-h]|[a-h][1-8])|([1-8][a-h]|[a-h][1-8]) (up|right|down|left|north|south|east|west|[udlrnsew])|(up|right|down|left|north|south|east|west|[udlrnsew])|([1-8][a-h]|[a-h][1-8]) (remove|capture|cap|delete)|(end|stop))$/i,
            "slinetris": /^([a-h] ?[1-8]|[1-8] ?[a-h])$/i
        }[Game.game];

        if (!regEx.test(message.content))
        {
            return;
        }

        try
        {
            return await Rules.playerTurn(Game.id, message);
        }
        catch (error)
        {
            console.log(error);
            const author = { attachment: "./assets/misc/avatar.png", name: "author.png" };
            const embed = {
                author: { name: "Xyvybot", icon_url: "attachment://author.png" },
                title: "Error in game: " + Game.name,
                description: "Well, I appear to have made an error somewhere. Don't worry, though, these things usually get fixed pretty soon.\nFor everyone's sake, this match has been ended. You can have a rematch soon when the issue has been resolved.",
                color: new Color().random().toInt() };

            Game.channels.forEach(async channelId => {
                const Channel = await Client.channels.fetch(channelId);
                await Channel.send({ embeds: [ embed ], files: [ author ] });
            });

            const err = error.stack.split('\n');
            const errs = err.splice(err.indexOf(err.find(a => a.includes("at Client.emit"))));
            Games.delete(Game.id);
            return console.log(err, '\n', errs.join('\n'));
        }

        if (/(quit|leave|stop|forfeit|secede)/i.test(message.content))
        {
            return quit(false, message);
        }
    }

    if (/^[a-z]{1,9}$/.test(message.content.toLowerCase()) && miniGames.some(miniGame => miniGame.channelId == message.channelId && miniGame.type == "letters"))
    {
        const miniGame = miniGames.find(miniGame => miniGame.channelId == message.channelId && miniGame.type == "letters");
        const word = message.content.toLowerCase();
        const userId = message.author.id;
        deleteMessage(message);

        const user = await Client.users.fetch(userId);
        const channel = await Client.channels.fetch(miniGame.channelId)
        const Message = await channel.messages.fetch(miniGame.messageId);
        const usedLetters = word.split('');
        const availableLetters = miniGame.letters.concat();
        for (const l of usedLetters)
        {
            const L = l.toUpperCase();
            const i = availableLetters.indexOf(l);
            if (i !== -1)
            {
                availableLetters[i] = false;
            }
            else
            if (miniGame.letters.includes(l))
            {
                return await channel.send({ content: `${user} You cannot use letters more times than they appear — \`${L}\` used too many times` });
            }
            else
            {
                return await channel.send({ content: `${user} \`${L}\` is not an available letter` });
            }
        }

        if (!miniGame.attempts.hasOwnProperty(user.id))
        {
            miniGame.attempts[user.id] = word;
        }
        else
        if (word.length > miniGame.attempts[user.id].length)
        {
            miniGame.attempts[user.id] = word;
        }

        const attempts = [];
        Object.keys(miniGame.attempts).forEach(userId => attempts.push(`<@${userId}> – ${miniGame.attempts[userId].length}`));

        const author = { attachment: "./assets/authors/letters.png", name: "author.png" };
        const attachment = { attachment: await drawBoard(miniGame.letters), name: "board.png" };
        const embed = {
            author: { name: "letters", icon_url: "attachment://author.png" },
            image: { url: "attachment://board.png" },
            description: `Time's up <t:${(Date.now() / 1000 | 0) + miniGame.timer}:R>`,
            fields: [ { name: "Attempts", value: attempts.sort((a, b) => { return b[b.length - 1] - a[a.length - 1] }).join('\n') } ],
            color: new Color().random().toInt() };

        return await Message.edit({ embeds: [ embed ], files: [ author, attachment ], attachments: [] });
    }
    if (/^[0-9+\-*x/() ]+$/.test(message.content) && miniGames.some(miniGame => miniGame.channelId == message.channelId && miniGame.type == "numbers"))
    {
        const miniGame = miniGames.find(miniGame => miniGame.channelId == message.channelId && miniGame.type == "numbers");
        const equation = message.content;
        const userId = message.author.id;
        deleteMessage(message);

        const user = await Client.users.fetch(userId);
        const channel = await Client.channels.fetch(miniGame.channelId)
        const Message = await channel.messages.fetch(miniGame.messageId);
        const usedNumbers = equation.match(/[0-9]+/g);
        const availableNumbers = miniGame.numbers.concat();

        if (usedNumbers.length == 1)
        {
            return await channel.send({ content: `${user} You need to actually perform an operation` });
        }
        for (const n of usedNumbers)
        {
            const N = Number(n);
            const i = availableNumbers.indexOf(N);
            if (i !== -1)
            {
                availableNumbers[i] = false;
            }
            else
            if (miniGame.numbers.includes(N))
            {
                return await channel.send({ content: `${user} You cannot use numbers more times than they appear — \`${n}\` used too many times`, ephemeral: true });
            }
            else
            {
                return await channel.send({ content: `${user} \`${n}\` is not an available number`, ephemeral: true });
            }
        }

        const result = Math.calculate(equation.replace(/x/g, '*'));
        if (result[0] == "err")
        {
            return await channel.send({ content: `${user} Your answer does not compute`, ephemeral: true });
        }

        if (!miniGame.attempts.hasOwnProperty(user.id))
        {
            miniGame.attempts[user.id] = [result[1], equation];
        }
        else
        if (Math.abs(miniGame.target - miniGame.attempts[user.id][0]) > Math.abs(miniGame.target - result[1]))
        {
            miniGame.attempts[user.id] = [result[1], equation];
        }

        const attempts = [];
        for (const i in miniGame.attempts)
        {
            attempts.push(`<@${i}> – ${miniGame.attempts[i][0]}`);
        }

        const emojis = `:zero: :one: :two: :three: :four: :five: :six: :seven: :eight: :nine: :keycap_ten: <:${emoji.twentyfive.name}:${emoji.twentyfive.id}> <:${emoji.fifty.name}:${emoji.fifty.id}> <:${emoji.seventyfive.name}:${emoji.seventyfive.id}> <:${emoji.onehundred.name}:${emoji.onehundred.id}>`.split(' ');
        const description = [];
        for (let i = 0; i < 6; i++)
        {
            const n = miniGame.numbers[i];
            description.push(n === undefined ? ":stop_button:" : emojis[n <= 10 ? n : n / 25 + 10]);
            description.push(" \u200b ");
        }
        description.pop();

        const author = { attachment: "./assets/authors/numbers.png", name: "author.png" };
        const embed = {
            author: { name: "numbers", icon_url: "attachment://author.png" },
            description: `Times up <t:${(Date.now() / 1000 | 0) + miniGame.timer}:R>\n\nTarget: ${emojis[String(miniGame.target)[0]]}${emojis[String(miniGame.target)[1]]}${emojis[String(miniGame.target)[2]]}\n\n${description.join('')}`,
            fields: [ { name: "Attempts", value: attempts.sort((a, b) => { return b[b.length - 1] - a[a.length - 1] }).join('\n') } ],
            color: new Color().random().toInt() };

        return await Message.edit({ embeds: [ embed ], files: [ author ], attachments: [] });
    }

    if (miniGames.some(miniGame => miniGame.type == "hangman" && miniGame.channelId == message.channelId))
    {
        const miniGame = miniGames.find(miniGame => miniGame.channelId == message.channelId && miniGame.type == "hangman");
        const guess = message.content.toUpperCase();
        const fullGuess = guess == miniGame.answer.join('').replace(/[\u0300-\u036f]/g, '').toUpperCase();
        if (!fullGuess && guess.length > 1)
        {
            return;
        }

        if (/^[A-Z0-9]$/i.test(guess))
        {
            if (miniGame.guesses.includes(guess))
            {
                return;
            }
            miniGame.guesses.push(guess);
        }

        const lastBotMessage = await message.channel.messages.fetch(miniGame.lastBotMessage);
        const lastUserMessage = miniGame.first ? undefined : await message.channel.messages.fetch(miniGame.lastUserMessage);

        const validGuess = miniGame.answer.some(a => a.replace(/[\u0300-\u036f]/g, '') == guess);
        const previousGuesses = miniGame.guesses.length > 0 ? `__**Guesses**__\n\`${miniGame.guesses.join("` `")}\`` : "__**Guesses**__\nNone";
        miniGame.wrongGuessesLeft -= validGuess ? 0 : 1;

        miniGame.current = miniGame.answer.map((letter, i) => fullGuess || (letter.replace(/[\u0300-\u036f]/g, '') == guess && miniGame.current[i] == false) ? letter : miniGame.current[i]);
        const finalGuess = validGuess && !miniGame.current.includes(false);
        miniGame.complete = fullGuess || finalGuess || miniGame.wrongGuessesLeft == 0;
        const gameAction = miniGame.complete ? fullGuess ?
            `${message.author} has correctly guessed the whole ${miniGame.answer.includes(' ') ? "phrase" : "word"}!` : finalGuess ?
            `${message.author} has guessed the last remaining character!` : miniGame.wrongGuessesLeft == 0 ?
            "You guessed too many incorrect letters!" : '' : '';
        const title = miniGame.complete ?
            `Solved!` : validGuess ?
            `${guess} is in the ${miniGame.answer.includes(' ') ? "phrase" : "word"}!` :
            `${guess} is not in the ${miniGame.answer.includes(' ') ? "phrase" : "word"}!`;
        const color = miniGame.complete ? "#22cc77" : validGuess ? "#6666ff" : miniGame.wrongGuessesLeft == 0 ?  "#ff6666" : "#ffff66";
        const guessesLeft = miniGame.complete ? '' : `\`${miniGame.wrongGuessesLeft}\` wrong guess${miniGame.wrongGuessesLeft > 1 ? "es" : ''} left\n`;
        const timerMessage = miniGame.complete ? '' : `Time's up <t:${(Date.now() / 1000 | 0) + 180}:R>\n`;
        miniGame.lastUserMessage = message.id;

        const display = miniGame.answer.map((letter, i) => miniGame.current[i] === false ? "__\u200b \u200b \u200b \u200b__" : /^[A-Z0-9][\u0300-\u036f]$/i.test(letter) ? "__" + letter + "__" : letter);
        const thumbnail = { attachment: "./assets/hangman/" + miniGame.wrongGuessesLeft + ".png", name: "hangman.png" };
        const author = { attachment: "./assets/authors/hangman.png", name: "author.png" };
        const embed = {
            author: { name: "hangman", icon_url: "attachment://author.png" },
            thumbnail: { url: "attachment://hangman.png" },
            fields: [ { name: title, value: [
                gameAction,
                `**${display.join("\u200b \u200b")}**`,
                `Category: **${miniGame.category}**${!miniGame.complete && miniGame.answer.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!" : ""}`,
                '',
                timerMessage + guessesLeft + previousGuesses ].join('\n') } ],
            color: new Color(color).toInt() };
        const components = miniGame.complete ? [
        {   type: COMPONENT.ACTION_ROW,
            components: [
            {   type: COMPONENT.BUTTON,
                style: BUTTON_STYLE.GREEN,
                label: "TRY ANOTHER",
                customId: "hangman" } ] } ] : [ ];

        message.channel.send({ embeds: [ embed ], files: [ thumbnail, author ], components: components });

        await deleteMessage(lastBotMessage, "lastBotMessage");
        if (!miniGame.first)
        {
            await deleteMessage(lastUserMessage, "lastUserMessage");
        }

        miniGame.first = false;

        if (miniGame.complete)
        {
            miniGames.delete(miniGame.id);
        }
        else
        {
            miniGame.timer = 180;
        }
        return;
    }
    if (miniGames.some(miniGame => miniGame.type == "iq" && miniGame.channelId == message.channelId && message.content.toUpperCase() == miniGame.answer))
    {
        const channel = await Client.channels.fetch(message.channelId);
        const Message = await channel.message.fetch(miniGame.messageId);
        const miniGame = miniGames.find(miniGame => miniGame.channelId == message.channelId && miniGame.type == "iq" && message.content.toUpperCase() == miniGame.answer);
        const author = { attachment: "./assets/authors/iq.png", name: "author.png" };
        const embed = {
            author: { name: "IQ", icon_url: "attachment://author.png" },
            fields: [
            {   name: "Correct!",
                value: `${message.author} got it right!\n${miniGame.end}` },
            {   name: "\u200b",
                value: "Completed in `" + (miniGame.sTime - miniGame.timer) + "` seconds",
                inline: true } ],
            color: new Color(46, 204, 113).toInt(),
            footer: { text: "Friendly reminder that IQ is not real, it's simply an appropriate name for this feature." } };
        const actionRow = {
            type: COMPONENT.ACTION_ROW,
            components: [
            {   type: COMPONENT.BUTTON,
                style: BUTTON_STYLE.GREEN,
                label: "TRY ANOTHER",
                customId: "iq" } ] };

        miniGames.delete(miniGame.id);
        await deleteMessage(Message);
        await message.reply({ embeds: [ embed ], files: [ author ], components: [ actionRow ], attachments: [] });
        return;
    }
}