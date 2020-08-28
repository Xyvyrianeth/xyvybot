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