import { Color } from "../assets/misc/color.js";
import { client, bannedUsers } from "../index.js";
export const command = (interaction) => {
	if (bannedUsers.includes(interaction.user.id))
	{
		return interaction.reply({ content: "You have been barred from using this command", ephemeral: true });
	}

	const command = interaction.options._hoistedOptions.find(option => option.name == "command").value;
	const description = interaction.options._hoistedOptions.find(option => option.name == "description").value;
	const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/bug.png", name: "author.png" };
	const embed = {
		author: { name: `${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`, icon_url: "attachment://author.png" },
		title: "Bug Report",
		description: `**Command**: ${command}\n\n${description}`,
		color: new Color().random().toInt() };
	client.channels.cache.get("848093706849353748").send({ embeds: [embed], files: [author] });
	return interaction.reply({ content: "Bug report sent! Thanks for helping out!", ephemeral: true });
};