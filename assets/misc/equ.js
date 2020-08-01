exports.equ = (equation, x, a, equations) => {
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
		// Sin, Cos, Tan, or Log of a number (went ahead and fit Log into here because it uses similar syntax)
	  [ /\\(sin|cos|tan|log)(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.$1($2)" ],
		// \sin(x) => Math.sin(x)

		// Asin, Acos, or Atan of a number
	  [ /\\a(sin|cos|tan)(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.a$1($2)" ],
		// \asin(x) => Math.asin(x)

		// Sinh, Cosh, or Tanh of a number
	  [ /\\(sin|cos|tan)h(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.$1h($2)" ],
		// \sinh(x) => Math.sinh(x)

		// Asinh, Acosh, or Atanh of a number
	  [ /\\a(sin|cos|tan)h(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.a$1h($2)" ],
		// \asinh(x) => Math.asinh(x)

		// Root of a number, if the radicand is a real number and the radical is 2
	  [ /(?:\\(?:sq|)rt|√)(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.sqrt($1)" ],
		// \sqrt(x) => Math.sqrt(x)

		// If the radicand is positive
	  [ /(?:\\rt|√)\[(\(-?[0-9]+\)|-?[0-9]+)\](\([0-9.]+\)|[0-9.]+)/g,
		"Math.pow($2,(1/$1))" ],
		// \rt[2](x) => Math.pow(x,(1/5))

		// If the radicand is negative and the radical is odd
	  [ /(?:\\rt|√)\[(\(\-?[0-9]*[13579]{1}\)|\-?[0-9]*[13579]{1})\](?:\(-([0-9.]+)\)|-([0-9.]+))/g,
		"-Math.pow($2$3,(1/$1))" ],
		// \rt[3](-x) => -Math.pow(-x,(1/3))

		// If the radical is not an integer
	  [ /(?:\\rt|√)\[(\(-?[0-9]+\.[0-9]+\)|-?[0-9]+\.[0-9]+)\](\(-?[0-9.]+\)|-?[0-9.]+)/g,
		"Math.pow(Math.pow($2,Math.fraction($1,1)),(1/Math.fraction($1,0)))" ],
		// \rt[1.5](-x) => Math.pow(Math.pow(-x,Math.fraction(1.5,1)),(1/Math.fraction(1.5,0)))

		// If the radicand is negative and the radical is even
	  [ /(?:\\rt|√)\[(?:\(-?[0-9]*[02468]{1}\)|-?[0-9]*[02468]{1})\](?:\(-[0-9.]+\)|-[0-9.]+)/g,
		"NaN" ],
		// \rt[2](-x) => NaN

		// A number number to the power of another number
	  [ /(\(-?[0-9.]+\)|(?![0-9)]-)[0-9.]+)(?!sin|cos|tan)\^(?!-1)(\((-?)[0-9.]+\)|-?[0-9.]+)/g,
		"Math.pow($1,$2)" ],
		// x^7 => Math.pow(x,7)

		// Summation function
	  [ /(?:\\sum|∑)\[n=([0-9]+)\]\(([0-9]+)\)(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.sum($1,$2,$3)" ],
		// \sum[n=0](5)5 => Math.sum(0,5,5)

		// Product function
	  [ /(?:\\prod|∏)\[n=([0-9]+)\]\(([0-9]+)\)(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.prod($1,$2,$3)" ],
		// \prod[n=0](5)5 => Math.prod(0,5,5)

		// The absolute value of a number
	  [ /\|(-?[0-9.+\-/*()]+)\|/g,
		"Math.abs($1)" ],
		// |-x| => Math.abs(-x)

		// A number against a parentheses sequence
	  [ /([0-9.])\(/g,
		"$1*(" ],
		// 5(7) => 5*(7)

		// Same but reversed
	  [ /\)([0-9.])/,
		")*$1" ],
		// (7)5 => (7)*5

		// A number against a Javascript Math function
	  [ /([0-9.])M/g,
		"$1*M" ],
		// 5Math.sin(x) => 5*Math.sin(x)

		// Parentheses sequence against parentheses sequence
	  [ /\)\(/g,
		")*(" ],
		// (5)(7) => (5)(7)

		// Minus a negative number
	  [ /--([0-9.])/,
		"+($1)" ],
		// 5--7 => 5+7

		// Minus a negative number in parentheses
	  [ /-\(-([0-9.])\)/,
		"+($1)" ]
		// 5-(-7) => 5+(7)
	];
	let lastEquation;
	do
	{
		lastEquation = equation;
		if (/\(Math.(PI|Infinity)\)/g.test(equation))
		{
			equation = equation.replace(/\(Math.PI\)/g, Math.PI);
			equation = equation.replace(/\(Math.Infinity\)/g, Math.Infinity);
			if (a) console.log(x, equation);
		}
		if (/\([0-9.+\-/*]+\)/.test(equation))
		{
			equate = equation.match(/\([0-9.+\-/*]+\)/g);
			for (let i = 0; i < equate.length; i++)
				if (/\(/.test(equate[i]) && /\)/.test(equate[i]) && equate[i].match(/\(/g).length == equate[i].match(/\)/g).length)
					equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
			if (a) console.log(x, equation);
		}
		for (let i = 0; i < methods.length; i++)
			if (methods[i][0].test(equation))
			{
				equation = equation.replace(methods[i][0], methods[i][1]);
				if (a) console.log(x, equation);
			}
		if (/\\([a-zA-Z])\((-?[0-9.]+|\(-?[0-9.]+\))\)/.test(equation))
		{
			console.log(equations);
			f_ = equation.match(/\\([a-zA-Z])\((-?[0-9.]+|\(-?[0-9.]+\))\)/)[1];
			x_ = equation.match(/\\([a-zA-Z])\((-?[0-9.]+|\(-?[0-9.]+\))\)/)[2];
			fx = exports.equ(equations[f_], x_, true);
			equation = equation.replace(/\\([a-zA-Z])\((-?[0-9.]+|\(-?[0-9.]+\))\)/, fx);
			if (a) console.log(x, equation);
		}
		if (/\(([0-9.]+){1}([+\-*/%][0-9.]+)+\)/.test(equation))
		{
			equate = equation.match(/\(([0-9.]+){1}([+\-*/%][0-9.]+)+\)/g);
			for (let i = 0; i < equate.length; i++)
				equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
			if (a) console.log(x, equation);
		}
		if (/\[([0-9.]+){1}([+\-*/%][0-9.]+)+\]/.test(equation))
		{
			equate = equation.match(/\[([0-9.]+){1}([+\-*/%][0-9.]+)+\]/g);
			for (let i = 0; i < equate.length; i++)
				if (/\[/.test(equate[i]) && /\]/.test(equate[i]) && equate[i].match(/\[/g).length == equate[i].match(/\]/g).length)
					equation = equation.replace(equate[i], '[' + eval(equate[i]) + ']');
			if (a) console.log(x, equation);
		}
		if (/Math\.(a?sinh?|a?cosh?|a?tanh?|log|sqrt|pow|abs|sum|prod|round|fraction)\((\(\-?[0-9.]+\)|-?[0-9.]+)(,(\(\-?[0-9.]+\)|\-?[0-9.]+))*\)/g.test(equation))
		{
			equate = equation.match(/Math\.(a?sinh?|a?cosh?|a?tanh?|log|sqrt|pow|abs|sum|prod|round|fraction)\((\(\-?[0-9.]+\)|-?[0-9.]+)(,(\(\-?[0-9.]+\)|\-?[0-9.]+))*\)/g);
			for (let i = 0; i < equate.length; i++)
				equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
			if (a) console.log(x, equation);
		}
		if (/(?<!\])\(-?[0-9.]+\)/g.test(equation))
		{
			equation = equation.replace(/(?!\])\((-?[0-9.]+)\)/g, "$1");
			if (a) console.log(x, equation);
		}
	}
	while (equation != lastEquation);

	try
	{
		return [ "equated", eval(equation) ];
	}
	catch (err)
	{
		return [ "error", err ];
	}
}