"use strict";

export function table(res) {
	if (!res) return "Something went wrong: no results were returned.";
	let tables = [];
	if (res.length > 1) {
		for (let i = 0; i < res.length; i++) {
			let e = 'QUERY ' + (i + 1) + ': ' + res[i].command + '\n' + '-'.repeat(8 + JSON.stringify(i + 1).length + res[i].command.length) + '\n';
			if (res[i].command == "SELECT") {
				if (res[i].rows.length == 0) e += "Empty results";
				else
				{
					let a = [Object.keys(res[i].rows[0])]; // Values
					let b = a[0];
					let c = []; // Desired Width
					for (let x = 0; x < b.length; x++) {
						c.push(b[x].length);
					}
					for (let x = 0; x < res[i].rows.length; x++) {
						let d = [];
						for (let y = 0; y < b.length; y++) {
							d.push(JSON.stringify(res[i].rows[x][b[y]]));
							if (JSON.stringify(res[i].rows[x][b[y]]).length > c[y]) c[y] = JSON.stringify(res[i].rows[x][b[y]]).length;
						}
						a.push(d);
					}
					for (let x = 0; x < a.length; x++) {
						let f = [];
						for (let y = 0; y < a[x].length; y++) {
							f.push(a[x][y] + ' '.repeat(c[y] - a[x][y].length));
						}
						e += f.join(' | ') + '\n';
						if (x == 0) e += '-'.repeat(f.join(' | ').length) + '\n';
					}
				}
			}
			else
			e += "Successfully made changes. Rows affected: " + res[i].rowCount;
			tables.push(e);
		}
	}
	else
	{
		let e = 'QUERY: ' + res.command + '\n' + '-'.repeat(7 + res.command.length) + '\n';
		if (res.command == "SELECT") {
			if (res.rows.length == 0) e += "Empty results";
			else
			{
				let a = [Object.keys(res.rows[0])]; // Values
				let b = a[0];
				let c = []; // Desired Width
				for (let x = 0; x < b.length; x++) {
					c.push(b[x].length);
				}
				for (let x = 0; x < res.rows.length; x++) {
					let d = [];
					for (let y = 0; y < b.length; y++) {
						d.push(JSON.stringify(res.rows[x][b[y]]));
						if (JSON.stringify(res.rows[x][b[y]]).length > c[y]) c[y] = JSON.stringify(res.rows[x][b[y]]).length;
					}
					a.push(d);
				}
				for (let x = 0; x < a.length; x++) {
					let f = [];
					for (let y = 0; y < a[x].length; y++) {
						f.push(a[x][y] + ' '.repeat(c[y] - a[x][y].length));
					}
					e += f.join(' | ') + '\n';
					if (x == 0) e += '-'.repeat(f.join(' | ').length) + '\n';
				}
			}
		}
		else
		e += "Successfully made changes. Rows affected: " + res.rowCount;
		tables.push(e);
	}
	return tables.join('\n\n');
}