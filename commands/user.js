const Discord = require("discord.js"),
	{ games, client } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
exports.command = (message) => {
	if (message.channel.type == "dm" && Array.from(message.attachments).length > 0)
	{
		images = Array.from(message.attachments).map(m => m[1].url);
		client.guilds.cache.get("399327996076621825").channels.cache.get("537098266685472788").send(`Images from user <@${message.author.id}>: \n${images.join('\n')}`);
	}
	if (games.games.some((game) => game.channels.hasOwnProperty(message.channel.id) && game.started && game.canHaveTurn))
	{
		let game = games.games.filter((game) => game.channels.hasOwnProperty(message.channel.id))[0];
		if (message.author.id == game.player && {
			"squares": /^([a-j] ?(10|[1-9])|(10|[1-9]) ?[a-j])$/i,
			"othello": /^([a-h][1-8]|[1-8][a-h])$/i,
			"rokumoku": /^([a-s] ?1?[0-9]+|1?[0-9]+ ?[a-s])$/i,
			"connect4": /^[1-7]$/,
			"ttt3d": /^[1-4] ?([1-4] ?[a-d]|[a-d] ?[1-4])$/i,
			"ordo": /^(([a-j][1-8] [a-j][1-8]|[1-8][a-j] [1-8][a-j])|([a-j][1-8]-[a-j][1-8]|[1-8][a-j]-[1-8][a-j]) (up|right|down|left|[urdl]|north|south|east|west|[nsew]) [1-9])$/i,
			"soccer": /^([1-8]|([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?))$/i,
			"loa": /^([1-8][a-h]|[a-h][1-8]) ([1-8]|([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?))$/i,
			"latrones": /^(([1-8][a-h]|[a-h][1-8]|)(| (up|right|down|left|north|south|east|west|[urdlnsew])|(remove|capture))|(end|stop))$/i
		}[game.game].test(message.content))
		{
			if (message.channel.type !== "dm" && message.channel.guild.members.cache.get(client.user.id).hasPermission("MANAGE_MESSAGES"))
				message.delete();
			try
			{
				return games[game.game].takeTurn(message.channel.id, message.content);
			}
			catch (error)
			{
				games.games.forEach((game, index) => {
					if (game.channels.hasOwnProperty(message.channel.id))
					{
						for (let channel in game.channels)
							client.channels.cache.get(channel).send("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now!\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough!```");
						delete game;
						return games.games.splice(index, 1);
					}
				});
				let errs = [];
				for (let i = 0; i < error.stack.split('\n').length; i++)
				{
					if (error.stack.split('\n')[i].includes("at Client.emit"))
						break;
					else
						errs.push(error.stack.split('\n')[i]);
				}
				return client.channels.cache.get("467902250128506880").send(botError(message, errs));
			}
		}
		if (["board", "showboard"].includes(message.content))
			return message.channel.send(`It is <@${game.player}>'s turn.`, game.buffer);
	}
	if (games.minigames.some((minigame) => minigame.type == "iq" && minigame.channel == message.channel.id && message.content.toUpperCase() == minigame.ans))
	{
		games.minigames.forEach((minigame, index) => {
			if (minigame.type == "iq" && minigame.channel == message.channel.id && message.content.toUpperCase() == minigame.ans)
			{
				minigame.embeds.win.fields[0].value = minigame.embeds.win.fields[0].value.replace("$WINNER$", `<@!${message.author.id}>`);
				minigame.embeds.win.addField("\u200b", "Completed in `" + (minigame.sTime - minigame.timer) + "` seconds", true);
				message.channel.send(minigame.embeds.win);
				delete games.minigames[index];
				games.minigames.splice(index, 1);
			}
		});
	}
	if (games.minigames.some((minigame) => minigame.type == "hangman" && minigame.channel == message.channel.id && ((/^[a-z0-9]$/i.test(message.content) && !minigame.guesses.includes(message.content.toUpperCase())) || message.content.toUpperCase() == minigame.ans.join('').replace(/[\u0300-\u036f]/g, ''))))
	{
		let guess = message.content.toUpperCase();
		games.minigames.forEach((minigame, index) => {
			if (minigame.type == "hangman" && minigame.channel == message.channel.id)
			{
				let embed = new Discord.MessageEmbed()
					.setTitle("Hangman")
					.setAuthor("Hangman", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/hangman.png");
				if (/^[a-z0-9]$/i.test(message.content) && !minigame.guesses.includes(guess))
				{
					minigame.guesses.push(guess);
					if (minigame.ans.some(a => a.replace(/[\u0300-\u036f]/g, '') == message.content.toUpperCase()))
					{
						for (let letter in minigame.ans)
							if (minigame.ans[letter].replace(/[\u0300-\u036f]/g, '') == guess && minigame.right[letter] == '\u200b \u200b \u200b \u200b')
								minigame.right[letter] = minigame.ans[letter];
						if (!minigame.right.includes('\u200b \u200b \u200b \u200b'))
						{
							let display = [];
							minigame.ans.forEach((i) => {
								if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/i.test(i)) display.push("__" + i + "__");
								else display.push(i);
							});
							embed.addField(guess + " is in the word!", `<@!${message.author.id}> has finished the word!\n**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\``);
							embed.setColor(new Color(46, 204, 113).toHexa());
							delete games.minigames[index];
							games.minigames.splice(index, 1);
						}
						else
						{
							let display = [];
							minigame.right.forEach((i) => {
								if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/i.test(i)) display.push("__" + i + "__");
								else display.push(i);
							});
							embed.addField(guess + " is in the word!", `**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\`\nWrong guesses${(minigame.tries == 7 ? "" : " left")}: \`${minigame.tries}\``);
							embed.setColor(new Color(52, 152, 219).toHexa());
							minigame.timer = 180;
						}
					}
					else
					{
						minigame.tries--;
						if (minigame.tries == 0)
						{
							let display = [];
							minigame.ans.forEach((i) => {
								if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/i.test(i)) display.push("__" + i + "__");
								else display.push(i);
							});
							embed.addField(guess + " is not in the word!", `You guessed incorrectly too many times!\n**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\``);
							embed.setColor(new Color(231, 76, 60).toHexa());
							delete games.minigames[index];
							games.minigames.splice(index, 1);
						}
						else
						{
							let display = [];
							minigame.right.forEach((i) => {
								if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/i.test(i)) display.push("__" + i + "__");
								else display.push(i);
							});
							embed.addField(guess + " is not in the word!", `**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\`\nWrong guesses${(minigame.tries == 7 ? "" : " left")}: \`${minigame.tries}\``);
							embed.setColor(new Color(214, 196, 15).toHexa());
							minigame.timer = 180;
						}
					}
				}
				else
				{
					let display = [];
					minigame.ans.forEach((i) => {
						if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/i.test(i)) display.push("__" + i + "__");
						else display.push(i);
					});
					embed.addField("Solved!", `<@!${message.author.id}> has solved the word!\n**${display.join("\u200b \u200b")}**\nCategory: **${minigame.category}**${minigame.ans.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\nGuesses: \`${minigame.guesses.length == 0 ? "None" : minigame.guesses.join("` `")}\``);
					embed.setColor(new Color(46, 204, 113).toHexa());
					delete games.minigames[index];
					games.minigames.splice(index, 1);
				}
				message.channel.send(embed);
			}
		});
	}
}