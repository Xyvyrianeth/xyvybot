exports.equ = (equation, x, a) => {
	if (x !== undefined)
		equation = equation.replace(/x/g, '(' + x + ')');
	let terms = [
		[ /(pi|π)/g,
			"(Math.PI)" ],
		[ /(infinity|∞)/g,
			"(Math.Infinity)" ]
	];
	for (let i = 0; i < terms.length; i++)
		equation = equation.replace(terms[i][0], terms[i][1]);
	let methods = [
		[ /\\(sin|cos|tan|log)(-?[0-9.]+|\(-?[0-9.]+\))/g, // Sin, Cos, Tan, or Log of a number (went ahead and fit Log into here because it uses similar syntax)
			"Math.$1($2)" ], // \sin(5)

		[ /\\a(sin|cos|tan)(-?[0-9.]+|\(-?[0-9.]+\))/g, // Asin, Acos, or Atan of a number
			"Math.a$1($2)" ], // \asin(5)

		[ /\\(sin|cos|tan)h(-?[0-9.]+|\(-?[0-9.]+\))/g, // Sinh, Cosh, or Tanh of a number
			"Math.$1h($2)" ], // \sinh(5)

		[ /\\a(sin|cos|tan)h(-?[0-9.]+|\(-?[0-9.]+\))/g, // Asinh, Acosh, or Atanh of a number
			"Math.a$1h($2)" ], // \asinh(5)

		[ /(?:\\(?:sq|)rt|√)(-?[0-9\.]+|\(-?[0-9.]+\))/g, // Root of a number, if the radicand is a real number and the radical is 2
			"Math.sqrt($1)" ], // \sqrt(5)

		[ /(?:\\rt|√)\[(\(-?[0-9]+\)|-?[0-9]+)\](\([0-9.]+\)|[0-9.]+)/g, // If the radicand is positive
			"Math.pow($2,(1/$1))" ], // \rt[2](5)

		[ /(?:\\rt|√)\[(\(\-?[0-9]*[13579]{1}\)|\-?[0-9]*[13579]{1})\](?:\(-([0-9.]+)\)|-([0-9.]+))/g, // If the radicand is negative and the radical is odd
			"-Math.pow($2$3,(1/$1))" ], // \rt[3](-5)

		[ /(?:\\rt|√)\[(\(-?[0-9]+\.[0-9]+\)|-?[0-9]+\.[0-9]+)\](\(-?[0-9.]+\)|-?[0-9.]+)/g, // If the radical is not an integer
			"Math.pow(Math.pow($2,Math.fraction($1,1)),(1/Math.fraction($1,0)))" ], // \rt[1.5](-5)

		[ /(?:\\rt|√)\[(?:\(-?[0-9]*[02468]{1}\)|-?[0-9]*[02468]{1})\](?:\(-[0-9.]+\)|-[0-9.]+)/g, // If the radicand is negative and the radical is even
			"NaN" ], // \rt[2](-5)

		[ /(\(-?[0-9.]+\)|(?![0-9)]-)[0-9.]+)(?!sin|cos|tan)\^(?!-1)(\((-?)[0-9.]+\)|-?[0-9.]+)/g, // A number number to the power of another number
			"Math.pow($1,$2)" ], // 5^7

		[ /(?:\\sum|∑)\[n=([0-9]+)\]\(([0-9]+)\)(-?[0-9.]+|\(\-?[0-9.]+\))/g, // Summation function
			"Math.sum($1, $2, $3)" ], // \sum[n=0](5)5

		[ /(?:\\prod|∏)\[n=([0-9]+)\]\(([0-9]+)\)(-?[0-9.]+|\(-?[0-9.]+\))/g, // Product function
			"Math.prod($1, $2, $3)" ], // \prod[n=0](5)5

		[ /\|(-?[0-9.+\-/*()]+)\|/g, // The absolute value of a number
			"Math.abs($1)" ], // |-5|

		[ /([0-9.])\(/g, // A number against a parentheses sequence
			"$1*(" ], // 5(7)

		[ /\)([0-9.])/, // Same but reversed
			")*$1" ], // (7)5

		[ /([0-9.])M/g, // A number against a Javascript Math function
			"$1*M" ], // 5Math.sin(7)

		[ /\)\(/g, // Parentheses sequence against parentheses sequence
			")*(" ], // (5)(7)

		[ /--([0-9.])/, // Minus a negative number
			"+($1)" ], // 5--7

		[ /-\(-([0-9.])\)/, // Minus a negative number in parentheses
			"+($1)" ] // 5-(-7)
	];
	let lastEquation;
	for (let i = 0; i < 1; i++)
	{
		lastEquation = equation;
		if (/\(Math.(PI|Infinity)\)/g.test(equation))
			equation = equation.replace(/\(Math.PI\)/g, Math.PI),
			equation = equation.replace(/\(Math.Infinity\)/g, Math.Infinity);
		if (a) console.log(x, equation);
		if (/\([0-9.+\-/*]+\)/.test(equation))
		{
			equate = equation.match(/\([0-9.+\-/*]+\)/g);
			for (let i = 0; i < equate.length; i++)
				if (/\(/.test(equate[i]) && /\)/.test(equate[i]) && equate[i].match(/\(/g).length == equate[i].match(/\)/g).length)
					equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
		}
		if (a) console.log(x, equation);
		for (let i = 0; i < methods.length; i++)
			equation = equation.replace(methods[i][0], methods[i][1]);
		if (a) console.log(x, equation);
		if (/\(([0-9.]+){1}([+\-*/%][0-9.]+)+\)/.test(equation))
		{
			equate = equation.match(/\(([0-9.]+){1}([+\-*/%][0-9.]+)+\)/g);
			for (let i = 0; i < equate.length; i++)
				equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
		}
		if (a) console.log(x, equation);
		if (/\[([0-9.]+){1}([+\-*/%][0-9.]+)+\]/.test(equation))
		{
			equate = equation.match(/\[([0-9.]+){1}([+\-*/%][0-9.]+)+\]/g);
			for (let i = 0; i < equate.length; i++)
				if (/\[/.test(equate[i]) && /\]/.test(equate[i]) && equate[i].match(/\[/g).length == equate[i].match(/\]/g).length)
					equation = equation.replace(equate[i], '[' + eval(equate[i]) + ']');
		}
		if (a) console.log(x, equation);
		if (/Math\.(a?sinh?|a?cosh?|a?tanh?|log|sqrt|pow|abs|sum|prod|round|fraction)\((\(\-?[0-9.]+\)|-?[0-9.]+)(,(\(\-?[0-9.]+\)|\-?[0-9.]+))*\)/g.test(equation))
		{
			equate = equation.match(/Math\.(a?sinh?|a?cosh?|a?tanh?|log|sqrt|pow|abs|sum|prod|round|fraction)\((\(\-?[0-9.]+\)|-?[0-9.]+)(,(\(\-?[0-9.]+\)|\-?[0-9.]+))*\)/g);
			for (let i = 0; i < equate.length; i++)
				equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
		}
		if (a) console.log(x, equation);
		if (/(?<!\])\(-?[0-9.]+\)/g.test(equation))
			equation = equation.replace(/(?!\])\((-?[0-9.]+)\)/g, "$1");
		if (a) console.log(x, equation);
		if (equation != lastEquation)
			i--;
	}
	try
	{
		return [ "equated", eval(equation) ];
	}
	catch (err)
	{
		return [ "error", err ];
	}
}