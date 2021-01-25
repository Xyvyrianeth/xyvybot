const Discord = require("discord.js");
const { client, db, sqlError } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
exports.command = (cmd, args, input, message) => {
	let player, game, id,
		has = {
			player: false,
			game: false,
			// page: false,
			unknown: [] },
		gms = {
			"othello": ["othello", "reversi"],
			"squares": ["squares"],
			"rokumoku": ["rokumoku", "connect6", "connectsix", "c6"],
			"ttt3d": ["3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe"],
			"connect4": ["connectfour", "connect4", "cfour", "c4"],
			"ordo": ["ordo"],
			"soccer": ["soccer", "papersoccer", "psoccer"],
			"loa": ["linesofaction", "loa", "lines"],
			"latrones": ["latrones", "ludus", "latrunculi"] };
	if (!input)
		player = message.author.id;
	else
		args.forEach(arg => {
			if (Object.keys(gms).some(gm => gms[gm].includes(arg)))
				Object.keys(gms).forEach(gm => {
					if (gms[gm].includes(arg))
						game = Object.keys, has.game = true;
				});
			else
			if (/^<@!?[0-9]+>$/.test(arg) && client.users.cache.get(arg.match(/[0-9]+/)[0]) != undefined)
				player = arg.match(/[0-9]+/)[0], has.player = true;
			// else
			// if (/^[0-9]+$/.test(arg))
			// 	page = arg, has.page = true;
			else
				has.unknown.push(arg);
		});

	if (has.unknown.length > 0)
		return message.channel.send("Unknown arguments: `" + has.unknown.join("`, `") + '`');

	let query = `SELECT * FROM matches\n` +
				`WHERE\n` +
				`	${has.id ? `id = '${id}'` : `'${player}' = ANY (players)${has.game ? ` AND game = '${game}'` : ''}`}\n` +
				`ORDER BY timeStart DESC\n` +
				`LIMIT 10`;

	db.query(query, (err, res) => {
		if (err)
			return sqlError(message, err, query);
		let embed = new Discord.MessageEmbed()
			.setColor(new Color().random())
			.setTitle("Game History");
		if (res.rows.length == 0)
		{
			if (has.player)
				embed.setDescription(`<@${player}> does not have a Game History.`);
			else
				embed.setDescription(`<@${player}>, you do not have a Game History.`);
		}
		else
		{
			let matches = [];
			gameNameLength = 0;
			res.rows.forEach(match => {
				gameName = {"othello": "Othello ", "squares": "Squares ", "rokumoku": "Rokumoku", "ttt3d": "3D TTT  ", "connect4": "Connect4", "ordo": "Ordo    ", "soccer": "P Soccer", "loa": "Lines   ", "latrones": "Latrones"}[match.game];
				status = player == match.winner ? "Winner": "Loser ";
				let time = new Date(match.timestart);
				time = `${(time.getMonth() < 9 ? '0' : '') + (time.getMonth() + 1)}/${(time.getDate() < 9 ? '0' : '') + (time.getDate() + 1)}/${time.getFullYear().toString().substring(2)} ${(time.getHours() < 10 ? '0': 0) + time.getHours()}:${(time.getMinutes() < 10 ? '0': 0) + time.getMinutes()}`;
				location = match.location;
				id = match.id;
				opponent = match.players[0] == player ? match.players[1] : match.players[0];
				matches.push([gameName, status, time, location, id, opponent, match.squarereplay]);
				if (gameName.length > gameNameLength)
					gameNameLength = gameName.length;
			});
			let hasSquares = matches.some(match => match[0] == "Squares");
			let history = [`__\`GAME    |STATUS|     TIME     |\`\u200b${hasSquares ? "`REPLAY`\u200b` \u200b `\u200b`GIFS`" : "`REPLAY GIF`"}\u200b\`|OPPONENT\`__`];
			matches.forEach(match => {
				text =
					hasSquares ?
						match[0] == "Squares " ?
							`[\`REPLAY\`](https://cdn.discordapp.com/attachments/${match[3]}/replay_${match[4]}.gif)\`|\`[\`SCORE\`](https://cdn.discordapp.com/attachments/${match[6]}/counter_${match[4]}.gif)` :
							`\u200b\` \`[\`OPEN \u200b LINK\`](https://cdn.discordapp.com/attachments/${match[3]}/replay_${match[4]}.gif)\` \`\u200b` :
							`[\`OPEN \u200b LINK\`](https://cdn.discordapp.com/attachments/${match[3]}/replay_${match[4]}.gif)`
				history.push(`\`${match[0] + ' '.repeat(gameNameLength - match[0].length)}|${match[1]}|${match[2]}|\`${text}\`|\`<@${match[5]}>`);
			})
			embed.setDescription(`**USER**: <@${player}>\n\n` + history.join('\n'));
		}
		message.channel.send(embed);
	});
};