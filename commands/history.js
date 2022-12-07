import { client, db, emoji } from "../Xyvy.js";
import { Color } from "../assets/misc/color.js";
import { replayImage } from "../games/replayImage.js";
import fs from "fs";
const MatchQuery = fs.readFileSync("./assets/history/match.sql").toString();
const CountQuery = fs.readFileSync("./assets/history/count.sql").toString();
const HistoryQuery = fs.readFileSync("./assets/history/history.sql").toString();
const pageLimit = 20;

export const command = async (interaction) => {
	if ((interaction.isButton() || interaction.isSelectMenu()) && interaction.user.id != interaction.message.interaction.user.id)
	{
		return interaction.reply({ content: `You cannot use this interaction; it belongs to ${interaction.message.interaction.user}.`, ephemeral: true });
	}

	if (interaction.isCommand())
	{
		await interaction.deferReply();
	}
	else
	{
		await interaction.deferUpdate();
	}

	const command = interaction.isCommand() ? ["history", "init", interaction.user.id] : interaction.customId.split('.');
	const allGames = ["othello", "squares", "rokumoku", "ttt3d", "connect4", "ordo", "soccer", "loa", "latrones", "spiderlinetris"];
	const allResults = ["wins", "loss", "ties"];

	if (command[1] == "match")
	{
		const information = {
			user: await client.users.fetch(command[2]),
			games: allGames.filter((g, i) => command.length == 7 ? command[5][i] == '1' : interaction.message.components[1].components[0].options[i].default),
			result: allResults.filter((r, i) => command.length == 7 ? command[6][i] == '1' : interaction.message.components[2].components[0].options[i].default) };

		const selectQuery = `SELECT *\nFROM matches\nWHERE id = '${interaction.isSelectMenu() ? interaction.values[0] : command[3]}'`;
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
			replay: { attachment: await replayImage(match.game, match.id, false, match.replay), name: "replay.png" },
			players: [await client.users.fetch(match.players[0]), await client.users.fetch(match.players[1])],
			winner: match.winner == "undefined" ? false : (await client.users.fetch(match.winner)) };

		const description = `Match ID: \`${Match.id}\`\nGame: ${Match.game}\n${Match.players[0]} VS ${Match.players[1]}\nWINNER: ${Match.winner}`;
		const results = information.result.map(result => { return { wins: `winner = '${information.user.id}'`, loss: `(winner != '${information.user.id}' AND winner != 'undefined')`, ties: `winner = 'undefined'`}[result]; }).join(" OR ");
		const matchQuery = MatchQuery.replace(/\$USER_ID/g, information.user.id).replace(/\$GAMES/g, information.games.join("', '")).replace(/\$RESULTS/g, results);
		const Matches = await db.query(matchQuery);
		const matches = Matches.rows.map(a => a.id);
		const search = interaction.isSelectMenu() ? interaction.message.components[1].components[0].options.map(a => a.default ? '1' : '0').join('') + '.' + interaction.message.components[2].components[0].options.map(a => a.default ? '1' : '0').join('') : command[5] + '.' + command[6];
		const adjacentMatches = [
			matches.indexOf(Match.id) == 0 ? matches[matches.length - 1] : matches[matches.indexOf(match.id) - 1],
			Match.id,
			matches.indexOf(Match.id) == matches.length - 1 ? matches[0] : matches[matches.indexOf(match.id) + 1]
		];

		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/main/history.png", name: "author.png" };
		const embed = {
			author: { name: "history", icon_url: "attachment://author.png", },
			description: description,
			image: { url: `attachment://replay.png` },
			color: new Color().random().toInt() };

		const actionRow1 = {
			type: 1,
			components: [
			{	type: 2, style: 1, // Blue Button
				emoji: emoji.previous_1,
				customId: `history.match.${information.user.id}.${adjacentMatches[0]}.previous.${search}`,
				disabled: matches.length < 2 },
			{	type: 2, style: 4, // Red Button
				label: "Go back",
				customId: `history.page.${information.user.id}.${Math.ceil((matches.indexOf(Match.id) + 1) / pageLimit)}.${search}` },
			{	type: 2, style: 1, // Blue Button
				emoji: emoji.next_1,
				customId: `history.match.${information.user.id}.${adjacentMatches[2]}.next.${search}`,
				disabled: matches.length < 2 } ] };
		const actionRow2 = {
			type: 1,
			components: [
			{	type: 2, style: 3, // Green Button
				label: "Interactive Replay",
				customId: `replay.init.${Match.id}.${interaction.user.id}` } ] };

		if (match.game == "squares")
		{	// Squares Score Counter
			actionRow2.push({
				type: 2, style: 4, // Red Button
				label: "Unavailable",
				customId: `replay.counter.${Match.id}`,
				disabled: true });
		}

		const file = command[4] == "counter" ? Match.counter : Match.replay;

		const finalMessage = { embeds: [embed], components: [actionRow1, actionRow2], files: [file, author], attachments: [] };
		if (interaction.guildId == null)
		{
			await interaction.editReply(finalMessage);
		}
		else
		{
			await interaction.message.edit(finalMessage);
		}
	}
	else
	{
		const information = {};
		switch (command[1])
		{
			case "init": {
				information.user = await client.users.fetch(interaction.options?._hoistedOptions[0]?.value || interaction.user.id);
				information.games = allGames;
				information.result = allResults;
				information.page = 1;
				break;
			}
			case "page": {
				information.user = await client.users.fetch(command[2]);
				information.games = allGames.filter((g, i) => command.length == 6 ? command[4][i] == '1' : interaction.message?.components[1]?.components[0].options[i].default);
				information.result = allResults.filter((g, i) => command.length == 6 ? command[5][i] == '1' : interaction.message?.components[2]?.components[0].options[i].default);
				information.page = Number(command[3]);
				break;
			}
			case "game": {
				information.user = await client.users.fetch(command[2]);
				information.games = (!interaction.values || interaction.values.length == 0) ? allGames : interaction.values;
				information.result = allResults.filter((r, i) => interaction.message?.components[2]?.components[0].options[i].default);
				information.page = 1;
				break;
			}
			case "result": {
				information.user = await client.users.fetch(command[2]);
				information.games = allGames.filter((g, i) => interaction.message?.components[1]?.components[0].options[i].default);
				information.result = interaction.values;
				information.page = 1;
				break;
			}
		}

		const results = information.result.map(result => { return { wins: `winner = '${information.user.id}'`, loss: `(winner != '${information.user.id}' AND winner != 'undefined')`, ties: `winner = 'undefined'`}[result]; }).join(" OR ");
		const historyQuery = HistoryQuery.replace(/\$USER_ID/g, information.user.id).replace(/\$GAMES/g, information.games.join("', '")).replace(/\$PAGE/g, pageLimit).replace(/\$OFFSET/g, (information.page - 1) * pageLimit).replace(/\$RESULTS/g, results);
		const countQuery = CountQuery.replace(/\$USER_ID/g, information.user.id).replace(/\$GAMES/g, information.games.join("', '")).replace(/\$RESULTS/g, results);
		const History = await db.query(historyQuery);
		const history = History.rows;
		const MatchCount = await db.query(countQuery);
		const matchCount = MatchCount.rows[0].matchcount;
		const matches = [];

		history.forEach(match => {
			const Match = {};
			Match.game = match.game;
			Match.gameName = { "othello": "Othello        ", "squares": "Squares        ", "rokumoku": "Rokumoku       ", "ttt3d": "3D Tic-Tac-Toe ", "connect4": "Connect Four   ", "ordo": "Ordo           ", "soccer": "Paper Soccer   ", "loa": "Lines of Action", "latrones": "Latrones       ", "spiderlinetris": "Spider Linetris" }[match.game];
			Match.result = match.winner == "undefined" ? "  TIE  " : information.user.id == match.winner ? "VICTORY": "DEFEAT ";
			Match.replay = match.replay;
			Match.id = match.id;
			Match.opponent = match.players[(match.players.indexOf(information.user.id) + 1) % 2];
			Match.counter = match.counter;
			matches.push(Match);
		});

		const display = [matchCount == 0 ? "__`NO RESULTS`__" : `__\`   |GAME           |RESULT |OPPONENT    \`__`];

		matches.forEach((match, index) => {
			display.push(`\`${index > 8 ? (index + 1) + ')' : `0${index + 1})`}|${match.gameName}|${match.result}|\`<@${match.opponent}>`);
		});

		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/main/history.png", name: "author.png" };
		const embed = {
			author: { name: "Game History", icon_url: "attachment://author.png" },
			description: `\`User:\` ${information.user}\n\n` + display.join('\n'),
			color: new Color().random().toInt() };

		const pageActionRow = {
			type: 1,
			components: [
			{	type: 2, style: 1, // Blue Button
				emoji: emoji.previous_3,
				customId: `history.page.${information.user.id}.1.first`,
				disabled: information.page == 1 },
			{	type: 2, style: 1, // Blue Button
				emoji: emoji.previous_1,
				customId: `history.page.${information.user.id}.${information.page - 1}.previous`,
				disabled: information.page == 1 },
			{
				type: 2, style: 1, // Blue Button
				label: matchCount == 0 ? "No results" : `Page ${information.page} of ${Math.ceil(matchCount / pageLimit)}`,
				customId: "pageCount",
				disabled: true },
			{	type: 2, style: 1, // Blue Button
				emoji: emoji.next_1,
				customId: `history.page.${information.user.id}.${information.page + 1}.next`,
				disabled: Math.ceil(matchCount / pageLimit) == information.page || Math.ceil(matchCount / pageLimit) == 0 },
			{	type: 2, style: 1, // Blue Button
				emoji: emoji.next_3,
				customId: `history.page.${information.user.id}.${Math.ceil(matchCount / pageLimit)}.last`,
				disabled: Math.ceil(matchCount / pageLimit) == information.page || Math.ceil(matchCount / pageLimit) == 0 } ] };
		const gameActionRow = {
			type: 1,
			components: [
			{	type: 3, // Dropdown Menu
				customId: `history.game.${information.user.id}`,
				placeholder: "Filter by game",
				minValues: 0,
				maxValues: 10,
				options: [
				{	label: "Othello",
					value: "othello",
					default: information.games.includes("othello") },
				{	label: "Squares",
					value: "squares",
					default: information.games.includes("squares") },
				{	label: "Rokumoku",
					value: "rokumoku",
					default: information.games.includes("rokumoku") },
				{	label: "3D Tic-Tac-Toe",
					value: "ttt3d",
					default: information.games.includes("ttt3d") },
				{	label: "Connect Four",
					value: "connect4",
					default: information.games.includes("connect4") },
				{	label: "Ordo",
					value: "ordo",
					default: information.games.includes("ordo") },
				{	label: "Paper Soccer",
					value: "soccer",
					default: information.games.includes("soccer") },
				{	label: "Lines of Action",
					value: "loa",
					default: information.games.includes("loa") },
				{	label: "Latrones",
					value: "latrones",
					default: information.games.includes("latrones") },
				{	label: "Spider Linetris",
					value: "spiderlinetris",
					default: information.games.includes("spiderlinetris") } ] } ] };
		const resultActionRow = {
			type: 1,
			components: [
			{	type: 3, // Dropdown Menu
				customId: `history.result.${information.user.id}`,
				placeholder: "Filter by game result",
				minValues: 1,
				maxValues: 3,
				options: [
				{	label: "Wins",
					value: "wins",
					default: information.result.includes("wins") },
				{	label: "Losses",
					value: "loss",
					default: information.result.includes("loss") },
				{	label: "Ties",
					value: "ties",
					default: information.result.includes("ties") } ] } ] };

		if (matchCount == 0)
		{
			if (interaction.isCommand())
			{
				return interaction.editReply({ embeds: [embed], files: [author] });
			}
			else
			{
				interaction.message.edit({ embeds: [embed], components: [pageActionRow, gameActionRow, resultActionRow], files: [author], attachments: [] });
			}
		}

		const selectMatchActionRow = {
			type: 1,
			components: [
			{	type: 3,
				customId: `history.match.${information.user.id}.${information.page}.replay`,
				placeholder: "View Match Details",
				options: matches.map((match, index) => { return { label: "Match " + (index == 9 ? "10" : '0' + (index + 1)), description: `Game: ${match.gameName} | ${match.result}`, value: match.id } }) } ] };

		const finalMessage = { embeds: [embed], components: [pageActionRow, gameActionRow, resultActionRow, selectMatchActionRow], files: [author], attachments: [] };

		if (interaction.isCommand())
		{
			interaction.editReply(finalMessage);
		}
		else
		{
			if (interaction.guildId == null)
			{
				await interaction.editReply(finalMessage);
			}
			else
			{
				await interaction.message.edit(finalMessage);
			}
		}
	}
}