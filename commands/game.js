import { client } from "../index.js";
import { Color } from "../assets/misc/color.js";
import { Games } from "../games/games.js";
import { Rules } from "../games/rules.js";
import { replayImage } from "../games/replayImage.js";

export const command = async (interaction) => {
	const command = interaction.isCommand() ? [interaction.commandName] : interaction.customId.split('.');
	const channel = client.channels.cache.get(interaction.channelId);
	const canDelete = channel.guildId != null && channel.permissionsFor(client.user.id).has(1n << 13n);
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
	const gameDescription = {
		"othello": "A Minute to Learn, a Lifetime to Master",
		"squares": "Place your pieces and make the most squares",
		"rokumoku": "It's, like, *really* big tic-tac-toe",
		"ttt3d": "A game of Noughts and Crosses but in 3 dimensions",
		"connect4": "The Original Vertical Four-in-a-Row Checkers Game",
		"ordo": "Reach for the other side and maintain your connection at the same time",
		"soccer": "A classic paper-and-pencil soccer game, but digital",
		"loa": "Be the first to connect all your pieces by moving them along their lines of action",
		"latrones": "Ludus latrunculorum",
		"spiderlinetris": "Connect Four but even more silly" }[gamename];
	const gamePreview = {
		"othello": "c4",
		"squares": "c4",
		"rokumoku": "j11.c11.d10.h10.g10.g9.f8.f10.e9.e8.d8.h8.c8.j7.i7.h7.e7.g7.h6.i6.f6.k5.f5.j5.i5.h4.f2.h5.g5.i10.h9.i4.g4.g8.f7.h3.f3.e6.d5",
		"ttt3d": "1 b2.3c3.1 a1.1c3.2 a4.2a3.2 a1.2b3.2 d4.2c3.2 d3.4c3",
		"connect4": "d.e.f.e.d.c",
		"ordo": "b3 c3",
		"soccer": "ul.ur.l.d.r.ul.ul.ur.dr.dl.l.u.u.dr.dl.dl.r.ur.u.l.ul.dl.l.ur.dr.dr.d.r.ul.l.dr.dr.r.u.dl.u.dl.r.dr.u.dl.r.r.ul.r.d.dr.dl.d.ur.l.ul.u.ur.ur.ul.l.d.dr.u.l.ur.d.dr.dr.dl.d.d.ul.dl.ul.ur.ur.ur.u.ur.l.d.l.ul.u.dr.r.dr.dl.l.dr.r.ur.l.u.dr.ur.dr",
		"loa": "b1 down",
		"latrones": "c4",
		"spiderlinetris": "d1.a3.d2.h1.h2.h3.h4.h5.g3.h6.h7.a8.g7.b8.f7.c8.d8.e8.f8.g8.h8"
	}[gamename].split('.');

	if (interaction.isCommand())
	{
		const gamesWithAI = ["squares", "rokumoku", "ttt3d"];
		const attachment = { attachment: await replayImage(gamename, interaction.id, false, gamePreview), name: "preview.png" };
		const embed = {
			title: Gamename,
			description: gameDescription,
			image: { url: "attachment://preview.png" },
			color: new Color().random().toInt() };
		const playActionRow = {
			type: 1,
			components: [
			{	type: 2, style: 1, // Blue Button
				label: `Play ${Gamename}`,
				customId: `${command[0]}.start.global`,
				disabled: Games.some(Game => Game.channels.includes(interaction.channelId) && Game.started) },
			{	type: 2, style: 1, // Blue Button
				label: `Play Locally`,
				customId: `${command[0]}.start.local`,
				disabled: channel.guildId == null || Games.some(Game => Game.channels.includes(interaction.channelId) && Game.started) },
			{	type: 2, style: 1, // Blue Button
				label: "Play Against the Bot",
				customId: `${command[0]}.start.ai`,
				disabled: !gamesWithAI.includes(gamename) } ] };
		const rulesActionRow = {
			type: 1,
			components: [
			{	type: 2, style: 5, // Link Button
				label: "Rules/How to Play",
				url: `https://github.com/Xyvyrianeth/xyvybot_assets/wiki/${gamename}` } ] };

		return interaction.reply({ embeds: [embed], files: [attachment], components: [playActionRow, rulesActionRow] });
	}

	if (interaction.isButton())
	{
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

			// const embed = {
			// 	author: { name: Gamename, icon_url: "attachment://image.png" },
			// 	description: "placeholder",
			// 	color: new Color().random().toInt() };

			// await interaction.message.channel.send({ embeds: [embed] });
			if (canDelete) await interaction.message.delete();
			return Rules.startGame(Game.id, interaction.channelId, interaction.guildId, interaction.user.id);
		}
		if (command[1] == "start" && command[2] == "local")
		{
			const embed = {
				author: { name: Gamename, icon_url: "attachment://image.png" },
				description: `${interaction.user} is requesting a new game of ${Gamename}!`,
				color: new Color().random().toInt() };
			const actionRow = {
				type: 1,
				components: [
				{	type: 2, style: 1,
					label: "Play Against Them",
					customId: `${command[0]}.start.accept` } ] };

			await interaction.reply({ embeds: [embed], components: [actionRow] });
			if (canDelete) await interaction.message.delete();
			return Rules.newGame(gamename, interaction.channelId, interaction.guildId, interaction.user.id, false, false, interaction.id);
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
				if (canDelete)
				{
					await interaction.message.delete();
				}
				return;
			}
			
			const embed = {
				author: { name: Gamename, icon_url: "attachment://image.png" },
				description: `${interaction.user} is requesting a new game of ${Gamename}!\nIf someone else requests this game in a different channel, or even a different server, you'll play against them!`,
				color: new Color().random().toInt() };
			const actionRow = {
				type: 1,
				components: [
				{	type: 2, style: 1, // Blue Button
					label: "Play Against Them",
					customId: `${command[0]}.start.accept` } ] };

			await interaction.reply({ embeds: [embed], components: [actionRow] });
			Rules.newGame(gamename, interaction.channelId, interaction.guildId, interaction.user.id, false, false, interaction.id);
			if (canDelete)
			{
				await interaction.message.delete();
			}
			return;
		}
		if (command[1] == "start" && command[2] == "ai")
		{
			if (canDelete) await interaction.message.delete();
			await Rules.newGame(gamename, interaction.channelId, interaction.guildId, interaction.user.id, true, true, interaction.id);
		}
	}
}