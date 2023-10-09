import { getQuestions } from 'open-trivia-db';
import { Color } from "../../assets/misc/color.js";
import { miniGames } from "../../games/miniGames.js";

export const command = async (interaction) => {
	const trivia = {
		id: interaction.id,
		type: "trivia",
		channelId: interaction.channelId,
		wrongPeople: [],
		completed: false,
		timer: 180 };
	miniGames.set(interaction.id, trivia);

	const difficulty = ["easy", "medium", "hard"].random();
	const question = await getQuestions({ amount: 1, difficulty: difficulty, type: "multiple", category: Math.random() * 23 + 9 | 0 });
	const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/trivia.png", name: "author.png" };
	const embed = {
		author: { name: "trivia", icon_url: "attachment://author.png" },
		description: `Time's up <t:${(Date.now() / 1000 | 0) + 180}:R>`,
		fields: [ { name: "Category: " + question[0].category, value: question[0].value } ],
		color: new Color().random().toInt() };
	const actionRows = [
	{	type: 1,
		components: [
		{	type: 2,
			style: 1,
			label: question[0].correctAnswer,
			customId: "trivia.correct" } ] },
	{	type: 1,
		components: [
		{	type: 2,
			style: 1,
			label: question[0].incorrectAnswers[0],
			customId: "trivia.incorrect0" } ] },
	{	type: 1,
		components: [
		{	type: 2,
			style: 1,
			label: question[0].incorrectAnswers[1],
			customId: "trivia.incorrect1" } ] },
	{	type: 1,
		components: [
		{	type: 2,
			style: 1,
			label: question[0].incorrectAnswers[2],
			customId: "trivia.incorrect2" } ] } ].shuffle();

	interaction.reply({ embeds: [embed], files: [author], components: actionRows });
}