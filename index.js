import "./assets/prototypes/math.js";
import "./assets/prototypes/array.js";

import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, Collection } from "discord.js";
const intents = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	// GatewayIntentBits.GuildBans,
	// GatewayIntentBits.GuildEmojisAndStickers,
	// GatewayIntentBits.GuildIntegrations,
	// GatewayIntentBits.GuildWebhooks,
	// GatewayIntentBits.GuildInvites,
	// GatewayIntentBits.GuildVoiceStates,
	// GatewayIntentBits.GuildPresences,
	GatewayIntentBits.GuildMessages,
	// GatewayIntentBits.GuildMessageReactions,
	// GatewayIntentBits.GuildMessageTyping,
	GatewayIntentBits.DirectMessages,
	// GatewayIntentBits.DirectMessageReactions,
	// GatewayIntentBits.DirectMessageTyping,
	GatewayIntentBits.MessageContent,
	// GatewayIntentBits.GuildScheduledEvents
];

export const client = new Client({ intents: intents });
import PG from "pg";
import { Color } from "./assets/misc/color.js";
export const gameCount = 10;
export const newUser = async (id) => {
	const image = images.ids.random();
	const query =
		`INSERT INTO profiles (\n` +
		`	id, elos, wins, loss, ties, money, color, title, lefty, background, backgrounds\n` +
		`) VALUES (\n` +
		`	'${id}', ARRAY[1000${",1000".repeat(gameCount - 1)}], ${`ARRAY[0${",0".repeat(gameCount - 1)}]`.repeat(3)}, 0, '#2f3136', 'Casual Gamer', ${images.display.right.includes(image) ? false : true}, '${image}', ARRAY ['${image}']\n` +
		`)`;
	await db.query(query).catch(() => {});
	const profile = {
		id: id, color: "#aaa", title: "Casual Gamer", background: image, backgrounds: [image],
		lefty: !images.display.right.includes(image), money: 500,
		elos: [],
		wins: [],
		loss: [],
		ties: [] };
	for (let i = 0; i < gameCount; i++)
	{
		profile.elos.push(1000);
		profile.wins.push(0);
		profile.loss.push(0);
		profile.ties.push(0);
	}
	return profile;
}

export const db = new PG.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, keepAlive: true });
export const bannedUsers = [];

import Package from "./package.json" assert { type: "json" };
export const version = Package.version;
import images from "./assets/profile/backgrounds.json" assert { type: "json" };
export const emoji = {
	next_1:			{ name: "next_1",		id: "1010988249541529622" },
	next_2:			{ name: "next_2",		id: "1010988242507681793" },
	next_3:			{ name: "next_3",		id: "1010988236899885207" },
	previous_1:		{ name: "previous_1",	id: "1010988231250157609" },
	previous_2:		{ name: "previous_2",	id: "1010988225625587712" },
	previous_3:		{ name: "previous_3",	id: "1010988218570776586" },
	check:			{ name: "check",		id: "1011006269815017492" },
	uncheck:		{ name: "uncheck",		id: "1011006268783206541" },
	loading:		{ name: "loading",		id: "1010988190250848276" },
	twentyfive:		{ name: "twentyfive",	id: "1035035329750642728" },
	fifty:			{ name: "fifty",		id: "1035035340471291905" },
	seventyfive:	{ name: "seventyfive",	id: "1035035349568733234" },
	onehundred:		{ name: "onehundred",	id: "1035056635774783551" } };

// const commands = new Collection();
const commandNames = [ "message", "bug", "credits", "game", "games", "graph", "history", "help", "hangman", "iq", "minesweeper", "trivia", /*"nekos", "nsfw",*/ "profile", "request", "leaderboard", "js", "pg", "ban", "setup", "quit", "replay" ];
for (let command of commandNames)
{
	import(`./commands/${command}.js`).then;
}

// console.log(commands);

const botError = async (err, object, isMessage) => {
	const errs = [];
	for (let i = 0; i < err.stack.split('\n').length; i++)
	{
		if (err.stack.split('\n')[i].includes("at Client.emit"))
		{
			break;
		}
		else
		{
			errs.push(err.stack.split('\n')[i]);
		}
	}
	
	if (isMessage && !(object.author.bot || !object.content.startsWith("x!")))
	{
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/misc/avatar.png", name: "author.png" };
		const embed = {
			author: { name: "Xyvybot", icon_url: "attachment://author.png" },
			title: "Error on command: " + object.content.split(' ')[0].substring(2),
			description: "```\n" + errs.join('\n') + "\n```",
			color: new Color().random().toInt() };

		object[object.replied ? "editReply" : "reply"]({ embeds: [embed], files: [author] });
		(await client.channels.fetch("847316212203126814")).send({ embeds: [embed], files: [author] });
		return;
	}
	if (!isMessage)
	{
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/misc/avatar.png", name: "author.png" };
		const embed = {
			author: { name: "Xyvybot", icon_url: "attachment://author.png" },
			title: "Error on command: " + (object.commandName || object.customId.split('.')[0]),
			description: "```\n" + errs.join('\n') + "\n```",
			color: new Color().random().toInt() };

		object[object.replied ? "editReply" : "reply"]({ embeds: [embed], files: [author] });
		(await client.channels.fetch("847316212203126814")).send({ embeds: [embed], files: [author] });
	}
}

