var { equ } = require("/app/assets/misc/equ.js");
exports.command = (cmd, args, input, message) => {
	if (!input)
		return message.channel.send("__**Syntax**__: \"x!calc `equation`\"");

	let answer = equ(input);

	if (answer[0] == "equated")
		return message.channel.send("```Input: " + input + "``````Output: " + answer[1] + "```");
	else
		return message.channel.send("```Input: " + input + "``````Output: " + answer[1] + "```");
};
Object.defineProperty(Math, 'sum', {
	value: (n, a, b) => {
		n = Math.round(n),
		a = Math.round(a),
		c = 0;
		for (let i = n; i <= a; i++)
			c += b;
		return c;
	}
});
Object.defineProperty(Math, 'prod', {
	value: (n, a, b) => {
		n = Math.round(n),
		a = Math.round(a),
		c = 0;
		for (let i = n; i <= a; i++)
			c *= b;
		return c;
	}
});
Object.defineProperty(Math, 'gcd', {
	value: (a, b) => {
		if (!b)
			return a;
		else
			return Math.gcd(b, a % b);
	}
});
Object.defineProperty(Math, 'fraction', {
	value: (a, n) => {
		let num = 0,
			den = 0;
		do
		{
			den++;
			num = a * den;
		}
		while (num != Math.round(num));

		if (n == undefined)
			return [num, den, num + '/' + den];
		else
			return [num, den, num + '/' + den][n];
	}
});