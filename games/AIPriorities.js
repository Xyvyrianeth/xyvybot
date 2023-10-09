export function priorities(game) {
	return {
		"squares": {
			offense: [1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, 0],
			defense: [1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, 0] },
		"rokumoku": {
			offense: [
				[1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, Math.random() * 50 + 42, 250, 0],
				[1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, Math.random() * 50 + 30, 250, 0] ],
			defense: [
				[1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, Math.random() * 50 + 36, 200, 0],
				[1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 20, Math.random() * 50 + 36, 200, 0] ] },
		"ttt3d": {
			offense: [1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, 0],
			defense: [1, Math.random() * 2 + 2, Math.random() * 5 + 5, Math.random() * 20 + 10, 0] }
	}[game];
}