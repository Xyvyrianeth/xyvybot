exports.equ = (equation, x, a, equations) => {
	if (x !== undefined)
		equation = equation.replace(/x/g, '(' + x + ')');
	let terms = [
	  [ /(pi|π)/g,
		"(Math.PI)" ],
	  [ /(infinity|∞)/g,
		"(Math.Infinity)" ],
	  [ /(?<=[a-z])e/g,
		"(Math.E)" ],
	  [ /(phi|φ)/g,
		"(Math.Phi)" ] ];
	for (let i = 0; i < terms.length; i++)
		equation = equation.replace(terms[i][0], terms[i][1]);
	let methods = [
		// Trig functions and natural logarithm
	  [ /(?<!Math\.)(a?(?:sin|cos|tan|sec|csc|cot)h?|ln)(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.$1($2)" ],
		// sin(x) => Math.sin(x)

		// Logarithms
	  [ /log\[(\(-?[0-9.]+\)|-?[0-9.]+)\](\(-?[0-9.]+\)|-?[0-9.]+)/g,
		"Math.Log($1,$2)" ],
		// log[4](x) => Math.Log(4,x)

		// The absolute value of a number
	  [ /\|(-?[0-9.+\-/*()]+)\|/g,
		"Math.abs($1)" ],
		// |-x| => Math.abs(-x)

		// Square root of a number
	  [ /(?:(?:sq)?rt|√)(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.sqrt($1)" ],
		// sqrt(x) => Math.sqrt(x)

		// Root; if the radicand is positive
	  [ /(?<!sq)(?:rt|√)\[(\(-?[0-9]+\)|-?[0-9]+)\](\(-?[0-9.]+\)|-?[0-9.]+)/g,
		"Math.pow($2,(1/($1)))" ],
		// rt[3](x) => Math.pow(x,(1/(3)))

		// Root; if the radicand is negative and the radical is odd
	  [ /(?<!sq)(?:rt|√)\[(\(\-?[0-9]*[13579]{1}\)|\-?[0-9]*[13579]{1})\](?:\(-([0-9.]+)\)|-([0-9.]+))/g,
		"-Math.pow($2$3,(1/($1)))" ],
		// rt[3](-x) => -Math.pow(-x,(1/(3)))

		// Root; if the radicand is negative and the radical is even
	  [ /(?<!sq)(?:rt|√)\[(?:\(-?[0-9]*[02468]{1}\)|-?[0-9]*[02468]{1})\](?:\(-[0-9.]+\)|-[0-9.]+)/g,
		"NaN" ],
		// rt[2](-x) => NaN

		// Root; if the radical is not an integer
	  [ /(?<!sq)(?:rt|√)\[(\(-?[0-9]+\.[0-9]+\)|-?[0-9]+\.[0-9]+)\](\(-?[0-9.]+\)|-?[0-9.]+)/g,
		"Math.pow(Math.pow($2,Math.fraction($1,1)),(1/Math.fraction($1,0)))" ],
		// rt[1.5](-x) => Math.pow(Math.pow(-x,Math.fraction(1.5,1)),(1/Math.fraction(1.5,0)))

		// A number raised to the power of another number
	  [ /(?<!Math\.)(\(-?[0-9.]+\)|(?![0-9)]-)[0-9.]+)(?!sin|cos|tan)\^(?!-1)(\((-?)[0-9.]+\)|-?[0-9.]+)/g,
		"Math.pow($1,$2)" ],
		// x^7 => Math.pow(x,7)

		// Summation function
	  [ /(?<!Math\.)(?:sum|∑)\[n=([0-9]+)\]\(([0-9]+)\)(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.sum($1,$2,$3)" ],
		// sum[n=0](5)5 => Math.sum(0,5,5)

		// Product function
	  [ /(?<!Math\.)(?:prod|∏)\[n=([0-9]+)\]\(([0-9]+)\)(-?[0-9.]+|\(-?[0-9.]+\))/g,
		"Math.prod($1,$2,$3)" ],
		// prod[n=0](5)5 => Math.prod(0,5,5)

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

		// A number against a Javascript Math function in parentheses
	  [ /([0-9.])\)M/g,
	  	"$1*M" ],
	  	// (5)Math.sin(x) => (5)*Math.sin(x)

		// A number in parentheses against a Javascript Math function
	  [ /([0-9.])\(M/g,
	  	"$1*M" ],
	  	// 5(Math.sin(x)) => 5*(Math.sin(x))

		// Parentheses sequence against parentheses sequence
	  [ /\)\(/g,
		")*(" ],
		// (5)(7) => (5)(7)

		// Minus a negative number
	  [ /(?<=[0-9.\)])--([0-9.])/,
		"+$1" ],
		// 5--7 => 5+7

		// Minus a negative number in parentheses
	  [ /(?<=[0-9.\)])-\(-([0-9.]+)\)/,
		"+($1)" ],
		// 5-(-7) => 5+(7)

		// Double negative in parentheses
	  [	/\(--([0-9.]+)\)/,
		"($1)" ],
		// (--50) => (50)

		// Double negative in parentheses
	  [	/\(--([0-9.]+)\)/,
	  	"($1)" ]
	  	// (--50) => (50)
	];
	let lastEquation;
	if (a) console.log(0, x, equation);
	do
	{
		lastEquation = equation;

		equation = equation.replace(/\(Math.PI\)/g, '(' + Math.PI + ')');
		equation = equation.replace(/\(Math.Infinity\)/g, '(' + Math.Infinity + ')');
		equation = equation.replace(/\(Math.E\)/g, '(' + Math.E + ')');
		equation = equation.replace(/\(Math.Phi\)/g, '(' + Math.Phi + ')');

		for (let i = 0; i < methods.length; i++)
			if (methods[i][0].test(equation))
			{
				equation = equation.replace(methods[i][0], methods[i][1]);
				if (a) console.log(1, x, equation);
			}

		equate = equation.match(/\((?:[0-9.+\-/*]+|\([0-9.+\-/*]+\))+\)/g)
		if (equate !== null)
		{
			for (i = 0; i < equate.length; i++)
				equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
			if (a) console.log(2, x, equation);
		}

		while (/(?<![a-z])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/.test(equation))
		{
			f_ = equation.match(/(?<![a-z])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/)[1];
			x_ = equation.match(/(?<![a-z])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/)[2];
			fx = exports.equ(equations[f_], x_, a, equations)[1];
			equation = equation.replace(/(?<![a-z])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/, fx);
			if (a) console.log(3, x, equation);
		}

		equate = equation.match(/\(([0-9.]+){1}([+\-*/%][0-9.]+)+\)/g);
		if (equate !== null)
		{
			for (let i = 0; i < equate.length; i++)
				equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
			if (a) console.log(4, x, equation);
		}

		equate = equation.match(/\[([0-9.]+){1}([+\-*/%][0-9.]+)+\]/g);
		if (equate !== null)
		{
			for (let i = 0; i < equate.length; i++)
				if (/\[/.test(equate[i]) && /\]/.test(equate[i]) && equate[i].match(/\[/g).length == equate[i].match(/\]/g).length)
					equation = equation.replace(equate[i], '[' + eval(equate[i]) + ']');
			if (a) console.log(5, x, equation);
		}

		equate = equation.match(/Math\.(a?(?:sin|cos|tan|sec|csc|cot)h?|log|sqrt|pow|abs|sum|prod|round|fraction)\((\(\-?[0-9.]+\)|-?[0-9.]+)(,(\(\-?[0-9.]+\)|\-?[0-9.]+))*\)/g);
		if (equate !== null) for (let i = 0; i < equate.length; i++)
		{
			equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
			if (a) console.log(6, x, equation);
		}

		equation = equation.replace(/\((\(-?[0-9.]+\))\)/g, "$1");
		if (a) console.log(7, x, equation);
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