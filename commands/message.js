import { client } from "../index.js";
import { Rules } from "../games/rules.js";
import { Games } from "../games/games.js";
import { Color } from "../assets/misc/color.js";
import { miniGames } from "../games/minigames.js";
import { command as quit } from "../commands/quit.js";
import slashCommandData from "./assets/misc/slashCommandData.json" assert { type: "json" };

export const command = async (message) => {
	if (message.author.id == client.user.id)
	{
		if (message.embeds.length > 0 && message.embeds[0].author.name == "trivia")
		{
			const trivia = {
				id: message.id,
				type: "trivia",
				completed: false,
				channel: message.channelId,
				wrongPeople: [],
				timer: 180 };
			miniGames.set(message.id, trivia);
			return;
		}

		if (message.embeds.length > 0 && message.embeds[0].author.name == "letters")
		{
			const letters = {
				id: message.id,
				picker: message.interaction.user.id,
				letters: [],
				available: [
					"aaaaaaaaaaaaaaaeeeeeeeeeeeeeeeeeeeeeiiiiiiiiiiiiiooooooooooooouuuuu".split(''),
					"bbcccddddddddffggghhjklllllmmmmnnnnnnnnppppqrrrrrrrrrssssssssstttttttttvwxyz".split('') ],
				type: "letters",
				channel: message.channelId,
				attempts: {},
				timer: 180 };
			miniGames.set(message.id, letters);
			return;
		}

		if (message.embeds.length > 0 && message.embeds[0].author.name == "numbers")
		{
			const numbers = {
				id: message.id,
				picker: message.interaction.user.id,
				numbers: [],
				available: [
					[25, 50, 75, 100],
					[1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10] ],
				type: "numbers",
				channel: message.channelId,
				attempts: {},
				timer: 180 };
			miniGames.set(message.id, numbers);
			return;
		}

		if (message.embeds.length > 0 && message.embeds[0].image)
		{
			const img = message.embeds[0].image.url;

			if (message.channel.type == "GUILD_TEXT" && /(?:connect4|squares|othello|rokumoku|ttt3d|ordo|soccer|loa|latrones|spiderlinetris)_[0-3]_[0-9]+\.png$/.test(img))
			{
				const id = img.match(/(?:connect4|squares|othello|rokumoku|ttt3d|ordo|soccer|loa|latrones|spiderlinetris)_[0-3]_([0-9]+)\.png$/)[1];
				const Game = Games.get(id);
				Game.channels[message.channelId].push(message.id);
			}
			return;
		}

		if (message.content.startsWith("**__Illegal Play__**\n"))
		{
			const Game = Games.find(game => game.channels.hasOwnProperty(message.channelId));
			Game.channels[message.channelId].push(message.id);
			return;
		}

		if (message.content.includes("letter") || message.content.includes("number") || message.content.includes("compute"))
		{
			setTimeout(() => { message.delete() }, 10000);
			return;
		}

		return;
	}
	
	const channel = client.channels.cache.get(message.channelId);
	if (!channel.permissionsFor(client.user.id).has([1n << 11n, 1n << 15n]))
	{
		return;
	}

	// Images from users
	if (channel.guildId == null && message.attachments.size > 0)
	{
		const images = Array.from(message.attachments).map(m => m[1].url);
		const owner = client.users.cache.get("357700219825160194");
		return owner.send(`Images from user <@${message.author.id}>: \n${images.join('\n')}`);
	}

	// Admin Commands
	if ((message.content == "x!setCommands" || message.content == "x!removeCommands") && ["357700219825160194"].includes(message.author.id))
	{
		if (client.user.id == "398606274721480725")
		{
			await client.application.commands.set(message.content == "x!setCommands" ? slashCommandData : []);
		}
		if (client.user.id == "442388557693321237")
		{
			client.guilds.cache.forEach(async guild => await guild.commands.set(message.content == "x!setCommands" ? slashCommandData : []));
		}
		return message.reply("Commands have been updated");
	}
	if (message.content.startsWith("x!js") && ["357700219825160194"].includes(message.author.id))
	{
		// return commands.get(command)(input, message);
		return await import(`./commands/js.js`).then(module => module.command(message.content.substring(5), message));
	}
	if (message.content.startsWith("x!pg") && ["357700219825160194"].includes(message.author.id))
	{
		// return commands.get(command)(input, message);
		return await import(`./commands/pg.js`).then(module => module.command(message.content.substring(5), message));
	}

	// Real Games
	if (Games.some(Game => Game.players.includes(message.author.id) && Game.channels.includes(message.channelId) && Game.canHaveTurn))
	{
		const Game = Games.find(Game => Game.player == message.author.id && Game.channels.includes(message.channelId));
		const regEx = {
			"squares": /^([a-j] ?(10|[1-9])|(10|[1-9]) ?[a-j])$/i,
			"othello": /^([a-h][1-8]|[1-8][a-h])$/i,
			"rokumoku": /^([a-s] ?1?[0-9]+|1?[0-9]+ ?[a-s])$/i,
			"connect4": /^[a-g]$/,
			"ttt3d": /^[1-4] ?([1-4] ?[a-d]|[a-d] ?[1-4])$/i,
			"ordo": /^(([a-j][1-8] [a-j][1-8]|[1-8][a-j] [1-8][a-j])|([a-j][1-8]-[a-j][1-8]|[1-8][a-j]-[1-8][a-j]) (up|right|down|left|[urdl]|north|south|east|west|[nsew]) [1-9])$/i,
			"soccer": /^([1-8]|([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?))$/i,
			"loa": /^([1-8][a-h]|[a-h][1-8]) ([1-8]|([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?))$/i,
			"latrones": /^(([1-8][a-h]|[a-h][1-8])|([1-8][a-h]|[a-h][1-8]) (up|right|down|left|north|south|east|west|[udlrnsew])|(up|right|down|left|north|south|east|west|[udlrnsew])|([1-8][a-h]|[a-h][1-8]) (remove|capture|cap|delete)|(end|stop))$/i,
			"spiderlinetris": /^([a-h][1-8]|[1-8][a-h])$/i
		}[Game.game];

		if (!regEx.test(message.content))
		{
			return;
		}

		try
		{
			return await Rules.takeTurn(Game.id, message);
		}
		catch (error)
		{
			const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/misc/avatar.png", name: "author.png" };
			const embed = {
				author: { name: "Xyvybot", icon_url: "attachment://author.png" },
				title: "Error in game: " + Game.name,
				description: "Well, I appear to have made an error somewhere. Don't worry, though, these things usually get fixed pretty soon.\nFor everyone's sake, this match has been ended. You can have a rematch soon when the issue has been resolved.",
				color: new Color().random().toInt() };

			for (const channel of Game.channels)
			{
				client.channels.cache.get(channel).send({ embeds: [embed], files: [author] });
			}

			const err = error.stack.split('\n');
			const errs = err.splice(err.indexOf(err.find(a => a.includes("at Client.emit"))));
			Games.delete(Game.id);
			return console.log(errs.join('\n'));
		}

		if (/(quit|leave|stop|forfeit|secede)/i.test(message.content))
		{
			return quit(false, message);
		}
	}

	// IQ
	if (miniGames.some(miniGame => miniGame.channel == message.channelId && miniGame.type == "iq" && message.content.toUpperCase() == miniGame.answer))
	{
		const miniGame = miniGames.find(miniGame => miniGame.channel == message.channelId && miniGame.type == "iq" && message.content.toUpperCase() == miniGame.answer);
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/iq.png", name: "author.png" };
		const embed = {
			author: { name: "IQ", icon_url: "attachment://author.png" },
			fields: [
			{	name: "Correct!",
				value: `<@!${message.author.id}> got it right!\n${miniGame.end}` },
			{	name: "\u200b",
				value: "Completed in `" + (miniGame.sTime - miniGame.timer) + "` seconds",
				inline: true } ],
			color: new Color(46, 204, 113).toInt(),
			footer: { text: "Friendly reminder that IQ is not real, it's simply an appropriate name for this feature." } };
		const actionRow = {
			type: 1,
			components: [
			{	type: 2,
				style: 3,
				label: "TRY ANOTHER",
				customId: "iq" } ] };

		message.reply({ embeds: [embed], files: [author], components: [actionRow], attachments: [] });
		miniGames.delete(message.channelId);
	}

	// Hangman
	if (miniGames.some(miniGame => miniGame.channel == message.channelId && miniGame.type == "hangman"))
	{
		const miniGame = miniGames.find(miniGame => miniGame.channel == message.channelId && miniGame.type == "hangman");
		const guess = message.content.toUpperCase();
		const information = {};

		if (guess == miniGame.answer.join('').replace(/[\u0300-\u036f]/g, '').toUpperCase())
		{
			miniGame.answer.forEach((letter, i)=> miniGame.current[i] = letter);
			information.color = "#22cc77";
			information.title = "Solved!";
			information.body = `<@!${message.author.id}> has solved the word!\n**$DISPLAY$**\nCategory: **${miniGame.category}**\n\nGuesses: \`${miniGame.guesses.join("` `")}\``;
			miniGame.complete = true;
		}

		if (!/^[A-Z0-9]$/i.test(guess) || miniGame.guesses.includes(guess))
		{
			return;
		}

		miniGame.guesses.push(guess);

		if (miniGame.answer.some(a => a.replace(/[\u0300-\u036f]/g, '') == message.content.toUpperCase()))
		{
			for (const letter in miniGame.answer)
			{
				if (miniGame.answer[letter].replace(/[\u0300-\u036f]/g, '') == guess && miniGame.current[letter] == false)
				{
					miniGame.current[letter] = miniGame.answer[letter];
				}
			}

			information.title = guess + " is in the word!";

			if (!miniGame.current.includes(false))
			{
				information.color = "#22cc77";
				information.body = `<@!${message.author.id}> has finished the word!\n**$DISPLAY$**\nCategory: **${miniGame.category}**\n\n__**Previous Guesses**__\n\`${miniGame.guesses.join("` `")}\``;
				miniGame.complete = true;
			}
			else
			{
				information.color = "#6666ff";
				information.body = `**$DISPLAY$**\nCategory: **${miniGame.category}**${miniGame.answer.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\n\`${miniGame.tries}\` wrong guess${miniGame.tries > 1 ? "es" : ''} left\n__**Previous Guesses**__\n\`${miniGame.guesses.join("` `")}\``;
			}
		}
		else
		{
			miniGame.tries--;
			information.title = guess + " is not in the word!";

			if (miniGame.tries == 0)
			{
				miniGame.answer.forEach((letter, i)=> miniGame.current[i] = letter);
				information.color = "#ff6666";
				information.body = `You guessed incorrectly too many times!\n**$DISPLAY$**\nCategory: **${miniGame.category}**\n\n__**Previous Guesses**__\n\`${miniGame.guesses.join("` `")}\``;
				miniGame.complete = true;
			}
			else
			{
				information.color = "#ffff66";
				information.body = `**$DISPLAY$**\nCategory: **${miniGame.category}**${miniGame.answer.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!\n" : ""}\n\n\`${miniGame.tries}\` wrong guess${miniGame.tries > 1 ? "es" : ''} left\n__**Previous Guesses**__\n\`${miniGame.guesses.join("` `")}\``;
			}
		}

		const display = [];
		miniGame.answer.forEach((letter, i) => {
			if (miniGame.current[i] === false)
			{
				display.push("__\u200b \u200b \u200b \u200b__")
			}
			else
			if (/^[A-Z0-9][\u0300-\u036f]$/i.test(letter))
			{
				display.push("__" + letter + "__");
			}
			else
			{
				display.push(letter);
			}
		});

		const hangman = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/main/hangman/" + miniGame.tries + ".png", name: "hangman.png" };
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/main/authors/hangman.png", name: "author.png" };
		const embed = {
			author: { name: "Hangman", icon_url: "attachment://author.png" },
			thumbnail: { url: "attachment://hangman.png" },
			fields: [ { name: information.title, value: information.body.replace("$DISPLAY$", display.join("\u200b \u200b")) } ],
			color: new Color(information.color).toInt() };

		message.reply({ embeds: [embed], files: [hangman, author] });

		if (miniGame.complete)
		{
			miniGames.delete(miniGame.id);
		}
		else
		{
			miniGame.timer = 180;
		}
	}

	// Letters
	if (/^[a-z]{1,9}$/.test(message.content.toLowerCase()) && miniGames.some(miniGame => miniGame.channel == message.channelId && miniGame.type == "letters"))
	{
		const miniGame = miniGames.find(miniGame => miniGame.channel == message.channelId && miniGame.type == "letters");
		const Message = client.channels.cache.get(miniGame.channel).messages.cache.get(miniGame.id);
		const word = message.content.toLowerCase();
		const usedLetters = word.split('');
		const availableLetters = miniGame.letters.concat();
		for (const l of usedLetters)
		{
			const L = l.toUpperCase();
			const i = availableLetters.indexOf(l);
			if (i !== -1)
			{
				availableLetters[i] = false;
			}
			else
			if (miniGame.letters.includes(l))
			{
				message.delete();
				return message.channel.send({ content: `${message.author} You cannot use letters more times than they appear — \`${L}\` used too many times` });
			}
			else
			{
				message.delete();
				return message.channel.send({ content: `${message.author} \`${L}\` is not an available letter` });
			}
		}

		if (!miniGame.attempts.hasOwnProperty(message.author.id))
		{
			miniGame.attempts[message.author.id] = word;
		}
		else
		if (word.length > miniGame.attempts[message.author.id].length)
		{
			miniGame.attempts[message.author.id] = word;
		}

		const attempts = [];
		for (const i in miniGame.attempts)
		{
			attempts.push(`<@${i}> – ${miniGame.attempts[i].length}`);
		}

		const newEmbed = Message.embeds[0].toJSON();
		const attemptsFields = [ {
			name: "Attempts",
			value: attempts.sort((a, b) => { return b[b.length - 1] - a[a.length - 1] }).join('\n') } ];
		newEmbed.fields = attemptsFields;

		message.delete();
		return Message.edit({ embeds: [ newEmbed ] });
	}

	// Numbers
	if (/^[0-9+\-*x/() ]+$/.test(message.content) && miniGames.some(miniGame => miniGame.channel == message.channelId && miniGame.type == "numbers"))
	{
		const miniGame = miniGames.find(miniGame => miniGame.channel == message.channelId && miniGame.type == "numbers");
		const Message = client.channels.cache.get(miniGame.channel).messages.cache.get(miniGame.id);
		const equation = message.content;
		const usedNumbers = equation.match(/[0-9]+/g);
		const availableNumbers = miniGame.numbers.concat();

		if (usedNumbers.length == 1)
		{
			message.delete();
			return message.channel.send({ content: `${message.author} You need to actually perform an operation` });
		}
		for (const n of usedNumbers)
		{
			const N = Number(n);
			const i = availableNumbers.indexOf(N);
			if (i !== -1)
			{
				availableNumbers[i] = false;
			}
			else
			if (miniGame.numbers.includes(N))
			{
				message.delete();
				return message.channel.send({ content: `${message.author} You cannot use numbers more times than they appear — \`${n}\` used too many times`, ephemeral: true });
			}
			else
			{
				message.delete();
				return message.channel.send({ content: `${message.author} \`${n}\` is not an available number`, ephemeral: true });
			}
		}

		const result = Math.calculate(equation);
		if (result[0] == "err")
		{
			message.delete();
			return message.channel.send({ content: `${message.author} Your answer does not compute`, ephemeral: true });
		}

		if (!miniGame.attempts.hasOwnProperty(message.author.id))
		{
			miniGame.attempts[message.author.id] = [result[1], equation];
		}
		else
		if (Math.abs(miniGame.target - miniGame.attempts[message.author.id][0]) > Math.abs(miniGame.target - result[1]))
		{
			miniGame.attempts[message.author.id] = [result[1], equation];
		}

		const attempts = [];
		for (const i in miniGame.attempts)
		{
			attempts.push(`<@${i}> – ${miniGame.attempts[i][0]}`);
		}

		const newEmbed = Message.embeds[0].toJSON();
		const attemptsFields = [ {
			name: "Attempts",
			value: attempts.sort((a, b) => { return b[b.length - 1] - a[a.length - 1] }).join('\n') } ];
		newEmbed.fields = attemptsFields;

		message.delete();
		return Message.edit({ embeds: [ newEmbed ] });
	}

	// Future minigames, please give me ideas
}