client.once("ready", async () => {
	client.user.setPresence({ status: "ONLINE", activity: { name: version + "!", type: "PLAYING" } });
	setInterval(() => {
		client.user.setPresence({
			status: "ONLINE", activity: { name: [
				version + "!",
				"in " + client.guilds.cache.size + " servers!",
				"Use the command /help for a list of commands!",
				"Now fully converted to slash commands and buttons!",
				"Used by at least one person every day!",
				"Reversi and Chill",
				"I currently have 10 playable games, and I want to add more. Suggest your favorite Abstract Strategy Game with the command /request!",
				"What games do you want to see me support? Use the command /request to send me some suggestions!",
				"they don't think it be like it is, but it do",
				"I will never support Chess. There's already a bot for that. It's literally called Chess Bot. I will not be doing that, thank you.",
				"One day, I'll be completed.",
				"Did you know you can play some games against me myself?",
				"No human has ever beaten my AI bot in a game of Squares!",
				"The best bot for playing a specific collection of Abstract Strategy Games that I know of!",
				"You can also play games via DMs! Someone else has to want to play somewhere else, though.",
				"Some day, I'll be a popular bot.",
				"Ever heard of the game Ordo?",
				"Adding Go would be a mistake because there's no guaranteed end to it. It just goes on and on until both players decide they're done or somebody dies and time runs out.",
				"Now with slash commands!",
				"Let's play Countdown!" ].random(), type: "PLAYING" } }); }, 30000);

	await db.connect();

	const bannedusers = (await db.query("SELECT * FROM bannedusers")).rows;
	for (let user of bannedusers) bannedUsers.push(user.id);
});
client.on('messageCreate', async message => {
	const channel = client.channels.cache.get(message.channelId);
	if (!channel)
	{	// Can't find channel??
		return;
	}
	if (channel.guildId != null)
	{
		if (![0, 1, 3, 5, 10, 11, 12].includes(channel.type))
		{	// Invalid channel types
			return;
		}
		if (!channel.permissionsFor(client.user.id)?.has(1n << 11n) || !channel.permissionsFor(client.user.id).has(1n << 15n))
		{	// Lacks Send Messages and Attach Files permissions
			return;
		}
		if (([10, 11, 12].includes(channel.type)) && !channel.permissionsFor(client.user.id).has(1n << 38n))
		{	// Lacks Send Message in Threads permission
			return;
		}
	}

	try
	{
		if (message.author.id == client.user.id || !message.author.bot)
		{
			// return commands.get("message")(message);
			return await import(`./commands/message.js`).then(module => module.command(message));
		}
	}
	catch (err)
	{
		return botError(err, message, true);
	}
});
client.on('interactionCreate', async interaction => {
	if (interaction.user.bot)
	{
		return;
	}

	try {
		if ((interaction.isButton() || interaction.isSelectMenu()) && (!interaction.customId.startsWith("trivia") && Math.abs(new Date().getTime() - (interaction.message.editedTimestamp || interaction.message.createdTimestamp)) >= (1800000)))
		{
			const actionRow = {
				type: 1,
				components: [
				{	type: 2, style: 4, // Red Button
					customId: "do.nothing",
					label: "This interaction has expired",
					disabled: true } ] };
			return interaction.update({ components: [actionRow] });
		}

		const channel = client.channels.cache.get(interaction.channelId);
		if (![0, 1, 3, 5, 10, 11, 12].includes(channel.type))
		{	// Invalid channel types
			return;
		}

		const command = interaction.isCommand() ? interaction.commandName : interaction.customId.split('.')[0];
		const games = ["othello", "squares", "rokumoku", "3dtictactoe", "connect4", "ordo", "papersoccer", "linesofaction", "latrones", "spiderlinetris"];
		const permissions = channel.permissionsFor(client.user.id);
		if ([10, 11, 12].includes(channel.type) && !permissions.has(1n << 38n))
		{
			return interaction.reply({ content: "This command is disabled in this thread due to incorrect permissions. Contact the server staff about correcting this.", ephemeral: true });
		}

		const text = "This command is disabled in this channel due to missing specific permissions. Contact the server staff about correcting this.";
		const customEmoji = !permissions.has(1n << 18n);
		const requirementChannels = [
			// [], [], [],
			games.concat(["hangman", "history", "iq", "leaderboard", "profile", "replay", "trivia"]),
			games.concat(["hangman", "iq", "trivia"]),
			games.concat(["hangman", "history", "iq", "leaderboard", "profile", "replay", "trivia"]),
		];
		const perms = [
			requirementChannels[0].includes(command) && !permissions.has(1n << 10n),
			requirementChannels[1].includes(command) && !permissions.has(1n << 11n),
			requirementChannels[2].includes(command) && !permissions.has(1n << 15n) ];

		if (perms.includes(true))
		{
			return interaction.reply({
				content: text + "\n\n__Required Permissions__:\n" + perms.filter((perm, index) => requirementChannels[index].includes(command)).map((perm, index) => {
					const title = [ "View Channel", "Send Messages", "Attach Files" ].filter((perm, index) => requirementChannels[index].includes(command))[index];
					return `${perm ? customEmoji ? ":x:" : `<:uncheck:1011006268783206541>` : customEmoji ? ":white_check_mark:" : `<:check:1011006269815017492>`} **${title}**`
				}).join('\n'), ephemeral: true });
		}

		// return commands.get(interaction.commandName)(interaction);
		return await import(`./commands/${games.includes(command) ? "game" : command}.js`).then(module => module.command(interaction));
	}
	catch (err)
	{
		return botError(err, interaction, false);
	}
});
client.on('guildCreate', async guild => {
	const owner = await guild.members.fetch(guild.ownerId);
	const embed = {
		author: { name: "Thank you for installing Xyvybot!", url: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/misc/avatar.png" },
		description:
			"To set it up correctly, use the command /setup in whichever channels you want it to be used in and adjust permissions as needed. " +
			"Don't worry, it only needs a few basic permissions your typical server member would have anyways.\n\n" +
			"To avoid injury, the bot will disable certain features if it does not have the necessary permissions in a given channel. " +
			"This is done to avoid it crashing via attempting to do something it's not allowed to do.\n\n" +
			"Once your channels are all set up, the bot is good to go. Enjoy!",
		color: new Color().random().toInt() };

	owner.send({ embeds: [embed] });
});

import { Games } from "./games/games.js";
import { Rules } from "./games/rules.js";
const channelDelete = async (Thing, thing) => {
	const Game = Games.find(game => game[thing + "s"].includes(Thing.id));
	if (!Game)
	{
		return;
	}

	const display = await Rules.drawBoard(Game);
	const imageName = `${Game.game}_${Game.end}_${Game.id}.png`;
	const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png", name: "author.png" };
	const attachment = { attachment: display, name: imageName };
	const embed = {
		author: {
			name: `${Game.name} | x!${Game.game} | [Rules]`,
			icon_url: "attachment://author.png",
			url: "https://github.com/Xyvyrianeth/xyvybot_assets/wiki/" + Game.game },
		description: `<@${Game.players[0]}> VS <@${Game.players[1]}>\n\n${Game.endMessage()}`,
		image: { url: "attachment://" + imageName },
		color: new Color(Game.turnColors[Game.turn | 0]).toInt() };
	const payload = {
		content: "The server you were playing a game in has either been deleted or has removed me. For your convenience, you may now play the game here.",
		embeds: [embed],
		files: [author, attachment] };

	if (Game[thing + "s"][0] !== Game[thing + "s"][1])
	{
		const index = Game[thing + "s"].indexOf(Thing.id);
		const playerId = Game.players[index];
		client.users.send(playerId, payload).then(message => Game.channels[index] = message.channelId);
		Game.guilds[index] = null;
	}
	for (const index in Game.players)
	{
		const playerId = Game.players[index];
		client.users.send(playerId, payload).then(message => Game.channels[index] = message.channelId);
		Game.guilds[index] = null;
	}
}
client.on('channelDelete', channel => channelDelete(channel, "channel"));
client.on('threadDelete', channel => channelDelete(channel, "channel"));
client.on('guildDelete', guild => channelDelete(guild, "guild"));

client.login(process.env.TOKEN);
db.on('error', async err => {
	console.log(err, JSON.stringify(err));
	// query = query.replace(/`/, "\\`");

	// const files = [];
	// if (query.length > 1536)
	// {
	// 	await fs.writeFile("query.sql", query, () => file = new MessageAttachment("query.sql"));
	// 	const overflow = { attachment: "query.sql", name: "query.sql" };
	// 	files.push(overflow);
	// }

	// const author = { attachment: "./assets/misc/avatar.png", name: "author.png" };
	// const embed = {
	// 	author: { name: "Xyvybot", icon_url: "attachment://author.png" },
	// 	title: "SQL Error at: " + location,
	// 	description: "Query:\n```sql\n" + '' + "\n```\n\nError:\n```" + err + "\n```",
	// 	color: new Color().random().toInt() };
	// files.push(author);

	// await client.channels.fetch("847758556803235840").send({ embeds: [embed], files: files });
	// if (query.length > 1536)
	// {
	// 	fs.unlinkSync("query.sql");
	// }

	db.end();
	db = new PG.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, keepAlive: true });
	db.connect();
});