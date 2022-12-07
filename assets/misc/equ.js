export function equ(equation, x, equations) {
	let log = '';
	if (x !== undefined)
		equation = equation.replace(/x/g, '(' + x + ')');
	let terms = [
	  [ /(pi|π)/g,
		"(Math.PI)" ],
	  [ /(infinity|∞)/g,
		"(Math.Infinity)" ],
	  [ /(?<!s)e/g,
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

		// Roots
	  [ /(?<!sq)(?:rt|√)\[(\(-?[0-9]+\)|-?[0-9]+)\](\(-?[0-9.]+\)|-?[0-9.]+)/g,
		"Math.pow($2,(1/($1)))" ],
		// rt[3](x) => Math.rt(x,3)

		// A number raised to the power of another number
	  [ /(?<!Math\.)(\(-?[0-9.]+\)|-?[0-9.]+)(?!sin|cos|tan)\^(?!-1)(\(-?[0-9.]+\)|-?[0-9.]+)/g,
		"Math.pw($1,$2)" ],
		// x^7 => Math.pw(x,7)

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
	log += "0 | " + x + " | " + equation + "\n";
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
				log += "1 | " + x + " | " + equation + "\n";
			}

		equate = equation.match(/\((?:[0-9.+\-/*]+|\([0-9.+\-/*]+\))+\)/g)
		if (equate !== null)
		{
			for (i = 0; i < equate.length; i++)
				equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
			log += "2 | " + x + " | " + equation + "\n";
		}

		equate = equation.match(/\[(?:[0-9.+\-/*]+|\([0-9.+\-/*]+\))+\]/g)
		if (equate !== null)
		{
			for (i = 0; i < equate.length; i++)
				equation = equation.replace(equate[i], '[' + eval(equate[i].substring(1, equate[i].length - 1)) + ']');
			log += "3 | " + x + " | " + equation + "\n";
		}

		while (/(?<![a-df-wz])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/.test(equation))
		{
			f_ = equation.match(/(?<![a-df-wz])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/)[1];
			x_ = equation.match(/(?<![a-df-wz])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/)[2];
			fx = exports.equ(equations[f_], x_, equations)[1];
			equation = equation.replace(/(?<![a-df-wz])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/, fx);
			log += "4 | " + x + " | " + equation + "\n";
		}

		equate = equation.match(/\(([0-9.]+){1}([+\-*/%][0-9.]+)+\)/g);
		if (equate !== null)
		{
			for (let i = 0; i < equate.length; i++)
				equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
			log += "5 | " + x + " | " + equation + "\n";
		}

		equate = equation.match(/\[([0-9.]+){1}([+\-*/%][0-9.]+)+\]/g);
		if (equate !== null)
		{
			for (let i = 0; i < equate.length; i++)
				if (/\[/.test(equate[i]) && /\]/.test(equate[i]) && equate[i].match(/\[/g).length == equate[i].match(/\]/g).length)
					equation = equation.replace(equate[i], '[' + eval(equate[i]) + ']');
			log += "6 | " + x + " | " + equation + "\n";
		}

		equate = equation.match(/Math\.(a?(sin|cos|tan|sec|csc|cot)h?|ln|Log|(sq)?rt|pw|abs|sum|prod|round|fraction)\((\(\-?[0-9.]+\)|-?[0-9.]+)(,(\(\-?[0-9.]+\)|\-?[0-9.]+))*\)/g);
		if (equate !== null) for (let i = 0; i < equate.length; i++)
		{
			equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
			log += "7 | " + x + " | " + equation + "\n";
		}

		equation = equation.replace(/\((\(-?[0-9.]+\))\)/g, "$1");
		log += "8 | " + x + " | " + equation + "\n";
	}
	while (equation != lastEquation);

	try
	{
		return [ "equated", eval(equation), log ];
	}
	catch (err)
	{
		return [ "error", err, log ];
	}
}