import { Color } from "../../assets/misc/color.js";

export const command = (interaction) => {
	let author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/credits.png", name: "author.png" };
	let embed = {
		author: { name: "Acknowledgements", icon_url: "attachment://author.png" },
		fields: [
			{ name: "Creator, Author, and Primary Tester", value: "Xyvyrianeth" },
			{ name: "Code", value: "Hosted with [Heroku](https://heroku.com)\n" +
				"Powered by [Node.js](https://nodejs.org) (v16.2) and [NPM](https://npmjs.com) (v7.13)\n" +
				"Dependencies (NPMs):\n" +
				" - [discord.js](https://discord.js.org) (v12.5.3)\n" +
				" - [dotenv](https://npmjs.com/package/dotenv) (v10.0)\n" +
				" - Database by [PostgreSQL](https://postgresql.org) and [pg (npm)](https://npmjs.com/package/pg) (v8.6)\n" +
				" - Trivia questions provided by [Open Trivia Database](https://opentdb.com/) and their [npm](https://github.com/Elitezen/open-trivia-db-wrapper)\n" +
				" - Many images constructed with [canvas](https://github.com/Automattic/node-canvas) (v2.7)\n" +
				" - Replays powered by [Canvas GIF Encoder](https://github.com/bcafuk/canvas-gif-encoder) (discontinued)" },
				// " - [Nekos.life](https://nekos.life) (v2.0.7) for all the catgirls" },
			{ name: "Images", value: "All background images from [Imgur](https://imgur.com/) posted by [user/Kizenkis](https://imgur.com/user/Kizenkis).\n" +
				"All other assets made by Xyvyrianeth." },
			{ name: "Special Thanks", value: "To various users from [The Officially Unofficial Server for the Unofficially Official Dan-Ball Community](https://discord.gg/gYVMUrM) for all of their support, feedback, and debugging.\n" +
				"And all other users who provided feedback and testing." } ],
		color: new Color().random().toInt() };
	return interaction.reply({ embeds: [embed], files: [author] });
};