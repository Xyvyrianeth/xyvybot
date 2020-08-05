// Constants
Object.defineProperty(Math, 'Phi', { value: (1 + Math.sqrt(5)) / 2 });

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