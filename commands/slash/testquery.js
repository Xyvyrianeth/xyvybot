import { dataBase } from "../../index.js";

export const command = async (interaction) => {
	interaction.reply({ content: "Testing Query", ephemeral: true });

	const testQueries = [
		"DROP TABLE testTable",

		"CREATE TABLE testTable\n" +
		"    (id text, elos int[], wins int[], loss int[], ties int[]);",

		"INSERT INTO testTable\n" +
		"    (id, elos, wins, loss, ties)\n" +
		"VALUES\n" +
		"    ('TEST1', ARRAY[1000, 1000, 1000], ARRAY[0, 0, 0], ARRAY[0, 0, 0], ARRAY[0, 0, 0]);",

		"INSERT INTO testTable\n" +
		"    (id, elos, wins, loss, ties)\n" +
		"VALUES\n" +
		"    ('TEST2', '{1000, 1000, 1000}', '{0, 0, 0}', '{0, 0, 0}', '{0, 0, 0}');",

		"SELECT * FROM testTable;",

		"UPDATE testTable\n" +
		"SET\n" +
		"    elos[1] = 1100,\n" +
		"    wins[1] = 1\n" +
		"WHERE id = 'TEST1';",

		"UPDATE testTable\n" +
		"SET\n" +
		"    elos[2] = 900,\n" +
		"    loss[1] = 1\n" +
		"WHERE id = 'TEST2';",

		"SELECT * FROM testTable;",

		"SELECT elos[1] FROM testTable;"
	];

	testQueries.forEach(async testQuery => {
		await dataBase.query(testQuery).then(res => {
			console.log(`\n${testQuery}\n`);
			console.log(res.rows, "\n\n////////////////////////////////////////////////////////////////");
		}).catch(err => {
			console.log(`\n${testQuery}\n`);
			console.log(err, `\n\n${err.detail}`, "\n\n////////////////////////////////////////////////////////////////");
		});
	});
}