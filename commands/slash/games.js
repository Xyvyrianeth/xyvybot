import { Color } from "../../assets/misc/color.js";

export const command = (interaction) => {
	let author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/games.png", name: "author.png" };
	let embed = {
		author: { name: "games", icon_url: "attachment://author.png" },
		description: "Learn more about a specific game by clicking a link or play that game by using the command /[game]",
		fields: [
		{	name: "List of Playable Games:",
			value: "[Othello (click to learn how to play)](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/othello)\n" +
				"[Squares](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/squares)†\n" +
				"[Rokumoku](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/rokumoku)†\n" +
				"[3D Tic-Tac-Toe](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/ttt3d)†\n" +
				"[Connect Four](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/connect4)\n" +
				"[Ordo](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/ordo)\n" +
				"[Paper Soccer](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/soccer)\n" +
				"[Lines of Action](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/loa)\n" +
				"[Latrones](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/latrones)\n" +
				"[Spider Linetris](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/spiderlinetris)",
			inline: false },
		{	name: "Possible Future Games:",
			value: `[Go](https://en.wikipedia.org/wiki/Go_(game))\n\n` +
				`[Spider Linetres (or any game from which it is derived)](https://brainking.com/en/GameRules?tp=61)`,
			inline: false } ],
		footer: { text: "† can be played against the bot" },
		color: new Color().random().toInt() };

	return interaction.reply({ embeds: [embed], files: [author] });
}