import { Color } from "../assets/misc/color.js";
import { table } from "../assets/misc/table.js";
import { db } from "../index.js";
import fs from "fs";

export const command = async (input, message) => {
	if (message.author.id == "357700219825160194" && message.content.startsWith("x!pg ```sql\n") && message.content.endsWith("```"))
	{
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/pg.png", name: "author.png" };
		const embed = {
			author: { name: "x!pg", icon_url: "attachment://author.png" },
			color: new Color().random().toInt() };

		const res = await db.query(input.substring(7, input.length - 3)).catch(err => {
			embed.description = "```" + err + "```";
			message.reply({ embeds: [embed], files: [author] });
			return false;
		});
		if (!res)
		{
			return;
		}

		const Table = table(res);
		if (Table.length > 2000)
		{
			fs.writeFile("table.txt", Table, (err) => {
				if (err)
				{
					return message.reply({ content: "Error" });
				}

				const table = { attachment: "./table.txt", name: "table.txt" };
				embed.description = "Overflow";
				return message.reply({ embeds: [embed], files: [author, table] }).then(() => { fs.unlinkSync("table.txt"); });
			});
		}
		else
		{
			embed.description = "```\n" + table(res) + "\n```";
			return message.reply({ embeds: [embed], files: [author] });
		}
	}
};