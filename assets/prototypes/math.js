// Constants
Object.defineProperty(Math, 'Phi', {
	value: (1 + Math.sqrt(5)) / 2
});

// Functions
Object.defineProperty(Math, 'ln', {
	value: (a) => {
		return Math.log(a);
	}
});
Object.defineProperty(Math, 'Log', {
	value: (n, a) => {
		return Math.log(a) / Math.log(n);
	}
});
Object.defineProperty(Math, 'rt', {
	value: (a, b) => {
	}
})
Object.defineProperty(Math, 'pw', {
	value: (b, e) => {
		if (e == 0) // EVERYTHING to the power of 0 is 1
			return 1;
		if (b == 0 && e > 0) // 0 to the power of anything greater than 0 is 0
			return 0;

		if (b > 0 || e == Math.round(e)) // If b is positive and e is an integer, no issues
			return Math.pow(b, e);

		let E = Math.fraction(e);
		if (E[1] % 2 == 0) // x^(3/2) is the same as the square root of x^3. If x is negative, x^3 is also negative, and the square root of a negative number is undefined.
			return undefined; // x raised to a fraction will be undefined if x is negative and the denominator is even.
		if (E[0] % 2 == 0) // Odds over evens, x becomes positive
			return Math.pow(Math.abs(a), e);
		if (E[0] % 2 == 1) // Odds over odds, x remains negative
			return -Math.pow(Math.abs(a), e);
	}
})

// Trigonometry
Object.defineProperty(Math, 'csc', {
	value: (a) => {
		return 1 / Math.sin(a);
	}
});
Object.defineProperty(Math, 'sec', {
	value: (a) => {
		return 1 / Math.cos(a);
	}
});
Object.defineProperty(Math, 'cot', {
	value: (a) => {
		return 1 / Math.tan(a);
	}
});
Object.defineProperty(Math, 'csch', {
	value: (a) => {
		return 1 / Math.sinh(a);
	}
});
Object.defineProperty(Math, 'sech', {
	value: (a) => {
		return 1 / Math.cosh(a);
	}
});
Object.defineProperty(Math, 'coth', {
	value: (a) => {
		return 1 / Math.tanh(a);
	}
});
Object.defineProperty(Math, 'acsc', {
	value: (a) => {
		return Math.asin(1 / a);
	}
});
Object.defineProperty(Math, 'asec', {
	value: (a) => {
		return Math.acos(1 / a);
	}
});
Object.defineProperty(Math, 'acot', {
	value: (a) => {
		return Math.atan(1 / a);
	}
});
Object.defineProperty(Math, 'acsch', {
	value: (a) => {
		return Math.log(Math.sqrt((1 / Math.pow(a, 2)) + 1) + (1 / a));
	}
});
Object.defineProperty(Math, 'asech', {
	value: (a) => {
		return Math.log((Math.sqrt((1 / a) - 1) * Math.sqrt((1 / a) + 1)) + (1 / a));
	}
});
Object.defineProperty(Math, 'acoth', {
	value: (a) => {
		return (Math.log(1 + (1 / a)) - Math.log(1 - (1 / a))) / 2;
	}
});

// Custom
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

Object.defineProperty(Math, 'calculate', {
	value: (equation, x, equations) => {
		let log = [];
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
		log.push("0 | " + x + " | " + equation + "\n");
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
					log.push("1 | " + x + " | " + equation + "\n");
				}

			let equate = equation.match(/\((?:[0-9.+\-/*]+|\([0-9.+\-/*]+\))+\)/g)
			if (equate !== null)
			{
				for (let i = 0; i < equate.length; i++)
					equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
				log.push("2 | " + x + " | " + equation + "\n");
			}

			equate = equation.match(/\[(?:[0-9.+\-/*]+|\([0-9.+\-/*]+\))+\]/g)
			if (equate !== null)
			{
				for (let i = 0; i < equate.length; i++)
					equation = equation.replace(equate[i], '[' + eval(equate[i].substring(1, equate[i].length - 1)) + ']');
				log.push("3 | " + x + " | " + equation + "\n");
			}

			while (/(?<![a-df-wz])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/.test(equation))
			{
				let f_ = equation.match(/(?<![a-df-wz])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/)[1];
				let x_ = equation.match(/(?<![a-df-wz])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/)[2];
				let fx = Math.calculate(equations[f_], x_, equations)[1];
				equation = equation.replace(/(?<![a-df-wz])([a-df-wz])\((-?[0-9.]+|\(-?[0-9.]+\))\)/, fx);
				log.push("4 | " + x + " | " + equation + "\n");
			}

			equate = equation.match(/\(([0-9.]+){1}([+\-*/%][0-9.]+)+\)/g);
			if (equate !== null)
			{
				for (let i = 0; i < equate.length; i++)
					equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
				log.push("5 | " + x + " | " + equation + "\n");
			}

			equate = equation.match(/\[([0-9.]+){1}([+\-*/%][0-9.]+)+\]/g);
			if (equate !== null)
			{
				for (let i = 0; i < equate.length; i++)
					if (/\[/.test(equate[i]) && /\]/.test(equate[i]) && equate[i].match(/\[/g).length == equate[i].match(/\]/g).length)
						equation = equation.replace(equate[i], '[' + eval(equate[i]) + ']');
				log.push("6 | " + x + " | " + equation + "\n");
			}

			equate = equation.match(/Math\.(a?(sin|cos|tan|sec|csc|cot)h?|ln|Log|(sq)?rt|pw|abs|sum|prod|round|fraction)\((\(\-?[0-9.]+\)|-?[0-9.]+)(,(\(\-?[0-9.]+\)|\-?[0-9.]+))*\)/g);
			if (equate !== null) for (let i = 0; i < equate.length; i++)
			{
				equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
				log.push("7 | " + x + " | " + equation + "\n");
			}

			equation = equation.replace(/\((\(-?[0-9.]+\))\)/g, "$1");
			log.push("8 | " + x + " | " + equation + "\n");
		}
		while (equation != lastEquation);

		try
		{
			return [ "equated", eval(equation), log.join('\n') ];
		}
		catch (err)
		{
			return [ "error", err, log ];
		}
	}
});