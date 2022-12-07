import { Collection } from "discord.js";
import { client } from "../Xyvy.js";
import { Color } from "../assets/misc/color.js";
import allWords from "../assets/misc/dictionary.json" assert { type: "json" };
export const miniGames = new Collection();

setInterval(function() {
	miniGames.forEach((miniGame, id) => {
		miniGame.timer--;
		if (miniGame.timer <= 0)
		{
			const margin = 5;

			switch (miniGame.type)
			{
				case "iq":
				{
					const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/main/iq.png", name: "author.png" };
					const embed = {
						author: { name: "IQ", icon_url: "attachment://author.png" },
						title: "IQ",
						fields: [{ name: "Nobody got it in time!", value: miniGame.end }],
						color: new Color("#FF6666").toInt() };
						const actionRow = {
							type: 1,
							components: [
								{	type: 2,
								style: 3,
								label: "TRY ANOTHER",
								customId: "iq" } ] };

					client.channels.cache.get(miniGame.channel).send({ embeds: [embed], files: [author], components: [actionRow], attachments: [] });
					miniGames.delete(id);
					break;
				}

				case "hangman":
				{
					const display = [];
					for (let i = 0; i < miniGame.answer.length; i++)
					{
						if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/.test(miniGame.answer[i]))
						{
							display.push("__" + miniGame.answer[i] + "__");
						}
						else
						{
							display.push(miniGame.answer[i]);
						}
					}
					const embed = {
						title: "Hangman",
						fields: [{ name: "Looks like nobody's playing anymore!", value: `**${display.join("\u200b \u200b")}**\n\nGuesses: \`${miniGame.guesses.join("` `")}\`` }],
						color: new Color("#FF6666").toInt() };

					client.channels.cache.get(miniGame.channel).send({ embeds: [embed] });
					miniGames.delete(id);
					break;
				}

				case "trivia":
				{
					const message = client.channels.cache.get(miniGame.channel).messages.cache.get(id);
					const newEmbed = message.embeds[0].toJSON();
					const newComponents = message.components.map(component => {
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

					miniGames.delete(id);

					if (!miniGame.completed)
					{
						newEmbed.description += "\n\nNobody got it in time.";
						message.edit({ embeds: [newEmbed], components: newComponents });
					}

					break;
				}

				case "letters":
				{
					const message = client.channels.cache.get(miniGame.channel).messages.cache.get(id);
					const embed = message.embeds[0].toJSON();

					if (miniGame.letters.length !== 9)
					{
						embed.description = embed.description.split('\n\n')[0] + "\n\nTime has run out";
						miniGames.delete(id);
						return message.edit({ embeds: [ embed ], components: [] });
					}

					if (Object.keys(miniGame.attempts).length > 0)
					{
						const results = [];
						for (const i in miniGame.attempts)
						{
							const word = miniGame.attempts[i];
							let satisfactory = ":white_check_mark:";

							const letters = miniGame.letters.join('').split('');
							for (const letter of word.split(''))
							{
								if (letters.indexOf(letter) !== -1)
								{
									letters[letters.indexOf(letter)] = "_";
								}
								else
								{
									satisfactory = ":x:";
									break;
								}
							}
							if (!allWords.includes(word))
							{
								satisfactory = ":x:";
							}

							const result = `${satisfactory} <@${i}> – ${word.length}\n${"\u200b ".repeat(margin)}\`${word.toUpperCase()}\``
							results.push(result);
						}
						const resultFields = [ {
							name: "Results",
							value: results.sort((a, b) => {
								const aLength = a.split('\n')[1].length;
								const bLength = b.split('\n')[1].length;
								if (aLength > bLength) return -1;
								if (aLength < bLength) return 1;
								if (a.includes(":white_check_mark:") && b.includes(":x:")) return -1;
								if (a.includes(":x:") && b.includes(":white_check_mark:")) return 1; }).join('\n') } ];
						embed.fields = resultFields;
					}
					else
					{
						embed.fields = [ { name: "Results", value: "No one answered in time" } ];
					}

					const words1 = allWords.filter(word => !word.split('').some(letter => !miniGame.letters.includes(letter)));
					const words2 = words1.filter(word => {
						const usedLetters = word.split('');
						const availableLetters = miniGame.letters.concat();
						for (const l of usedLetters)
						{
							const i = availableLetters.indexOf(l);
							if (i !== -1)
							{
								availableLetters[i] = false;
							}
							else
							{
								return false;
							}
						}
						return true;
					});
					const length = words2.sort((a, b) => b.length - a.length)[0].length;
					const longestWords = words2.filter(word => word.length == length);
					embed.fields.unshift({ name: `Longest Possible — ${length} Letters`, value: `\`${longestWords.join('` \u200b `')}\`` });
					embed.title = "Time's Up!";
					message.edit({ embeds: [ embed ], components: [] });
					miniGames.delete(id);

					break;
				}

				case "numbers":
				{
					const message = client.channels.cache.get(miniGame.channel).messages.cache.get(id);
					const embed = message.embeds[0].toJSON();

					if (miniGame.numbers.length !== 6)
					{
						embed.description += "\n\nTime has run out";
						miniGames.delete(id);
						return message.edit({ embeds: [ embed ], components: [] });
					}

					if (Object.keys(miniGame.attempts).length > 0)
					{
						const results = [];
						for (const i in miniGame.attempts)
						{
							const closeness =
								miniGame.attempts[i][0] == miniGame.target ?
									":white_check_mark:" :
								Math.abs(miniGame.target - miniGame.attempts[i][0]) <= 10 ? ":negative_squared_cross_mark:" :
									":x:";
							const result = `${closeness} <@${i}> – ${miniGame.attempts[i][0]}\n${"\u200b ".repeat(margin)}\`${miniGame.attempts[i][1]}\``
							results.push(result);
						}
						const resultFields = [ {
							name: "Results",
							value: results.sort((a, b) => {
								const aResult = Number(a.split('\n')[0].match(/[0-9]+/g)[1]);
								const bResult = Number(b.split('\n')[0].match(/[0-9]+/g)[1]);
								const aDist = Math.abs(miniGame.target - aResult);
								const bDist = Math.abs(miniGame.target - bResult);
								return aDist - bDist; }).join('\n') } ];
						embed.fields = resultFields;
					}
					else
					{
						embed.fields = [ { name: "Results", value: "No one answered in time" } ];
					}

					const value =
						Object.values(miniGame.attempts).some(value => value == miniGame.target) ?
							miniGame.attempts[Object.keys(miniGame.attempts).filter(a => miniGame.attempts[a][0] == miniGame.target)[0]][1] :
							miniGame.solution[1];
					const field = {
						name: `Possible Solution — ${miniGame.solution[0] == miniGame.target ? miniGame.target + " (Exact)": `Best is ${miniGame.solution[0]} (${Math.abs(miniGame.solution[0] - miniGame.target)} away)`}`,
						value: `${"\u200b ".repeat(margin)}\`${value}\`` };
					embed.fields.unshift(field);
					embed.title = "Time's Up!";
					message.edit({ embeds: [ embed ], components: [] });
					miniGames.delete(id);

					break;
				}
			}
		}
	});
}, 1000);