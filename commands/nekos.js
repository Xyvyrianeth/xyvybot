import { Color } from "../assets/misc/color.js";
import nekos from "nekos.life";
const Nekos = new nekos();

export const command = async (interaction) => {
	let neko = await Nekos.neko().catch(err => { url: "https://cdn.nekos.life/neko/neko_012.jpg" });
	let author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/nekos.png", name: "author.png" };
	let embed = {
		author: { name: "nekos", icon_url: "attachment://author.png" },
		image: { url: neko.url },
		description: "Have a neko!",
		footer: { text: "Powered by Nekos.Life" },
		color: new Color().random().toInt() };

	const actionRow = {
		type: 1,
		components: [
			{	type: 2,
				label: "Get another!",
				customId: "nekos",
				style: 1 } ] };

	if (interaction.isCommand())
	{
		interaction.reply({ embeds: [embed], files: [author], components: [actionRow] });
	}
	else
	{
		interaction.message.edit({ embeds: [embed], files: [author], components: [actionRow] });
		return interaction.deferUpdate();
	}
};