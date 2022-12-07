import { Color } from "../assets/misc/color.js";
import { miniGames } from "../games/minigames.js";

export const command = async (interaction) => {
	const randomColor = new Color().random().toInt();

	if (interaction.isCommand())
	{
		const embed = {
			author: { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/letters.png", name: "letters" },
			color: randomColor,
			title: "Choose Vowels and Consonants",
			description: ":stop_button: \u200b ".repeat(8) + ":stop_button:" };
		const actionRows = [
			{	type: 1,
				components: [
				{	type: 2,
					style: 1,
					label: "Vowel",
					customId: "letters.letter.vowel" },
				{	type: 2,
					style: 1,
					label: "Consonant",
					customId: "letters.letter.consonant" },
				// {	type: 2,
				// 	style: 3,
				// 	label: "Help",
				// 	customId: "letters.help" }
				 ] } ];

		interaction.reply({ embeds: [ embed ], components: actionRows });
	}
	else
	{
		const miniGame = miniGames.get(interaction.message.id);

		if (!miniGame)
		{
			return interaction.deferUpdate();
		}

		const embed = {
			author: { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/letters.png", name: "letters" },
			color: randomColor,
			title: "You have 30 seconds" };
		const actionRows = [];

		switch (interaction.customId.split('.')[1])
		{
			case "help":
			{
				// const descriptions = [
				// 	"Your job is to pick the letters. You get to choose how many are vowels and how many are consonants and the order they're arranged in, and you use the buttons to add them.",
				// 	"Once all 9 letters have been chosen, the goal is to make the longest word you can using only those 9 letters. Letters cannot be used twice.",
				// 	"Your goal is to make the longest word you can using only the 9 letters above. Letters cannot be used twice. Use the blue button to submit your word.",
				// 	"Words must be in English and have the American spelling. Proper nouns are not permitted, nor any words that are hyphenated or have apostrophes, and they cannot be abbreviations or acronymns."];
				// const description = [];
				// const embed = {
				// 	author: { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/letters.png", name: "countdown" },
				// 	color: randomColor,
				// 	title: "Help" };

				// if (miniGame.letters.length < 9)
				// {
				// 	if (miniGame.picker == interaction.user.id)
				// 	{
				// 		description.push(descriptions[0]);
				// 	}
				// 	description.push(description[1]);
				// }
				// else
				// {
				// 	if (miniGame.picker !== interaction.user.id)
				// 	{
				// 		description.push(description[2]);
				// 	}
				// 	description.push(description[3]);
				// }

				// embed.description = description.join('\n\n');
				// interaction.reply({ embeds: [ embed ], ephemeral: true });
			}

			case "letter":
			{
				if (miniGame.picker !== interaction.user.id)
				{
					return interaction.deferUpdate();
				}

				const type = ["vowel", "consonant"].indexOf(interaction.customId.split('.')[2]);
				const letter = miniGame.available[type].random();
				miniGame.available[type].remove(letter);
				miniGame.letters.push(letter);

				if (miniGame.letters.length == 9)
				{
					embed.title = "You have 40 seconds";
					embed.description = `:regional_indicator_${miniGame.letters.join(": \u200b :regional_indicator_")}:`
					// actionRows.push(
					// 	{	type: 1,
					// 		components: [
					// 		{	type: 2,
					// 			style: 1,
					// 			label: "Attempt a Word",
					// 			customId: "letters.attempt" } ] });

					miniGame.timer = 40;
					return interaction.update({ embeds: [ embed ], components: actionRows });
				}
				else
				{
					embed.title = "Choose Vowels and Consonants";
					embed.description = `:regional_indicator_${miniGame.letters.join(": \u200b :regional_indicator_")}:${" \u200b :stop_button:".repeat(9 - miniGame.letters.length)}`;
					actionRows.push(
						{	type: 1,
							components: [
							{	type: 2,
								style: 1,
								label: "Vowel",
								customId: "letters.letter.vowel" },
							{	type: 2,
								style: 1,
								label: "Consonant",
								customId: "letters.letter.consonant" } ] });

					return interaction.update({ embeds: [ embed ], components: actionRows });
				}
			}

			// case "attempt":
			// {
			// 	const modal = {
			// 		title: "placeholder",
			// 		customId: "letters.submit",
			// 		type: 1,
			// 		components: [
			// 		{	type: 1,
			// 			components: [
			// 			{	type: 4, style: 1,
			// 				min_length: 1, max_length: 9,
			// 				customId: "response",
			// 				label: miniGame.letters.join(' \u200b ').toUpperCase(),
			// 				required: true } ] } ] };
			// 	return interaction.showModal(modal);
			// }

			// case "submit":
			// {
			// 	const word = interaction.fields.fields.get("response").value.toLowerCase();

			// 	if (!/^[a-z]{1,9}$/.test(word))
			// 	{
			// 		return interaction.deferUpdate();
			// 	}

			// 	const usedLetters = word.split('');
			// 	const availableLetters = miniGame.letters.concat();
			// 	for (const l of usedLetters)
			// 	{
			// 		const L = l.toUpperCase();
			// 		const i = availableLetters.indexOf(l);
			// 		if (i !== -1)
			// 		{
			// 			availableLetters[i] = false;
			// 		}
			// 		else
			// 		if (miniGame.letters.includes(l))
			// 		{
			// 			return interaction.reply({ content: `You cannot use letters more times than they appear — \`${L}\` used too many times`, ephemeral: true });
			// 		}
			// 		else
			// 		{
			// 			return interaction.reply({ content: `\`${L}\` is not an available letter`, ephemeral: true });
			// 		}
			// 	}

			// 	if (!miniGame.attempts.hasOwnProperty(interaction.user.id))
			// 	{
			// 		miniGame.attempts[interaction.user.id] = word;
			// 	}
			// 	else
			// 	if (word.length > miniGame.attempts[interaction.user.id].length)
			// 	{
			// 		miniGame.attempts[interaction.user.id] = word;
			// 	}

			// 	const attempts = [];
			// 	for (const i in miniGame.attempts)
			// 	{
			// 		attempts.push(`<@${i}> – ${miniGame.attempts[i].length}`);
			// 	}

			// 	const newEmbed = interaction.message.embeds[0].toJSON();
			// 	const attemptsFields = [ {
			// 		name: "Attempts",
			// 		value: attempts.sort((a, b) => { return b[b.length - 1] - a[a.length - 1] }).join('\n') } ];
			// 	newEmbed.fields = attemptsFields;

			// 	return interaction.update({ embeds: [ newEmbed ], components: interaction.message.components });
			// }
		}
	}
}