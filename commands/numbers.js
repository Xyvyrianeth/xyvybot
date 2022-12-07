import { Color } from "../assets/misc/color.js";
import { miniGames } from "../games/minigames.js";
import { emoji } from "../Xyvy.js";
import { solverRunAllSolutions } from "../assets/misc/solver_engine.js";

export const command = async (interaction) => {
	const randomColor = new Color().random().toInt();

	if (interaction.isCommand())
	{
		const embed = {
			author: { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/numbers.png", name: "numbers" },
			color: randomColor,
			title: "Choose Large and Small Numbers",
			description: "Target: :zero::zero::zero:\n\n:stop_button:" + " \u200b :stop_button:".repeat(5) };
		const actionRows = [
			{	type: 1,
				components: [
				{	type: 2,
					style: 1,
					label: "Large",
					customId: "numbers.number.large" },
				{	type: 2,
					style: 1,
					label: "Small",
					customId: "numbers.number.small" } ] } ];

		return interaction.reply({ embeds: [ embed ], components: actionRows });
	}
	else
	{
		const miniGame = miniGames.get(interaction.message.id);

		if (!miniGame)
		{
			return interaction.deferUpdate();
		}

		const embed = {
			author: { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/numbers.png", name: "numbers" },
			color: randomColor,
			title: "You have 30 seconds" };
		const actionRows = [];

		switch (interaction.customId.split('.')[1])
		{
			case "help":
			{

			}

			case "number":
			{
				if (miniGame.picker !== interaction.user.id)
				{
					return interaction.deferUpdate();
				}

				const type = ["large", "small"].indexOf(interaction.customId.split('.')[2]);
				const number = miniGame.available[type].random();
				miniGame.available[type].remove(number);
				miniGame.numbers[["unshift", "push"][type]](number);

				const emojis = `:zero: :one: :two: :three: :four: :five: :six: :seven: :eight: :nine: :keycap_ten: <:${emoji.twentyfive.name}:${emoji.twentyfive.id}> <:${emoji.fifty.name}:${emoji.fifty.id}> <:${emoji.seventyfive.name}:${emoji.seventyfive.id}> <:${emoji.onehundred.name}:${emoji.onehundred.id}>`.split(' ');
				const description = [];
				for (let i = 0; i < 6; i++)
				{
					const n = miniGame.numbers[i];
					description.push(n === undefined ? ":stop_button:" : emojis[n <= 10 ? n : n / 25 + 10]);
					description.push(" \u200b ");
				}
				description.pop();

				if (miniGame.numbers.length == 6)
				{
					const target = Math.random() * 899 + 101 | 0;
					embed.title = "You have 40 seconds";
					embed.description = `Target: ${emojis[String(target)[0]]}${emojis[String(target)[1]]}${emojis[String(target)[2]]}\n\n${description.join('')}`;
					// actionRows.push(
					// 	{	type: 1,
					// 		components: [
					// 		{	type: 2,
					// 			style: 1,
					// 			label: "Attempt a Solution",
					// 			customId: "numbers.attempt" } ] });

					miniGame.timer = 40;
					miniGame.target = target;
					interaction.update({ embeds: [ embed ], components: actionRows });

					solverRunAllSolutions(miniGame.numbers, target, null, results => {
						miniGame.solution = results.nearestExpressions.map(result => [result.value, result.stringValue])[0];
					});

					return;
				}
				else
				{
					embed.title = "Choose Large and Small Numbers";
					embed.description = `Target: :zero::zero::zero:\n\n${description.join('')}`;
					actionRows.push(
						{	type: 1,
							components: [
							{	type: 2,
								style: 1,
								label: "Large",
								customId: "numbers.number.large",
								disabled: miniGame.available[0].length == 0 },
							{	type: 2,
								style: 1,
								label: "Small",
								customId: "numbers.number.small" } ] });

					return interaction.update({ embeds: [ embed ], components: actionRows });
				}
			}

			// case "attempt":
			// {
			// 	const modal = {
			// 		title: "placeholder",
			// 		customId: "numbers.submit",
			// 		type: 1,
			// 		components: [
			// 		{	type: 1,
			// 			components: [
			// 			{	type: 4, style: 1,
			// 				customId: "response",
			// 				label: miniGame.target + ' | ' + miniGame.numbers.join(' \u200b '),
			// 				required: true } ] } ] };
			// 	return interaction.showModal(modal);
			// }

			// case "submit":
			// {
			// 	const equation = interaction.fields.fields.get("response").value.toLowerCase();

			// 	if (!/^[0-9+\-*x/() ]+$/.test(equation))
			// 	{
			// 		return interaction.deferUpdate();
			// 	}

			// 	const usedNumbers = equation.match(/[0-9]+/g);
			// 	const availableNumbers = miniGame.numbers.concat();
			// 	for (const n of usedNumbers)
			// 	{
			// 		const N = Number(n);
			// 		const i = availableNumbers.indexOf(N);
			// 		if (i !== -1)
			// 		{
			// 			availableNumbers[i] = false;
			// 		}
			// 		else
			// 		if (miniGame.numbers.includes(N))
			// 		{
			// 			return interaction.reply({ content: `You cannot use numbers more times than they appear — \`${n}\` used too many times`, ephemeral: true });
			// 		}
			// 		else
			// 		{
			// 			return interaction.reply({ content: `\`${n}\` is not an available number`, ephemeral: true });
			// 		}
			// 	}

			// 	const result = Math.calculate(equation);
			// 	if (result[0] == "err")
			// 	{
			// 		return interaction.reply({ content: "Your answer does not compute", ephemeral: true });
			// 	}

			// 	if (!miniGame.attempts.hasOwnProperty(interaction.user.id))
			// 	{
			// 		miniGame.attempts[interaction.user.id] = [result[1], equation];
			// 	}
			// 	else
			// 	if (Math.abs(miniGame.target - miniGame.attempts[interaction.user.id][0]) < Math.abs(miniGame.target - result[1]))
			// 	{
			// 		miniGame.attempts[interaction.user.id] = [result[1], equation];
			// 	}

			// 	const attempts = [];
			// 	for (const i in miniGame.attempts)
			// 	{
			// 		attempts.push(`<@${i}> – ${miniGame.attempts[i][0]}`);
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