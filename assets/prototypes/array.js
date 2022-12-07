Object.defineProperty(Array.prototype, 'random', {
	value: function(a) {
		if (!a)
			return this[Math.random() * this.length | 0];
		else
		if (typeof a != "number")
			throw "Invalid request: first argument must be a number.";
		else
		{
			let b = [];
			if (a > this.length)
				a = this.length;
			for (i = a; i--;)
			{
				let c = Math.random() * this.length | 0;
				if (!b.includes(c))
					b.push(c);
				else
					i++;
			}
			let d = [];
			for (i = a; i--;)
				d.push(this[b[i]]);
			return d;
		}
	}
});
Object.defineProperty(Array.prototype, 'shuffle', {
	value: function() {
		let a = this.clone(),
			b = [];
		for (let i = 0; i < this.length; i++)
		{
			let c = a[Math.random() * a.length | 0];
			b.push(c);
			a.splice(a.indexOf(c), 1);
		}
		return b;
	}
});
Object.defineProperty(Array.prototype, 'clone', {
	value: function() {
		return JSON.parse(JSON.stringify(this));
	}
});
Object.defineProperty(Array.prototype, 'remove', {
	value: function(a) {
		if (this.indexOf(a) == -1)
			return this;
		this.splice(this.indexOf(a), 1);
		return this;
	}
});
Object.defineProperty(Array.prototype, 'all', {
	value: function(a) {
		return !this.some(b => a !== b);
	}
})