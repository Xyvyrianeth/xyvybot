import { client } from "../../Xyvy.js";
export function myTurn() {
	let X = (Math.random() * 7 | 0) + 1;
	return X;
}