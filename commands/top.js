const Discord = require("discord.js");
const { db, sqlError } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
exports.command = (cmd, args, input, message) => {
	let gms = {
			"othello": ["othello", "reversi"],
			"squares": ["squares"],
			"rokumoku": ["rokumoku", "connect6", "connectsix", "c6"],
			"ttt3d": ["3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe"],
			"connect4": ["connectfour", "connect4", "cfour", "c4"],
			"ordo": ["ordo"],
			"soccer": ["soccer", "papersoccer", "psoccer"],
			"loa": ["linesofaction", "loa", "lines"],
			"latrones": ["latrones", "ludus", "latrunculi"] };
		elos = !input                ? "elo1 + elo2 + elo3 + elo4 + elo5 + elo6 + elo7 + elo8 + elo9" :
		gms.othello.includes(input)  ? "elo1" :
		gms.squares.includes(input)  ? "elo2" :
		gms.rokumoku.includes(input) ? "elo3" :
		gms.ttt3d.includes(input)    ? "elo4" :
		gms.connect4.includes(input) ? "elo5" :
		gms.ordo.includes(input)     ? "elo6" :
		gms.soccer.includes(input)   ? "elo7" :
		gms.loa.includes(input)      ? "elo8" :
		gms.latrones.includes(input) ? "elo9" : false;
	if (!elos)
		return message.channel.send("Unknown game.");

	let wins = elos.replace(/elo/g, "win"),
		loss = elos.replace(/elo/g, "los"),
		query = (`SELECT\n` +
				 `	id, elos AS elo, wins AS win, loss AS los,\n` +
				 `	((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) AS ci_lower_bound\n` +
				 `FROM profiles WHERE wins + loss > 0 ORDER BY\n` +
				 `	elo DESC, ci_lower_bound DESC, id ASC\n` +
				 `LIMIT 10;\n` +

				 `SELECT\n` +
				 `	id, elos AS elo, wins AS win, loss AS los,\n` +
				 `	((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) AS ci_lower_bound\n` +
				 `FROM profiles WHERE\n` +
				 `	id = '${message.author.id}' AND wins + loss > 0;\n` +

				 `SELECT CAST(COUNT(id) + 1 AS int) AS place FROM profiles WHERE\n` +
				 `	0 < ANY (SELECT wins + loss FROM profiles WHERE id = '${message.author.id}')\n` +
				 `	AND id != '${message.author.id}'\n` +
				 `	AND wins + loss > 0\n` +
				 `	AND (\n` +
				 `	  elos > ANY (SELECT elos FROM profiles WHERE id = '${message.author.id}') OR\n` +
				 `	  (\n` +
				 `	  	elos = ANY (SELECT elos FROM profiles WHERE id = '${message.author.id}') AND\n` +
				 `	  	((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) > ANY\n` +
				 `	  	(SELECT ((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) FROM profiles WHERE id = '${message.author.id}')\n` +
				 `	  )\n` +
				 `	);`).replace(/elos/g, elos).replace(/wins/g, wins).replace(/loss/g, loss);
	return db.query(query, (err, res) => {
		if (err)
			return sqlError(message, err, query);
		if (!res || res.length !== 3)
			return sqlError(message, "No res", query);
		if (res[0].rows.length > 0)
		{
			let top = [];
			for (let i = 0; i < res[0].rows.length; i++)
				top.push(res[0].rows[i]);
			let game;
			if (!input)
				game = "All Games"
			else
				game = ["Othello", "Squares", "Rokumoku", "3D Tic Tac Toe", "Connect Four", "Ordo", "Paper Soccer", "Lines of Action", "Latrones"][elos[3] - 1];

			let users = ["__`\u200b RANK \u200b|\u200b Elo \u200b|\u200b \u200b W/L \u200b \u200b|WINRATE| USER`__"];
			for (let i = 0; i < top.length; i++) {
				if (i == 0)
					top[i].place = i + 1;
				else
				if (top[i].elo == top[i - 1].elo && top[i].ci_lower_bound == top[i - 1].ci_lower_bound)
					top[i].place = top[i - 1].place;
				else
					top[i].place = i + 1;

				let place = top[i].place,
					id = top[i].id,
					elo = top[i].elo,
					win = top[i].win,
					los = top[i].los,
					w_l = win + los > 0 ? (win / (win + los) * 100).toFixed(2) + '%' : "\u200b \u200b N/A \u200b \u200b";

					users.push(`\`${"\u200b ".repeat(5 - String(place).length)}${place})|${"\u200b ".repeat(5 - String(elo).length)}${elo}|${"\u200b ".repeat(3 - String(win).length)}${win}/${los}${"\u200b ".repeat(3 - String(los).length)}|${'\u200b '.repeat(w_l !== "\u200b \u200b N/A \u200b \u200b" ? 7 - w_l.length : 0)}${w_l}|\`<@${id}>`);
			}
			if (res[1].rows.length != 0)
			{
				users.push('');
				users.push("Your rank:")
				let user = res[1].rows[0],
					place = res[2].rows[0].place,
					id = user.id,
					elo = user.elo,
					win = user.win,
					los = user.los,
					w_l = win + los > 0 ? (win / (win + los) * 100).toFixed(2) + '%' : "\u200b \u200b N/A \u200b \u200b";

				users.push(`\`${"\u200b ".repeat(5 - String(place).length)}${place})|${"\u200b ".repeat(5 - String(elo).length)}${elo}|${"\u200b ".repeat(3 - String(win).length)}${win}/${los}${"\u200b ".repeat(3 - String(los).length)}|${"\u200b ".repeat(w_l !== "\u200b \u200b N/A \u200b \u200b" ? 7 - w_l.length : 0)}${w_l}|\`<@${id}>`);
			}
			return message.channel.send(
				new Discord.MessageEmbed()
					.setTitle("Leaderboard for " + game)
					.setDescription(users.join('\n'))
					.setColor(new Color().random())
			);
		}
		else
		{
			if (!input)
				return message.channel.send("There are no rankings. Nobody has played any game, yet.");
			else
				return message.channel.send("There are no rankings for this game. Nobody has played it, yet.");
		}
	});
}