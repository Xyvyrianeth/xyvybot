import { Category, getQuestions } from 'open-trivia-db';
import { Color } from "../assets/misc/color.js";
import { miniGames } from "../games/minigames.js";

export const command = async (interaction) => {
	if (interaction.isCommand())
	{
		const difficulty = ["easy", "medium", "hard"].random();
		const question = await getQuestions({ amount: 1, difficulty: difficulty, type: "multiple", category: Math.random() * 23 + 9 | 0 });
		const embed = {
			author: { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/trivia.png", name: "trivia" },
			color: new Color().random().toInt(),
			title: "Category: " + question[0].category,
			description: question[0].value };
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

		interaction.reply({ embeds: [ embed ], components: actionRows });
	}
	else
	{
		const miniGame = miniGames.get(interaction.message.id);
		if (!miniGame && interaction.message.components[0].toJSON().components[0].style == 1)
		{
			const oldTrivia = {
				type: "trivia",
				channel: interaction.channelId,
				timer: 0 };

			miniGames.set(interaction.message.id, oldTrivia);
			return interaction.deferUpdate();
		}
		if (!miniGame || miniGame.completed || miniGame.wrongPeople.includes(interaction.user.id))
		{
			return interaction.deferUpdate();
		}

		if (interaction.customId == "trivia.correct")
		{
			miniGame.completed = true;
			miniGame.timer = 20;

			const newComponents = interaction.message.components.map(component => {
				const Component = component.toJSON();
				if (Component.components[0].custom_id != "trivia.correct")
				{
					Component.components[0].disabled = true;
					Component.components[0].style = 4;
				}
				else
				{
					Component.components[0].style = 3;
				}
				return Component;
			});

			const newEmbed = interaction.message.embeds[0].toJSON();
			newEmbed.description += `\n\n${interaction.user} got it right!`;

			return interaction.update({ embeds: [ newEmbed ], components: newComponents });
		}
		else
		{
			miniGame.wrongPeople.push(interaction.user.id);

			const newEmbed = interaction.message.embeds[0].toJSON();
			const wrongPeopleFields = [ {
				name: "Wrong People",
				value: `<@${miniGame.wrongPeople.join("> <@")}>` } ];
			newEmbed.fields = wrongPeopleFields;

			return interaction.update({ embeds: [ newEmbed ], components: interaction.message.components });
		}
	}
}