import { Xyvybot } from "../../index.js";
import { Rules } from "../../games/Rules.js";
import { Color } from "../../assets/misc/color.js";
import { Games } from "../../games/Games.js";
import { miniGames } from "../../games/miniGames.js";
import slashCommandData from "../../assets/misc/slashCommandData.json" assert { type: "json" };
import { deleteMessage } from "../../index/discordFunctions.js";
import emoji from "../../assets/misc/emoji.json" assert { type: "json" };

export const command = async (message) => {
	if (message.author.id == Xyvybot.user.id)
	{
		if (["trivia", "letters", "numbers", "hangman", "iq"].includes(message.embeds[0]?.author?.name) && miniGames.some(miniGame => miniGame.channelId == message.channelId))
		{
			const miniGame = miniGames.find(miniGame => miniGame.channelId == message.channelId);
			miniGame.messageId = message.id;
			return;
		}

		if (message.embeds[0]?.image)
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
			const Game = Games.find(game => game.channels.includes(message.channelId));
			const index = Game.channels.indexOf(message.channelId);
			Game.messages[index].push(message.id);
			return;
		}

		if (/(letter|number|compute)/.test(message.content))
		{
			setTimeout(() => { deleteMessage(message); }, 10000);
			return;
		}

		return;
	}

	if (message.author.bot)
	{
		return;
	}

	const channel = await Xyvybot.channels.fetch(message.channelId);
	if (channel.guildId !== null && !channel.permissionsFor(Xyvybot.user.id).has([1n << 11n, 1n << 15n]))
	{
		return;
	}
	if (channel.guildId == null && message.attachments.size > 0)
	{
		const images = Array.from(message.attachments).map(m => m[1].url);
		const owner = await Xyvybot.users.fetch("357700219825160194");
		return owner.send(`Images from user ${message.author}: \n${images.join('\n')}`);
	}

	if ((message.content == "x!setCommands" || message.content == "x!removeCommands") && ["357700219825160194"].includes(message.author.id))
	{
		Xyvybot.guilds.cache.forEach(async guild => await guild.commands.set(message.content == "x!setCommands" ? slashCommandData : []));
		return message.reply("Commands have been updated");
	}
	if (message.content.startsWith("x!js") && ["357700219825160194"].includes(message.author.id))
	{
		// return await Commands.message.get("js")(message.content.substring(5), message);
		return await import(`./js.js`).then(module => module.command(message.content.substring(5), message));
	}
	if (message.content.startsWith("x!pg") && ["357700219825160194"].includes(message.author.id))
	{
		// return await Commands.message.get("pg")(message.content.substring(5), message);
		return await import(`./pg.js`).then(module => module.command(message.content.substring(5), message));
	}

	if (Games.some(Game => Game.player == message.author.id && Game.channels.includes(message.channelId) && Game.canHaveTurn))
	{
		const Game = Games.find(Game => Game.player == message.author.id && Game.channels.includes(message.channelId));
		if (!Game)
		{
			return;
		}

		const regEx = {
			"squares": /^([a-h] ?[1-8]|[1-8] ?[a-h])$/i,
			"othello": /^([a-h] ?[1-8]|[1-8] ?[a-h])$/i,
			"rokumoku": /^([a-s] ?1?[0-9]+|1?[0-9]+ ?[a-s])$/i,
			"connect4": /^[a-g]$/,
			"ttt3d": /^[1-4] ?([1-4] ?[a-d]|[a-d] ?[1-4])$/i,
			"ordo": /^(([a-j][1-8] [a-j][1-8]|[1-8][a-j] [1-8][a-j])|([a-j][1-8]-[a-j][1-8]|[1-8][a-j]-[1-8][a-j]) (up|right|down|left|[urdl]|north|south|east|west|[nsew]) [1-9])$/i,
			"soccer": /^([1-8]|([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?))$/i,
			"loa": /^([1-8][a-h]|[a-h][1-8]) ([1-8]|([ns] ?[ew]?|[ew] ?[ns]?)|([ud] ?[lr]?|[lr] ?[ud]?)|((north|south) ?(east|west)?|(east|west) ?(north|south)?)|((up|down) ?(left|right)?|(left|right) ?(up|down)?))$/i,
			"latrones": /^(([1-8][a-h]|[a-h][1-8])|([1-8][a-h]|[a-h][1-8]) (up|right|down|left|north|south|east|west|[udlrnsew])|(up|right|down|left|north|south|east|west|[udlrnsew])|([1-8][a-h]|[a-h][1-8]) (remove|capture|cap|delete)|(end|stop))$/i,
			"spiderlinetris": /^([a-h] ?[1-8]|[1-8] ?[a-h])$/i
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
			console.log(error);
			const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/misc/avatar.png", name: "author.png" };
			const embed = {
				author: { name: "Xyvybot", icon_url: "attachment://author.png" },
				title: "Error in game: " + Game.name,
				description: "Well, I appear to have made an error somewhere. Don't worry, though, these things usually get fixed pretty soon.\nFor everyone's sake, this match has been ended. You can have a rematch soon when the issue has been resolved.",
				color: new Color().random().toInt() };

			Game.channels.forEach(async channelId => {
				const Channel = await Xyvybot.channels.fetch(channelId);
				await Channel.send({ embeds: [embed], files: [author] });
			});

			const err = error.stack.split('\n');
			const errs = err.splice(err.indexOf(err.find(a => a.includes("at Client.emit"))));
			Games.delete(Game.id);
			return console.log(err, '\n', errs.join('\n'));
		}

		if (/(quit|leave|stop|forfeit|secede)/i.test(message.content))
		{
			return quit(false, message);
		}
	}

	if (/^[a-z]{1,9}$/.test(message.content.toLowerCase()) && miniGames.some(miniGame => miniGame.channelId == message.channelId && miniGame.type == "letters"))
	{
		const miniGame = miniGames.find(miniGame => miniGame.channelId == message.channelId && miniGame.type == "letters");
		const word = message.content.toLowerCase();
		const userId = message.author.id;
		deleteMessage(message);
		
		const user = await Xyvybot.users.fetch(userId);
		const channel = await Xyvybot.channels.fetch(miniGame.channelId)
		const Message = await channel.messages.fetch(miniGame.messageId);
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
				return await channel.send({ content: `${user} You cannot use letters more times than they appear — \`${L}\` used too many times` });
			}
			else
			{
				return await channel.send({ content: `${user} \`${L}\` is not an available letter` });
			}
		}

		if (!miniGame.attempts.hasOwnProperty(user.id))
		{
			miniGame.attempts[user.id] = word;
		}
		else
		if (word.length > miniGame.attempts[user.id].length)
		{
			miniGame.attempts[user.id] = word;
		}

		const attempts = [];
		Object.keys(miniGame.attempts).forEach(userId => attempts.push(`<@${userId}> – ${miniGame.attempts[userId].length}`));

		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/letters.png", name: "author.png" };
		const embed = {
			author: { name: "letters", icon_url: "attachment://author.png" },
			description: `Time's up <t:${(Date.now() / 1000 | 0) + miniGame.timer}:R>\n\n:regional_indicator_${miniGame.letters.join(": \u200b :regional_indicator_")}:`,
			fields: [ { name: "Attempts", value: attempts.sort((a, b) => { return b[b.length - 1] - a[a.length - 1] }).join('\n') } ],
			color: new Color().random().toInt() };

		return await Message.edit({ embeds: [embed], files: [author], attachments: [] });
	}
	if (/^[0-9+\-*x/() ]+$/.test(message.content) && miniGames.some(miniGame => miniGame.channelId == message.channelId && miniGame.type == "numbers"))
	{
		const miniGame = miniGames.find(miniGame => miniGame.channelId == message.channelId && miniGame.type == "numbers");
		const equation = message.content;
		const userId = message.author.id;
		deleteMessage(message);

		const user = await Xyvybot.users.fetch(userId);
		const channel = await Xyvybot.channels.fetch(miniGame.channelId)
		const Message = await channel.messages.fetch(miniGame.messageId);
		const usedNumbers = equation.match(/[0-9]+/g);
		const availableNumbers = miniGame.numbers.concat();

		if (usedNumbers.length == 1)
		{
			return await channel.send({ content: `${user} You need to actually perform an operation` });
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
				return await channel.send({ content: `${user} You cannot use numbers more times than they appear — \`${n}\` used too many times`, ephemeral: true });
			}
			else
			{
				return await channel.send({ content: `${user} \`${n}\` is not an available number`, ephemeral: true });
			}
		}

		const result = Math.calculate(equation);
		if (result[0] == "err")
		{
			return await channel.send({ content: `${user} Your answer does not compute`, ephemeral: true });
		}

		if (!miniGame.attempts.hasOwnProperty(user.id))
		{
			miniGame.attempts[user.id] = [result[1], equation];
		}
		else
		if (Math.abs(miniGame.target - miniGame.attempts[user.id][0]) > Math.abs(miniGame.target - result[1]))
		{
			miniGame.attempts[user.id] = [result[1], equation];
		}

		const attempts = [];
		for (const i in miniGame.attempts)
		{
			attempts.push(`<@${i}> – ${miniGame.attempts[i][0]}`);
		}

		const emojis = `:zero: :one: :two: :three: :four: :five: :six: :seven: :eight: :nine: :keycap_ten: <:${emoji.twentyfive.name}:${emoji.twentyfive.id}> <:${emoji.fifty.name}:${emoji.fifty.id}> <:${emoji.seventyfive.name}:${emoji.seventyfive.id}> <:${emoji.onehundred.name}:${emoji.onehundred.id}>`.split(' ');
		const description = [];
		for (let i = 0; i < 6; i++)
		{
			const n = miniGame.numbers[i];
			description.push(n === undefined ? ":stop_button:" : emojis[n <= 10 ? n : n / 25 + 10]);
			description.push(" \u200b ");
		}
		description.pop();

		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/numbers.png", name: "author.png" };
		const embed = {
			author: { name: "numbers", icon_url: "attachment://author.png" },
			description: `Times up <t:${(Date.now() / 1000 | 0) + miniGame.timer}:R>\n\nTarget: ${emojis[String(miniGame.target)[0]]}${emojis[String(miniGame.target)[1]]}${emojis[String(miniGame.target)[2]]}\n\n${description.join('')}`,
			fields: [ { name: "Attempts", value: attempts.sort((a, b) => { return b[b.length - 1] - a[a.length - 1] }).join('\n') } ],
			color: new Color().random().toInt() };

		return await Message.edit({ embeds: [embed], files: [author], attachments: [] });
	}
	if (miniGames.some(miniGame => miniGame.type == "hangman" && miniGame.channelId == message.channelId))
	{
		const miniGame = miniGames.find(miniGame => miniGame.channelId == message.channelId && miniGame.type == "hangman");
		const guess = message.content.toUpperCase();
		const information = { action: '', timer: '', guessesLeft: '', previousGuesses: '' };
		const channel = await Xyvybot.channels.fetch(miniGame.channelId);
		const messageId = await channel.messages.fetch(miniGame.messageId);
		const lastUserMessage = await channel.messages.fetch(miniGame.lastUserMessage);

		if (guess == miniGame.answer.join('').replace(/[\u0300-\u036f]/g, '').toUpperCase())
		{
			miniGame.complete = true;
		}
		else
		if (!/^[A-Z0-9]$/i.test(guess) || miniGame.guesses.includes(guess))
		{
			return;
		}
		else
		{
			miniGame.guesses.push(guess);
		}

		miniGame.lastUserMessage = message.id;

		if (miniGame.complete)
		{
			miniGame.answer.forEach((letter, i) => miniGame.current[i] = letter);
			information.color = "#22cc77";
			information.title = "Solved!";
			information.action = `${message.author} has solved the ${miniGame.answer.includes(' ') ? "phrase" : "word"}!`;
		}
		else
		if (miniGame.answer.some(a => a.replace(/[\u0300-\u036f]/g, '') == guess))
		{
			miniGame.answer.forEach((letter, i) => {
				if (letter.replace(/[\u0300-\u036f]/g, '') == guess && miniGame.current[i] == false)
				{
					miniGame.current[i] = letter;
				}
			});

			information.title = `${guess} is in the ${miniGame.answer.includes(' ') ? "phrase" : "word"}!`;

			if (!miniGame.current.includes(false))
			{
				information.color = "#22cc77";
				information.action = `${message.author} has finished the ${miniGame.answer.includes(' ') ? "phrase" : "word"}!`;
				miniGame.complete = true;
			}
			else
			{
				information.color = "#6666ff";
				information.timer = `Time's up <t:${(Date.now() / 1000 | 0) + 180}:R>\n`;
				information.guessesLeft = `\`${miniGame.tries}\` wrong guess${miniGame.tries > 1 ? "es" : ''} left\n`;
			}
		}
		else
		{
			miniGame.tries--;
			information.title = `${guess} is not in the ${miniGame.answer.includes(' ') ? "phrase" : "word"}!`;

			if (miniGame.tries == 0)
			{
				miniGame.answer.forEach((letter, i)=> miniGame.current[i] = letter);
				information.color = "#ff6666";
				information.action = "You guessed incorrectly too many times!";
				miniGame.complete = true;
			}
			else
			{
				information.color = "#ffff66";
				information.timer = `Time's up <t:${(Date.now() / 1000 | 0) + 180}:R>\n`;
				information.guessesLeft = `\`${miniGame.tries}\` wrong guess${miniGame.tries > 1 ? "es" : ''} left\n`;

			}
		}
		information.previousGuesses = miniGame.guesses.length > 0 ? `__**Guesses**__\n\`${miniGame.guesses.join("` `")}\`` : "__**Guesses**__\nNone";

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

		const thumbnail = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/main/hangman/" + miniGame.tries + ".png", name: "hangman.png" };
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/main/authors/hangman.png", name: "author.png" };
		const embed = {
			author: { name: "hangman", icon_url: "attachment://author.png" },
			thumbnail: { url: "attachment://hangman.png" },
			fields: [ { name: information.title, value: [
				information.action,
				`**${display.join("\u200b \u200b")}**`,
				`Category: **${miniGame.category}**${!miniGame.complete && miniGame.answer.some(letter => /[0-9]/.test(letter)) ? "\nThere are numbers in this solution!" : ""}`,
				'',
				information.timer + information.guessesLeft + information.previousGuesses ].join('\n') } ],
			color: new Color(information.color).toInt() };

		channel.send({ embeds: [embed], files: [thumbnail, author] });
		
		await deleteMessage(messageId);
		if (!miniGame.first)
		{
			await deleteMessage(lastUserMessage);
		}

		if (miniGame.complete)
		{
			miniGames.delete(miniGame.id);
		}
		else
		{
			miniGame.timer = 180;
		}
		return;
	}
	if (miniGames.some(miniGame => miniGame.type == "iq" && miniGame.channelId == message.channelId && message.content.toUpperCase() == miniGame.answer))
	{
		const channel = await Xyvybot.channels.fetch(message.channelId);
		const Message = await channel.message.fetch(miniGame.messageId);
		const miniGame = miniGames.find(miniGame => miniGame.channelId == message.channelId && miniGame.type == "iq" && message.content.toUpperCase() == miniGame.answer);
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/iq.png", name: "author.png" };
		const embed = {
			author: { name: "IQ", icon_url: "attachment://author.png" },
			fields: [
			{	name: "Correct!",
				value: `${message.author} got it right!\n${miniGame.end}` },
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

		miniGames.delete(miniGame.id);
		await deleteMessage(Message);
		await message.reply({ embeds: [embed], files: [author], components: [actionRow], attachments: [] });
		return;
	}
}