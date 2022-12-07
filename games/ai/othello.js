import { client } from "../../Xyvy.js";
export function myTurn() {
	let space = this.possible.random();
	let Y = space[0] + 1;
	let X = (space[1] + 10).toString(36);
	return Y + X;
}