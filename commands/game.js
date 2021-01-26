const Discord = require("discord.js");
var { Color } = require("/app/assets/misc/color.js"),
	games = {
		games:    require("/app/games/games.js").games,
		othello:  require("/app/games/othello.js"),
		squares:  require("/app/games/squares.js"),
		rokumoku: require("/app/games/rokumoku.js"),
		ttt3d:    require("/app/games/3dttt.js"),
		connect4: require("/app/games/connect4.js"),
		ordo:     require("/app/games/ordo.js"),
		soccer:   require("/app/games/soccer.js"),
		loa:      require("/app/games/loa.js"),
		latrones: require("/app/games/latrones.js")
	};
exports.command = (cmd, args, input, message) => {
	let gameNicks = {
		"othello": ["othello", "reversi"],
		"squares": ["squares"],
		"rokumoku": ["rokumoku", "rm", "rokum", "rmoku", "connect6", "connectsix", "c6", "csix"],
		"ttt3d": ["3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe"],
		"connect4": ["connectfour", "connect4", "cfour", "c4"],
		"ordo": ["ordo"],
		"soccer": ["soccer", "papersoccer", "psoccer"],
		"loa": ["linesofaction", "loa", "lines"],
		"latrones": ["latrones", "ludus", "latrunculi"] };
	let gameName;
	Object.keys(gameNicks).forEach(game => {
		if (gameNicks[game].includes(cmd)) gameName = game; });
	let GameName = {
		"othello": "Othello",
		"squares": "Squares",
		"rokumoku": "Rokumoku",
		"ttt3d": "3D Tic Tac Toe",
		"connect4": "Connect Four",
		"ordo": "Ordo",
		"soccer": "Paper Soccer",
		"loa": "Lines of Action",
		"latrones": "Latrones" }[gameName];
	if (!input)
		return message.channel.send(`__**${GameName}**__\nTo start a game, type "x!${cmd} start"!\nTo learn the rules, type "x!${cmd} rules"!`);
	condition = (condition) => {
		return {
			"noGame":			 (game) => game.game == gameName,
			"noGameHere":		 (game) => game.game == gameName && !game.channels.hasOwnProperty(message.channel.id),
			"gameHere":			 (game) => game.game == gameName && !game.started && game.channels.hasOwnProperty(message.channel.id),
			"gameThere":		 (game) => game.game == gameName && !game.started && !game.channels.hasOwnProperty(message.channel.id) && !game.here,
			"playingYourself":	 (game) => game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.game == gameName && !game.started,
			"somethingElseHere": (game) => game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.game !== gameName && !game.started,
			"someoneElseHere": 	 (game) => game.channels.hasOwnProperty(message.channel.id) && game.game !== gameName && !game.started,
			"gameStarted":		 (game) => game.channels.hasOwnProperty(message.channel.id) && game.started,
			"alreadyQueued":	 (game) => !game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.game == gameName,
			"nothingHere":		 (game) => game.channels.hasOwnProperty(message.channel.id),
			"participant":		 (game) => game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id),
			"dontStart":		 (game) => game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && !game.started,
			"quit":				 (game) => game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.started }[condition]; }
	if (["start"].includes(args[0]))
	{
		if (games.games.some(condition("alreadyQueued")))
			return message.channel.send("You are already queued for that game somewhere else!");
		if (games.games.some(condition("playingYourself")))
			return message.channel.send("You cannot play a game against yourself!");
		if (games.games.some(condition("somethingElseHere")))
			return message.channel.send("You're already queued for a different game in this channel!");
		if (games.games.some(condition("someoneElseHere")))
			return message.channel.send("Someone is already queueing for a different game in this channel!");
		if (games.games.some(condition("gameStarted")))
			return message.channel.send("There is already an active game in this channel!");

		if (["here"].includes(args[1]))
		{
			if (games.games.some(condition("gameHere")))
			{
				let game = games.games.filter(condition("gameHere"))[0];
				return games[gameName].startGame(Object.keys(game.channels)[0], message.channel.id, message.author.id);
			}
			if (games.games.some(condition("noGame")) || !games.games.some(condition("noGameHere")))
				return games[gameName].newGame(message.channel.id, message.author.id, true);
		}
		else
		{
			if (games.games.some(condition("gameHere")))
			{
				let game = games.games.filter(condition("gameHere"))[0];
				return games[gameName].startGame(Object.keys(game.channels)[0], message.channel.id, message.author.id);
			}
			if (games.games.some(condition("gameThere")))
			{
				let game = games.games.filter(condition("gameThere"))[0];
				return games[gameName].startGame(Object.keys(game.channels)[0], message.channel.id, message.author.id);
			}
			if (!games.games.some(condition("noGame")))
				return games[gameName].newGame(message.channel.id, message.author.id, true);
		}
	}
	if (["quit", "forfeit", "leave"].includes(input))
	{
		if (!games.games.some(condition("nothingHere")))
			return message.channel.send("There is not a game in this channel for you to quit!");
		else
		if (!games.games.some(condition("participant")))
			return message.channel.send(`You are not a participant of this game!`);
		else
		if (games.games.some(condition("dontStart")))
			games.games.forEach((game, index) => {
				if (game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && !game.started)
				{
					message.channel.send(`Pending game canceled, <@${message.author.id}>.`);
					delete games.games[index];
					games.games.splice(index, 1);
				}
			});
		else
		if (games.games.some(condition("quit")))
			games.games.filter(game => game.channels.hasOwnProperty(message.channel.id))[0].forfeit = message.author.id;
	}
	if (["help", "rules", "howtoplay"].includes(args[0]))
	{
		let embed = new Discord.MessageEmbed().setTitle("How to play: " + GameName)
			.setDescription(`[Click here to learn how to play ${GameName}! (github.com)](https://https://github.com/Xyvyrianeth/xyvybot/wiki/${gameName})`)
			.setColor(new Color().random());
		message.channel.send(embed);
	}
	if (["tourney", "tournament"].includes(args[0]))
		if (message.channel.guild.members.cache.get(message.author.id).roles.some(x => x.id == "597901572843896841"))
		{
			let player1 = args[1].match(/[0-9]+/)[0],
				player2 = args[2].match(/[0-9]+/)[0];
			games[gameName].newTourney(message.channel.id, player1, player2);
		}
};