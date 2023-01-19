import { client, db, emoji } from "../index.js";
import { Color } from "../assets/misc/color.js";
import { replayImage } from "../games/replayImage.js";

export const command = async (interaction) => {
	const command = interaction.customId.split('.');

	if (command[1] == "init" && interaction.user.id != command[3])
	{
		return interaction.reply({ content: `You cannot use this interaction; it belongs to ${interaction.message.interaction.user}.`, ephemeral: true });
	}
	if (command[1] != "init" && interaction.user.id != interaction.message.components[0].components[2].customId.split('.')[3])
	{
		return interaction.reply({ content: `You cannot use this interaction; it belongs to <@${interaction.message.components[0].components[2].customId.split('.')[3]}>.`, ephemeral: true });
	}
	if (command[2] == "current")
	{
		return interaction.deferUpdate();
	}

	const selectQuery = `SELECT *\nFROM matches\nWHERE id = '${command[2]}'`;
	const { rows } = await db.query(selectQuery);
	const match = rows[0];
	const Match = {
		id: match.id,
		game: { "othello": "Othello",
				"squares": "Squares",
				"rokumoku": "Rokumoku",
				"ttt3d": "3D Tic-Tac-Toe",
				"connect4": "Connect Four",
				"ordo": "Ordo",
				"soccer": "Paper Soccer",
				"loa": "Lines of Action",
				"latrones": "Latrones",
				"spiderlinetris": "Spider Linetris" }[match.game],
		replay: match.replay,
		players: [await client.users.fetch(match.players[0]), await client.users.fetch(match.players[1])],
		winner: match.winner == "undefined" ? false : (await client.users.fetch(match.winner)) };
	const turn = command[1] == "init" ? 0 : Number(command[3]);
	const attachment = { attachment: await replayImage(match.game, interaction.id, false, match.replay, turn), name: "replay.png" };
	const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/history.png", name: "author.png" };
	const description = `Match ID: \`${Match.id}\`\nGame: ${Match.game}\n${Match.players[0]} VS ${Match.players[1]}\nWINNER: ${Match.winner}\n\nTurn \`${turn}\` of \`${Match.replay.length}\``
	const actionRow = {
		type: 1,
		components: [
		// {	type: 2,
		// 	emoji: emoji.previous_3,
		// 	style: 1,
		// 	customId: `replay.turn.${Match.id}.0.first`,
		// 	disabled: turn == 0 },
		{	type: 2, style: 1,
			emoji: emoji.previous_2,
			customId: `replay.turn.${Match.id}.${turn - 10 < 0 ? 0 : turn - 10}.skipback`,
			disabled: turn == 0 },
		{	type: 2, style: 1,
			emoji: emoji.previous_1,
			customId: `replay.turn.${Match.id}.${turn - 1}.previous`,
			disabled: turn == 0 },
		{	type: 2, style: 3,
			label: String(turn),
			customId: `replay.turn.current.${interaction.user.id}` },
		{	type: 2, style: 1,
			emoji: emoji.next_1,
			customId: `replay.turn.${Match.id}.${turn + 1}.next`,
			disabled: turn == Match.replay.length },
		{	type: 2, style: 1,
			emoji: emoji.next_2,
			customId: `replay.turn.${Match.id}.${turn + 10 > Match.replay.length ? Match.replay.length : turn + 10}.skipforward`,
			disabled: turn == Match.replay.length } ] };
		// {	type: 2,
		// 	emoji: emoji.next_3,
		// 	style: 1,
		// 	customId: `replay.turn.${Match.id}.${Match.replay.length}.last`,
		// 	disabled: turn == Match.replay.length } ] };
	const embed = {
		author: { name: "replay", icon_url: "attachment://author.png", },
		description: description,
		image: { url: `attachment://replay.png` },
		color: new Color().random().toInt() };

	await interaction.message.edit({ embeds: [embed], components: [actionRow], files: [author, attachment], attachments: [] });
	await interaction.deferUpdate();
}