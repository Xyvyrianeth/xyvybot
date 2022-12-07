import { db, bannedUsers, client } from "../Xyvy.js";

export const command = async (interaction) => {
    if (interaction.user.id != "357700219825160194")
	{
		return;
	}

    const id = interaction.options._hoistedOptions[0].value;
	const user = client.users.cache.get(id);
    const query = `INSERT INTO bannedids (id)\nVALUES ('${id}')`;

    await db.query(query);

	bannedUsers.push(id);
	interaction.reply(`${user} successfully banned from using the commands /bug and /request`);
}