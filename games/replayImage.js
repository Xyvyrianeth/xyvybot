import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
import { Rules } from "../games/rules.js";

export async function replayImage(game, id, text, replay, step) {
	const Game = Rules[game]();
	Game.id = id;
	Game.game = game;
	Game.players = ["replayID1", "replayID2"];
	Game.player = Game.players[0];
	Game.timer = Infinity;
	Game.highlight = [];
	Game.replay = [];
	Game.turn = ["squares", "rokumoku"].includes(game) ? 0.5 : 0;

	if (typeof step != "number")
	{
		step = replay.length;
	}

	for (let i = 0; i < step; i++)
	{
		Game.takeTurn(replay[i]);
	}

	return await Rules.drawBoard(Game, !text);
}