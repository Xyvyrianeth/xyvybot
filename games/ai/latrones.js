import { client } from "../../Xyvy.js";
export function myTurn() {
	let Y = (Math.random() * 8 | 0) + 1;
	let X = ((Math.random() * 8 | 0) + 10).toString(36);
	return Y + X;
}