import { Color } from "../assets/misc/color.js";
import nekos from "nekos.life";
const Nekos = new nekos();
const Tags = Object.keys(Nekos.nsfw).sort();
const nsfwTags = Tags.map(tag => tag + ' '.repeat(16 - (tag.length % 16))).join('').trim();
exports.nsfwTags = nsfwTags;

export const command = async (interaction) => {
	var action, options;
	if (interaction.isCommand())
	{
		action = interaction.options._subcommand;
		options = interaction.options._hoistedOptions;
	}
	else
	{
		button = interaction.customId.split('.');
		action = button[1];
		options = button.splice(2);
	}

	switch (action)
	{
		case "tags":
		{
			const image = { attachment: (await Nekos.nsfw.eroNeko()).url, name: "image.png" };
			const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/nsfw.png", name: "author.png" };
			const embed = {
				author: { name: "nsfw tags", icon_url: "attachment://author.png" },
				description: "```\n" + nsfwTags + "```\n**Usage**: `x!nsfw [tag]`",
				image: { url: "attachment://image.png" },
				color: new Color().random().toInt(),
				footer: "Powered by Nekos.Life" };

			return interaction.reply({ embeds: [embed], files: [image, author] });
		}

		case "random":
		{
			const tag = interaction.isCommand() || options[0] == "random" ? Tags.random() : options[0];
			const image = await Nekos.nsfw[tag]();
			const attachment = { attachment: image.url, name: image.url.split('/')[image.url.split('/').length - 1] };
			const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/nsfw.png", name: "author.png" };
			const embed = {
				author: { name: "random nsfw tag", icon_url: "attachment://author.png" },
				description: `Tag: \`${tag}\``,
				image: { url: "attachment://" + attachment.name },
				color: new Color().random().toInt(),
				footer: "Powered by Nekos.Life" };
			const actionRow = {
				type: 1,
				components: [
				{	type: 2,
					label: "Click me for more of this!",
					style: 3,
					customId: "nsfw.random." + tag },
				{	type: 2,
					label: "Click me to try another tag!",
					style: 1,
					customId: "nsfw.random.random" } ] };

			if (interaction.isCommand())
			{
				interaction.reply({ embeds: [embed], files: [attachment, author], components: [actionRow] });
			}
			else
			{
				interaction.message.edit({ embeds: [embed], files: [attachment, author], components: [actionRow], attachments: [] });
				interaction.deferUpdate();
			}

			break;
		}

		case "search":
		{
			const input = interaction.isCommand() ? options[0].value : options[0];
			const tags = Tags.filter(t => t.toLowerCase().includes(interaction.isCommand() ? input.toLowerCase() : options[0].toLowerCase()));

			if (tags.length == 0)
			{
				return message.channel.send("Unknown tag");
			}

			const tag = tags.random();

			const image = await Nekos.nsfw[tag]();
			const attachment = { attachment: image.url, name: image.url.split('/')[image.url.split('/').length - 1] };
			const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/nsfw.png", name: "author.png" };
			const embed = {
				author: { name: "nsfw search", icon_url: "attachment://author.png" },
				description: `**Query**: \`${input}\`\n**Matched Tags**: \`${tags.join('`, `')}\`\n**Tag**: \`${tag}\``,
				image: { url: "attachment://" + attachment.name },
				color: new Color().random().toInt(),
				footer: "Powered by Nekos.Life" };
			const actionRow = {
				type: 1,
				components: [
				{	type: 2,
					label: "Click me for another one!",
					style: 3,
					customId: "nsfw.search." + input } ] };

			if (interaction.isCommand())
			{
				return interaction.reply({ embeds: [embed], files: [attachment, author], components: [actionRow] });
			}
			else
			{
				interaction.message.edit({ embeds: [embed], files: [attachment, author], components: [actionRow], attachments: [] });
				return interaction.deferUpdate();
			}
		}
	}
}