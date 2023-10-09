import { Color } from "../../assets/misc/color.js";
import { table } from "../../assets/misc/table.js";
import { dataBase } from "../../index.js";
import fs from "fs";

export const command = async (input, message) => {
	if (message.author.id == "357700219825160194" && message.content.startsWith("x!pg ```sql\n") && message.content.endsWith("```"))
	{
		const res = await dataBase.query(input.substring(7, input.length - 3)).catch(err => {
			const details = err.detail?.split("\n");
			const Details = details ? `${details[details.length - 2]}\n${details[details.length - 1]}\n\n` : '';
			const embed = {
				author: { name: "x!pg", icon_url: "attachment://author.png" },
				description: `\`\`\`\n${err}\n\n${Details}\`\`\``,
				color: new Color().random().toInt() };
			message.reply({ embeds: [embed] });
			return false;
		});
		if (!res)
		{
			return;
		}

		const Table = table(res);
		fs.writeFile("table.txt", Table, (err) => {
			if (err)
			{
				return message.reply({ content: "Error" });
			}

			const table = { attachment: "./table.txt", name: "table.txt" };
			return message.reply({ files: [table] }).then(() => { fs.unlinkSync("table.txt"); });
		});
	}
};