import { client, db, emoji } from "../index.js";
import { Color } from "../assets/misc/color.js";
import { drawTop } from "../assets/leaderboard/leaderboard.js";
import fs from "fs";

export const command = async (interaction) => {
	if ((interaction.isButton() || interaction.isSelectMenu()) && interaction.user.id != interaction.message.interaction.user.id)
	{
		return interaction.reply({ content: `You cannot use this interaction; it belongs to ${interaction.message.interaction.user}.`, ephemeral: true });
	}

	const customEmoji = client.channels.cache.get(interaction.channelId).permissionsFor(client.user.id).has(1n << 18n);
	const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/leaderboard.png", name: "author.png" };
	if (interaction.isCommand())
	{
		let embed = {
			author: { name: "Leaderboard", icon_url: "attachment://author.png" },
			description: `Generating Leaderboard ${customEmoji ? "<a:loading:1010988190250848276>" : ":hourglass:"}`,
			color: new Color().random().toInt() };
		await interaction.reply({ embeds: [embed], files: [author] });
	}
	else
	{
		const components = interaction.message.components.map(row => {
			row.components = row.components.map(component => {
				component.data.disabled = true;
				return component; }); return row; });
		const embed = {
			author: { name: "Leaderboard", icon_url: "attachment://author.png" },
			description: `Generating Leaderboard ${customEmoji ? "<a:loading:1010988190250848276>" : ":hourglass:"}`,
			color: new Color().random().toInt() };
		await interaction.update({ embeds: [embed], files: [author], components: components });
	}

	const games = ["othello", "squares", "rokumoku", "ttt3d", "connect4", "ordo", "soccer", "loa", "latrones", "spiderlinetris"];
	const information = {};
	if (interaction.isCommand())
	{
		const userID = interaction.options._hoistedOptions[0]?.value || interaction.user.id;
		information.player = await client.users.fetch(userID);
		information.game = "all";
		information.page = 1;

		if (!information.player)
		{
			return interaction.editReply({ content: "User not found", ephemeral: true })
		}
	}
	if (interaction.isButton())
	{
		const command = interaction.customId.split('.');
		information.player = await client.users.fetch(command[2]);
		information.game = command[3];
		information.page = Number(command[1]);
	}
	if (interaction.isSelectMenu())
	{
		const command = interaction.customId.split('.');
		information.player = await client.users.fetch(command[2]);
		information.page = 1;
		information.game = interaction.values[0];
	}

	const sum = information.game == "all" ? "(SELECT SUM(s) FROM UNNEST($1) s)" : `$1[${games.indexOf(information.game) + 1}]`;
	const top10Query = String(fs.readFileSync("./assets/leaderboard/top10.sql"))
		.replace(/\$(elos|wins|loss)/g, sum)
		.replace(/\$user/g, information.player.id)
		.replace(/\$page/g, (information.page - 1) * 10);
	const top10 = (await db.query(top10Query)).rows;
	const userCountQuery = "SELECT CAST(COUNT(id) as INT) AS usercount FROM profiles WHERE $wins + $loss > 0".replace(/\$(wins|loss)/g, sum);
	const userCount = (await db.query(userCountQuery)).rows[0].usercount;
	const playerQuery = String(fs.readFileSync("./assets/leaderboard/user.sql"))
		.replace(/\$(elos|wins|loss)/g, sum)
		.replace(/\$user/g, information.player.id);
	const player = (await db.query(playerQuery)).rows[0];

	if (userCount == 0)
	{
		const embed = {
			author: { name: "Leaderboard", icon_url: "attachment://author.png" },
			description: "__`NO RESULTS`__",
			color: new Color().random().toInt() };

		if (interaction.isCommand())
		{
			return interaction.editReply({ embeds: [embed], files: [author], attachments: [] });
		}
		else
		{
			interaction.message.edit({ attachments: [] });
			return interaction.message.edit({ embeds: [embed], files: [author], attachments: [] });
		}
	}
	else
	{
		const users = [];
		for (let i in top10)
		{
			const id = top10[i].id;
			const elo = information.game == "all" ? Number(top10[i].elo) / games.length | 0 : Number(top10[i].elo);
			const win = Number(top10[i].win);
			const los = Number(top10[i].los);
			const w_l = win + los > 0 ? ((win / (win + los)) * 100).toFixed(2) + '%' : "\u200b \u200b N/A \u200b \u200b";
			const placeQuery = String(fs.readFileSync("./assets/leaderboard/place.sql")).replace(/\$(elos|wins|loss)/g, sum).replace(/\$user/g, id);
			const place = (await db.query(placeQuery)).rows[0].place;
			users.push([await client.users.fetch(id), '0'.repeat(3 - String(place).length) + place, elo, win, los, w_l]);
		}

		const user = [];
		if (player)
		{
			const id = player.id;
			const elo = information.game == "all" ? Number(player.elo) / games.length | 0 : Number(player.elo);
			const win = Number(player.win);
			const los = Number(player.los);
			const w_l = win + los > 0 ? ((win / (win + los)) * 100).toFixed(2) + '%' : "\u200b \u200b N/A \u200b \u200b";
			const placeQuery = String(fs.readFileSync("./assets/leaderboard/place.sql")).replace(/\$(elos|wins|loss)/g, sum).replace(/\$user/g, id);
			const place = (await db.query(placeQuery)).rows[0].place;

			user.push(await client.users.fetch(id), '0'.repeat(3 - String(place).length) + place, elo, win, los, w_l);
		}

		const topFile = { attachment: await drawTop(users, user.length > 0 ? user : false), name: "top10.png" };
		const embed = {
			author: { name: "Leaderboard", icon_url: "attachment://author.png" },
			image: { url: "attachment://top10.png" },
			color: new Color().random().toInt() };
		const pageActionRow = {
			type: 1,
			components: [
			{	type: 2, style: 1, // Blue Button
				emoji: emoji.previous_3,
				customId: `leaderboard.1.${information.player.id}.${information.game}.1`,
				disabled: userCount == 0 || information.page == 1 },
			{	type: 2, style: 1, // Blue Button
				emoji: emoji.previous_1,
				customId: `leaderboard.${information.page - 1}.${information.player.id}.${information.game}.2`,
				disabled: userCount == 0 || information.page == 1 },
			{	type: 2, style: 2, // Grey Button
				label: `Page ${information.page}/${Math.ceil(userCount / 10)}`,
				customId: "do.nothing",
				disabled: true },
			{	type: 2, style: 1, // Blue Button
				emoji: emoji.next_1,
				customId: `leaderboard.${information.page + 1}.${information.player.id}.${information.game}.3`,
				disabled: userCount == 0 || Math.ceil(userCount / 10) == information.page },
			{	type: 2, style: 1, // Blue Button
				emoji: emoji.next_3,
				customId: `leaderboard.${Math.ceil(userCount / 10)}.${information.player.id}.${information.game}.4`,
				disabled: userCount == 0 || Math.ceil(userCount / 10) == information.page } ] };
		const gameActionRow = {
			type: 1,
			components: [
			{	type: 3, // Dropdown Menu
				customId: `leaderboard.gameselect.${information.player.id}`,
				placeholder: "Get Game-Specific Leaderboard",
				options: [
				{	label: "All Games",
					value: "all" },
				{	label: "Othello",
					value: "othello" },
				{	label: "Squares",
					value: "squares" },
				{	label: "Rokumoku",
					value: "rokumoku" },
				{	label: "3D Tic-Tac-Toe",
					value: "ttt3d" },
				{	label: "Connect Four",
					value: "connect4" },
				{	label: "Ordo",
					value: "ordo" },
				{	label: "Paper Soccer",
					value: "soccer" },
				{	label: "Lines of Action",
					value: "loa" },
				{	label: "Latrones",
					value: "latrones" },
				{	label: "Spider Linetris",
					value: "spiderlinetris" } ] } ] };

		if (interaction.isCommand())
		{
			return interaction.editReply({ embeds: [embed], files: [author, topFile], components: [pageActionRow, gameActionRow] });
		}
		else
		{
			return interaction.message.edit({ embeds: [embed], files: [author, topFile], components: [pageActionRow, gameActionRow], attachments: [] });
		}
	}
};