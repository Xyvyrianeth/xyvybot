export const error = async err => {
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

	// db.end();
	// db = new PG.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, keepAlive: true });
	// db.connect();
}