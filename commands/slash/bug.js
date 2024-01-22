import { Color } from "../../assets/misc/color.js";
import { Client, bannedUsers } from "../../index.js";

export const command = async (interaction) => {
    if (bannedUsers.includes(interaction.user.id))
    {
        await interaction.reply({ content: "You have been barred from using this command", ephemeral: true });
        return;
    }

    const channel = await Xyvybot.channels.fetch("848093706849353748");
    const command = interaction.options._hoistedOptions.find(option => option.name == "command").value;
    const description = interaction.options._hoistedOptions.find(option => option.name == "description").value;
    const author = { attachment: "./assets/authors/bug.png", name: "author.png" };
    const embed = {
        author: { name: `${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`, icon_url: "attachment://author.png" },
        title: "Bug Report",
        description: `**Command**: ${command}\n\n${description}`,
        color: new Color().random().toInt() };
    await channel.send({ embeds: [ embed ], files: [ author ] });
    await interaction.reply({ content: "Bug report sent! Thanks for helping out!", ephemeral: true });
    return;
};