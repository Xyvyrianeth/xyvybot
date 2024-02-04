import { Color } from "../../assets/misc/color.js";
import { Client, version } from "../../index.js";
import { commands } from "../../assets/misc/helpCommands.js";

export const command = async (interaction) => {
    if (interaction.options._hoistedOptions.length == 0)
    {
        const author = { attachment: "./assets/authors/help.png", name: "author.png" };
        const embed = {
            author: { name: "xyvybot | All supported commands", icon_url: "attachment://author.png" },
            fields: [
                { name: "\u200b", value: "__**Featured Games**__\n`othello`\n`squares`\n`3dtictactoe`\n`connect4`\n`rokumoku`\n`ordo`\n`papersoccer`\n`linesOfAction`\n`latrones`\n`spiderLinetris`", inline: true },
                { name: "\u200b", value: "__**Possible Future Games**__\n[Go](https://en.wikipedia.org/wiki/Go_(game))\n\n__**Related Commands**__\n`games`\n`profile`\n`leaderboard`\n`history`", inline: true },
                { name: "\u200b", value: "================================", inline: false },
                { name: "\u200b", value: "__**Minigames**__\n`hangman`\n`trivia`\n`letters`\n`numbers`\n`minesweeper`\n`iq`\n\n__**Miscellaneous**__\n`graph`\n`credits`", inline: true },
                { name: "\u200b", value: "__**Utility**__\n`help`\n`setup`\n`request`\n`bug`", inline: true } ],
            color: new Color().random().toInt() };

        // if (client.channels.cache.get(interaction.channelId)?.type == "DM" || client.channels.cache.get(interaction.channelId).nsfw)
        // {
        //     // embed.fields.push({ name: "NSFW", value: `NSFW command only available in DMs or NSFW-marked channels (if you're seeing this, then you can use it here). Say \"x!nsfw help\" for a list of all the lewds I'm capable of.` });
        //     embed.fields.push({ name: "NSFW", value: "The NSFW command will be unavailable for the forseeable future. Nekos.life has been scrubbed of its NSFW content by CloudFlare and their NSFW features are no longer usable." });
        // }

        return interaction.reply({ embeds: [ embed ], files: [ author ] });
    }
    else
    {
        const channel = await Client.channels.fetch(interaction.channelId);
        const command = commands.get(interaction.options._hoistedOptions[0].value);
        const author = { attachment: "./assets/authors/help.png", name: "author.png" };
        const attachment = { name: "attachment.png" };
        const embed = {
            color: new Color().random().toInt(),
            footer: { text: "Xyvybot version " + version + " | † = field is optional" },
            fields: [] };

        if (command == undefined)
        {
            embed.author = { name: "help", icon_url: "attachment://author.png" };
            embed.description = "Unknown command.";

            return interaction.reply({ embeds: [ embed ], files: [ author ] });
        }

        if (command.name == "nsfw" && channel.type != "DM" && !channel.nsfw)
        {
            return interaction.reply({ content: "You cannot use that in this channel.", ephemeral: true });
        }

        for (const field of command.fields)
        {
            embed.fields.push({ name: field.title, value: field.body, inline: field.inline });
        }

        if (command.attachment)
        {
            attachment.attachment = `./assets/help/${command.name}.png`;
            embed.image = { url: "attachment://attachment.png" };
        }

        embed.author = { name: command.name, icon_url: "attachment://author.png" };
        embed.description = command.description;

        return interaction.reply({ embeds: [ embed ], files: [ author, attachment ] });
    }
};