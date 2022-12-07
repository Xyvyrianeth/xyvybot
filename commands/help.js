import { Color } from "../assets/misc/color.js";
import { client, version } from "../Xyvy.js";
import { commands } from "../assets/misc/helpCommands.js";

export const command = async (interaction) => {
	if (interaction.options._hoistedOptions.length == 0)
	{
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/help.png", name: "author.png" };
		const embed = {
			author: { name: "xyvybot | All supported commands", icon_url: "attachment://author.png" },
			fields: [
				{ name: "\u200b", value: "__**Featured Games**__\n`othello`\n`squares`\n`3dtictactoe`\n`connect4`\n`rokumoku`\n`ordo`\n`papersoccer`\n`linesofaction`\n`latrones`\n`spiderlinetris`", inline: true },
				{ name: "\u200b", value: "__**Possible Future Games**__\n[Go](https://en.wikipedia.org/wiki/Go_(game))\n\n__**Related Commands**__\n`games`\n`profile`\n`leaderboard`\n`history`", inline: true },
				{ name: "\u200b", value: "================================", inline: false },
				{ name: "\u200b", value: "__**Minigames**__\n`hangman`\n`trivia`\n`letters`\n`numbers`\n`minesweeper`\n`iq`\n\n__**Miscellaneous**__\n`nekos`\n`graph`\n`credits`", inline: true },
				{ name: "\u200b", value: "__**Utility**__\n`help`\n`setup`\n`request`\n`bug`", inline: true } ],
			color: new Color().random().toInt() };

		// if (client.channels.cache.get(interaction.channelId)?.type == "DM" || client.channels.cache.get(interaction.channelId).nsfw)
		// {
		// 	// embed.fields.push({ name: "NSFW", value: `NSFW command only available in DMs or NSFW-marked channels (if you're seeing this, then you can use it here). Say \"x!nsfw help\" for a list of all the lewds I'm capable of.` });
		// 	embed.fields.push({ name: "NSFW", value: "The NSFW command will be unavailable for the forseeable future. Nekos.life has been scrubbed of its NSFW content by CloudFlare and their NSFW features are no longer usable." });
		// }

		return interaction.reply({ embeds: [embed], files: [author] });
	}
	else
	{
		const command = commands.get(interaction.options._hoistedOptions[0].value);
		const embed = {
			color: new Color().random().toInt(),
			footer: { text: "Xyvybot version " + version + " | † = field is optional" },
			fields: [] };

        if (command == undefined)
        {
			embed.author = { name: "help", icon_url: "attachment://author.png" };
			embed.description = "Unknown command.";

			return interaction.reply({ embeds: [embed] });
        }

		if (command.name == "nsfw" && client.channels.cache.get(interaction.channelId).type != "DM" && !client.channels.cache.get(interaction.channelId).nsfw)
		{
			return interaction.reply("You cannot use that in this channel.");
		}

        for (const field of command.fields)
		{
			embed.fields.push({ name: field.title, value: field.body, inline: field.inline });
		}

		if (command.attachment)
		{
			embed.image = { url: `https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/help/${command.name}.png` };
		}

        embed.author = { name: command.name, icon_url: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/help.png" };
        embed.description = command.description;

        return interaction.reply({ embeds: [embed] });

	}
};