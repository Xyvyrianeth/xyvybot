import { Xyvybot } from "../../index.js";
import { Color } from "../../assets/misc/color.js";
import { Games } from "../../games/Games.js";
import { Rules } from "../../games/Rules.js";
import { replayImage } from "../../games/replayImage.js";
import { deleteMessage } from "../../index/discordFunctions.js";

export const command = async (interaction) => {
	const command = interaction.isCommand() ? [interaction.commandName] : interaction.customId.split('.');
	const gamename = {
		"othello": "othello",
		"squares": "squares",
		"rokumoku": "rokumoku",
		"3dtictactoe": "ttt3d",
		"connect4": "connect4",
		"ordo": "ordo",
		"papersoccer": "soccer",
		"linesofaction": "loa",
		"latrones": "latrones",
		"spiderlinetris": "spiderlinetris" }[command[0]];
	const Gamename = {
		"othello": "Othello",
		"squares": "Squares",
		"rokumoku": "Rokumoku",
		"ttt3d": "3D Tic-Tac-Toe",
		"connect4": "Connect Four",
		"ordo": "Ordo",
		"soccer": "Paper Soccer",
		"loa": "Lines of Action",
		"latrones": "Latrones",
		"spiderlinetris": "Spider Linetris" }[gamename];

	if (command[1] == "start" && command[2] == "accept")
	{
		const Game = Games.find(Game => Game.channels.includes(interaction.channelId));

		if (!Game)
		{
			return interaction.reply({ content: "Sorry, there's not a game for you to accept anymore", ephemeral: true });
		}

		if (Game.started)
		{
			return interaction.reply({ content: "This game has already been accepted by another player", ephemeral: true });
		}

		if (interaction.user.id == interaction.message.embeds[0].description.match(/[0-9]+/))
		{
			return interaction.reply({ content: "You cannot play against yourself", ephemeral: true });
		}

		await deleteMessage(interaction.message);
		return Rules.startGame(Game.id, interaction.channelId, interaction.guildId, interaction.user.id);
	}
	if (command[1] == "start" && command[2] == "local")
	{
		const author = { name: "author.png", attachment: `https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/${gamename}.png` };
		const embed = {
			author: { name: Gamename, icon_url: "attachment://author.png" },
			description: `${interaction.user} is requesting a new game of ${Gamename}!`,
			color: new Color().random().toInt() };
		const actionRow = {
			type: 1,
			components: [
			{	type: 2, style: 1,
				label: "Play Against Them",
				customId: `${command[0]}.start.accept` } ] };

		await interaction.reply({ embeds: [embed], files: [author], components: [actionRow] });
		await deleteMessage(interaction.message);
		await Rules.newGame(gamename, interaction.channelId, interaction.guildId, interaction.user.id, false, false, interaction.id);
		return;
	}
	if (command[1] == "start" && command[2] == "global")
	{
		if (Games.some(Game => Game.players.includes(interaction.user.id) && Game.started))
		{
			return interaction.reply({ content: "You are already playing a game. Finish it before you start a new one.", ephemeral: true });
		}
		if (Games.some(Game => Game.players.includes(interaction.user.id) && !Game.started))
		{
			return interaction.reply({ content: "You are already queuing for a game.", ephemeral: true });
		}

		const Game = Games.find(Game => Game.game == gamename && !Game.started && !Game.channels.includes(interaction.channelId) && !Game.local);
		if (Game)
		{
			Rules.startGame(Game.id, interaction.channelId, interaction.guildId, interaction.user.id);
			await deleteMessage(interaction.message);
			return;
		}

		const author = { name: "author.png", attachment: `https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/${gamename}.png` };
		const embed = {
			author: { name: Gamename, icon_url: "attachment://author.png" },
			description: `${interaction.user} is requesting a new game of ${Gamename}!\nIf someone else requests this game in a different channel, or even a different server, you'll play against them!`,
			color: new Color().random().toInt() };
		const actionRow = {
			type: 1,
			components: [
			{	type: 2, style: 1, // Blue Button
				label: "Play Against Them",
				customId: `${command[0]}.start.accept` } ] };

		await interaction.reply({ embeds: [embed], files: [author], components: [actionRow] });
		await Rules.newGame(gamename, interaction.channelId, interaction.guildId, interaction.user.id, false, false, interaction.id);
		await deleteMessage(interaction.message);
		return;
	}
	if (command[1] == "start" && command[2] == "ai")
	{
		await deleteMessage(interaction.message);
		await Rules.newGame(gamename, interaction.channelId, interaction.guildId, interaction.user.id, true, true, interaction.id);
	}
}