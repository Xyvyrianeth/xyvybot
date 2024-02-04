"use strict";

import { Client, COMPONENT, BUTTON_STYLE } from "../../index.js";
import { getQuestions } from 'open-trivia-db';
import { Color } from "../../assets/misc/color.js";
import { miniGames } from "../../games/minigames.js";

export const command = async (interaction) => {
	const category = interaction.options._hoistedOptions[0]?.value || Math.random() * 23 + 9 | 0;
	const miniGame = {
		id: interaction.id,
		type: "trivia",
		channelId: interaction.channelId,
		wrongPeople: [],
		completed: false,
		timer: 10 };
	miniGames.set(interaction.id, miniGame);

    const channel = await Client.channels.fetch(interaction.channelId);
    const permissions = await channel.permissionsFor(Client.user.id);
    const customEmoji = await permissions.has(1n << 18n);
    const author = { attachment: "./assets/authors/trivia.png", name: "author.png" };
    const tempEmbed = {
        author: { name: "trivia", icon_url: "attachment://author.png" },
        description: `Generating trivia question ${customEmoji ? "<a:loading:1010988190250848276>" : ":hourglass:"}`,
        color: new Color().random().toInt() };
    await interaction.reply({ embeds: [ tempEmbed ], files: [ author ], fetchReply: true }).then((message) => miniGame.messageId = message.id);

	const difficulty = ["easy", "medium", "hard"].random();
	const question = await getQuestions({ amount: 1, difficulty: difficulty, type: "multiple", category: category });
	const embed = {
		author: { name: "trivia", icon_url: "attachment://author.png" },
		description: `Time's up <t:${(Date.now() / 1000 | 0) + 180}:R>`,
		fields: [ { name: question[0].category.name, value: question[0].value } ],
		color: new Color().random().toInt() };
	const actionRows = [
	{	type: COMPONENT.ACTION_ROW,
		components: [
		{	type: COMPONENT.BUTTON,
			style: BUTTON_STYLE.BLUE,
			label: question[0].correctAnswer,
			customId: "trivia.correct" } ] },
	{	type: COMPONENT.ACTION_ROW,
		components: [
		{	type: COMPONENT.BUTTON,
			style: BUTTON_STYLE.BLUE,
			label: question[0].incorrectAnswers[0],
			customId: "trivia.incorrect0" } ] },
	{	type: COMPONENT.ACTION_ROW,
		components: [
		{	type: COMPONENT.BUTTON,
			style: BUTTON_STYLE.BLUE,
			label: question[0].incorrectAnswers[1],
			customId: "trivia.incorrect1" } ] },
	{	type: COMPONENT.ACTION_ROW,
		components: [
		{	type: COMPONENT.BUTTON,
			style: BUTTON_STYLE.BLUE,
			label: question[0].incorrectAnswers[2],
			customId: "trivia.incorrect2" } ] } ].shuffle();

	await interaction.editReply({ embeds: [ embed ], files: [ author ], components: actionRows });
}