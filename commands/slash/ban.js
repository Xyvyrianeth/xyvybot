import { dataBase, bannedUsers, Xyvybot } from "../../index.js";

export const command = async (interaction) => {
    if (interaction.user.id != "357700219825160194")
	{
		return;
	}

    const id = interaction.options._hoistedOptions[0].value;
	const user = await Xyvybot.users.fetch(id);
    const query = `INSERT INTO bannedids (id)\nVALUES ('${id}')`;

    await dataBase.query(query);

	bannedUsers.push(id);
	interaction.reply(`${user} successfully banned from using the commands /bug and /request`);
}

const usersThatAreBanned = (await dataBase.query("SELECT * FROM bannedusers")).rows;
usersThatAreBanned.forEach(userThatIsBanned => {
	bannedUsers.push(userThatIsBanned.id);
});