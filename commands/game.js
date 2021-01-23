const Discord = require("discord.js");
var { Color } = require("/app/assets/misc/color.js"),
	games = {
		games:    require("/app/games/games.js").games,
		othello:  require("/app/games/othello.js"),
		squares:  require("/app/games/squares.js"),
		rokumoku: require("/app/games/rokumoku.js"),
		ttt3d:    require("/app/games/3dttt.js"),
		connect4: require("/app/games/connect4.js"),
		ordo:     require("/app/games/ordo.js"),
		soccer:   require("/app/games/soccer.js"),
		loa:      require("/app/games/loa.js")
	};
exports.command = (cmd, args, input, message) => {
	let gameNicks = {
		"othello": ["othello", "reversi"],
		"squares": ["squares"],
		"rokumoku": ["rokumoku", "rm", "rokum", "rmoku", "connect6", "connectsix", "c6", "csix"],
		"ttt3d": ["3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe"],
		"connect4": ["connectfour", "connect4", "cfour", "c4"],
		"ordo": ["ordo"],
		"soccer": ["soccer", "papersoccer", "psoccer"],
		"loa": ["linesofaction", "loa"] };
	let gameName = null;
	Object.keys(gameNicks).forEach(game => {
		if (gameNicks[game].includes(cmd)) gameName = game; });
	let GameName = {
		"othello": "Othello",
		"squares": "Squares",
		"rokumoku": "Rokumoku",
		"ttt3d": "3D Tic Tac Toe",
		"connect4": "Connect Four",
		"ordo": "Ordo",
		"soccer": "Paper Soccer",
		"loa": "Lines of Action" }[gameName];
	if (!input)
		return message.channel.send(`__**${GameName}**__\nTo start a game, type "x!${cmd} start"!\nTo learn the rules, type "x!${cmd} rules"!`);
	condition = (condition) => {
		return {
			"noGame":			 (game) => game.game == gameName,
			"noGameHere":		 (game) => game.game == gameName && !game.channels.hasOwnProperty(message.channel.id),
			"gameHere":			 (game) => game.game == gameName && !game.started && game.channels.hasOwnProperty(message.channel.id),
			"gameThere":		 (game) => game.game == gameName && !game.started && !game.channels.hasOwnProperty(message.channel.id) && !game.here,
			"playingYourself":	 (game) => game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.game == gameName && !game.started,
			"somethingElseHere": (game) => game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.game !== gameName && !game.started,
			"someoneElseHere": 	 (game) => game.channels.hasOwnProperty(message.channel.id) && game.game !== gameName && !game.started,
			"gameStarted":		 (game) => game.channels.hasOwnProperty(message.channel.id) && game.started,
			"alreadyQueued":	 (game) => !game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.game == gameName,
			"nothingHere":		 (game) => game.channels.hasOwnProperty(message.channel.id),
			"participant":		 (game) => game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id),
			"dontStart":		 (game) => game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && !game.started,
			"quit":				 (game) => game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.started }[condition]; }
	if (["start"].includes(args[0]))
	{
		if (games.games.some(condition("alreadyQueued")))
			return message.channel.send("You are already queued for that game somewhere else!");
		if (games.games.some(condition("playingYourself")))
			return message.channel.send("You cannot play a game against yourself!");
		if (games.games.some(condition("somethingElseHere")))
			return message.channel.send("You're already queued for a different game in this channel!");
		if (games.games.some(condition("someoneElseHere")))
			return message.channel.send("Someone is already queueing for a different game in this channel!");
		if (games.games.some(condition("gameStarted")))
			return message.channel.send("There is already an active game in this channel!");

		if (["here"].includes(args[1]))
		{
			if (games.games.some(condition("gameHere")))
			{
				let game = games.games.filter(condition("gameHere"))[0];
				return games[gameName].startGame(Object.keys(game.channels)[0], message.channel.id, message.author.id);
			}
			if (games.games.some(condition("noGame")) || !games.games.some(condition("noGameHere")))
				return games[gameName].newGame(message.channel.id, message.author.id, true);
		}
		else
		{
			if (games.games.some(condition("gameHere")))
			{
				let game = games.games.filter(condition("gameHere"))[0];
				return games[gameName].startGame(Object.keys(game.channels)[0], message.channel.id, message.author.id);
			}
			if (games.games.some(condition("gameThere")))
			{
				let game = games.games.filter(condition("gameThere"))[0];
				return games[gameName].startGame(Object.keys(game.channels)[0], message.channel.id, message.author.id);
			}
			if (!games.games.some(condition("noGame")))
				return games[gameName].newGame(message.channel.id, message.author.id, true);
		}
	}
	if (["quit", "forfeit", "leave"].includes(input))
	{
		if (!games.games.some(condition("nothingHere")))
			return message.channel.send("There is not a game in this channel for you to quit!");
		else
		if (!games.games.some(condition("participant")))
			return message.channel.send(`You are not a participant of this game!`);
		else
		if (games.games.some(condition("dontStart")))
			games.games.forEach((game, index) => {
				if (game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && !game.started)
				{
					message.channel.send(`Pending game canceled, <@${message.author.id}>.`);
					delete games.games[index];
					games.games.splice(index, 1);
				}
			});
		else
		if (games.games.some(condition("quit")))
			games.games.filter(game => game.channels.hasOwnProperty(message.channel.id))[0].forfeit = message.author.id;
	}
	if (["help", "rules", "howtoplay"].includes(args[0]))
	{
		let wiki = {
			asg: "[Abstract Strategy Game](https://wikipedia.org/wiki/Abstract_strategy_game)",
			attt: "[Advanced Tic Tac Toe](https://wikipedia.org/wiki/M,n,k-game)",
			ghuc: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/wiki/" },
			embed = new Discord.MessageEmbed().setTitle("How to play: " + GameName);
		switch (gameName)
		{
			/**
				@TODO Make example images for...
				[ ] othello
				[ ] squares
				[ ] rokumoku
				[ ] ttt3d
				[ ] connect4
				[×] ordo
				[ ] soccer
				[ ] loa
			*/
			case "othello":
				embed.setDescription(
					`Othello, or Reversi, is an ${wiki.asg}. The game consists of pieces of both black and white and is played on an 8x8 board. The game starts with 2 pieces of each color placed in the middle of the board with pieces of the same color diagonal to each other. Black goes first.\n` +
					"Players take turns placing 1 piece in a manner that would \"capture\" lines of opponent's pieces at either end, effectively changing the opponent's pieces into the player's.\n" +
					"The obective of the game is to have the most pieces on the board before both player can no longer make a legal move.")
				.addField(
					"piece Placement",
					"In order to place a piece in an empty tile, that tile must be at the end of a line of your opponent's pieces with one of your own pieces at the other end of it. For simplicity, legal tiles will be highlighted in blue for you.\n" +
					"To place a piece on the board, simply say the location of the empty tile; for example, say \"4C\" to place a piece in Row 4–Column C.\n" +
					"The piece placed on any given turn will be highlighted in yellow.\n" +
					`[Example not yet available](${wiki.ghuc}/othello/placement.png)`)
				.addField(
					"Capturing pieces",
					"Once you place a piece, all lines of your opponent's pieces that have the piece you just placed at one end with one of your other pieces at the other end are \"captured\" and will immediately turn into your pieces.\n" +
					"Placing a piece can capture your opponent's pieces in any diagonal and orthagonal direction. You can also capture in multiple directions at once.\n" +
					"pieces that have been captured on any given turn will be highlighted in green.\n" +
					`[Example not yet available](${wiki.ghuc}/othello/scoring.png)`)
				.addField(
					"Endgame",
					"The game officially ends when both players can no longer make a legal move to capture their opponent's pieces.\n" +
					"Once this happens, all pieces on the board are counted that the player with the most pieces is declared the winner.\n" +
					`[Example not yet available](${wiki.ghuc}/othello/winning.png)`);
				break;
			case "squares":
				embed.setDescription(
					`Squares is an ${wiki.asg} created by Xyvyrianeth originally for Xyvybot. The game consists of pieces of both black and red and is played on a 10x10 board.`,
					"Players take turns placing 2 pieces on empty tiles, except for the first and final turns where the first player only places 1, until the board is completely full. Black goes first.\n" +
					"The objective of the game is to arrange as many sets of 4 pieces into perfect squares as possible, the winner being the player with the most squares at the end.")
				.addField(
					"piece Placement",
					"To place a piece on the board, simply say the location of the empty tile; for example, say \"4C\" to place a piece in Row 4–Column C.\n" +
					"The pieces placed on any given turn will be highlighted in yellow.\n" +
					`[Example not yet available](${wiki.ghuc}/squares/placement.png)`)
				.addField(
					"Creating Squares",
					"For every set of 4 pieces of the same color that are arranged into a perfect square, the player of that color gets 1 point.\n" +
					"When a player places a piece that completes a square, the other 3 pieces of that square will be highlighted in green.\n" +
					"A single piece can contribute to multiple squares.\n" +
					`[Example not yet available](${wiki.ghuc}/squares/scoring.png)`)
				.addField(
					"Endgame",
					"The game officially ends when there are no longer any empty tiles on the board.\n" +
					"Once this happens, all squares are counted and the player with the most squares is declared the winner.\n" +
					`[Example not yet available](${wiki.ghuc}/squares/winning.png)`);
				break;
			case "rokumoku":
				embed.setDescription(
					`Rokumoku, or Connect Six (literally \"six eyes\" in Japanese) is an ${wiki.asg} and a type of ${wiki.attt}. The game consists of pieces of both black and white and can be played on a board of any size, but for Xyvybot players will use a static 12x12 tile board.\n` +
					"Starting with black, players take turns placing 2 pieces on empty tiles until either player has created a line of 6 of their own pieces, or until the board is full.\n" +
					"The rules for Rokumoku is very simple, as it's basically just large Tic Tac Toe.")
				.addField(
					"piece Placement",
					"To place a piece on the board, simply say the location of the empty tile; for example, say \"4C\" to place a piece in Row 4–Column C.\n" +
					"The pieces placed on any given turn will be highlighted in yellow.\n" +
					"As a means of removing first-player advantage, player one will only place 1 piece during their first turn.\n" +
					`[Example not yet available](${wiki.ghuc}/rokumoku/placement.png)`)
				.addField(
					"Endgame",
					"The game officially ends when either player has created a line of 6 of their own pieces, either diagonally or orthagonally.\n" +
					"Once this happens, the 6 pieces that constitute the winning line will be highlighted in green.\n" +
					`[Example not yet available](${wiki.ghuc}/rokumoku/winning.png)`);
				break;
			case "ttt3d":
				embed.setDescription(
					`3D Tic Tac Toe is an ${wiki.asg} and, as the name suggests, a type of ${wiki.attt}. The game consists of markers, either X's or O's, and a cubic 4x4x4 playing area.\n` +
					"Players take turns placing 1 marker in an emtpy tile on the 3-dimensional playing area until either the playing area is full or a player has created a line of 4 of their own markers through any number of planes in the playing area. X goes first.\n" +
					"The way the 3D Tic Tac Toe playing area is displayed might be confusing for some players. Traditionally, the 4 *y*-planes are displayed vertically, but to save space, they are layed out in a rhombus pattern.")
				.addField(
					"Marker Placement",
					"To place a marker in the playing area, simply say which *y*-plane you wish to place in, followed by the location of that *y*-plane; for example, say \"34C\" to place a marker in Row 4–Column C in the 3rd *y*-plane.\n" +
					"The marker placed on any given turn will be highlighted in yellow.\n" +
					`[Example not yet available](${wiki.ghuc}/3dttt/placement.png)`)
				.addField(
					"Endgame",
					"The game officially ends when either player has created a line of 4 of their own markers going across any number of planes.\n" +
					"Once this happens, the 4 markers that constitute the winning line will be highlighted in green.\n" +
					`[Example not yet available](${wiki.ghuc}/3dttt/winning.png)`);
				break;
			case "connect4":
				embed.setDescription(
					`Connect Four is an ${wiki.asg} and a type of ${wiki.attt}. The game consists of pieces of both black and red and is played on a 6x7 tile board. Blue goes first.\n` +
					"Players take turns placing 1 piece in the lowest empty tile of any column until either the board is full or a player has created a line of 4 of their own pieces.\n" +
					"This has been a very popular board game for many years, and if you've never heard of it until now, your childhood was clearly shit.")
				.addField(
					"piece Placement",
					"To place a piece on the board, simply say the column number of the empty tile you wish to play in; for example, say \"4\" to place a piece in Column 4.\n" +
					"When placing a piece, it will automatically be placed in the lowest empty tile of the column you placed it in.\n" +
					"The piece placed on any given turn will be highlighted in yellow.\n" +
					`[Example not yet available](${wiki.ghuc}/connect4/placement.png)`)
				.addField(
					"Endgame",
					"The game officially ends when either player has create a line of 4 of their own pieces, either diagonally or orthagonally.\n" +
					"Once this happens, the 4 pieces that constitute the winning line will be highlighted in green.\n" +
					`[Example not yet available](${wiki.ghuc}/connect4/winning.png)`);
				break;
			case "ordo":
				embed.setDescription(
					`Ordo is an ${wiki.asg} that has rules and gameplay similar to that of Checkers. The game consists of pieces of both blue and white and is played on an 8x10 tile board. The game starts with all pieces on the board in a set pattern. Blue goes first.\n` +
					"Players take turns moving 1 piece around the board in diagonal or orthagonal directions (or multiple pieces, but only orthagonally), making sure that all of their pieces are connected in the same group.")
				.addField(
					"Singleton Moves",
					"Singleton moves consist of one piece being moved in any direction, either diagonally or orthagonally, any number of tiles. These moves can end in either an empty tile or on a tile occupied by one of your opponent's pieces (which effectively \"captures\" and removes that piece from the game).\n" +
					"You make a singleton move by saying the coordinates of the piece you want to move followed by the coordinates of the tile you wish to move it to; for example, say \"4C 7F\" to move a piece from Row 4–Column C to Row 7–Column F.\n" +
					"pieces that have been moved will be highlighted in yellow with the tile they were moved from being highlighted in red.\n" +
					`[Example not yet available](${wiki.ghuc}ordo/singleton_move.png)`)
				.addField(
					"Ordo Moves",
					"Ordo moves consist of multiple pieces that are adjacent orthagonally from each other being moved in either perpendicular direction (if the pieces being moved are aligned vertically, they can only be moved horizontally, and vice versa).\n" +
					"You make an ordo move by saying the 2 coordinates of the pieces located at both ends of the line of pieces you wish to move, separated by a hyphen, followed by which direction you wish to move it in (up, down, left, or right), followed by how many tiles you wish to move it in that direction; for example, say \"5A-7A right 4\" to move 3 pieces aligned vertically in Column A to the right 4 tiles each.\n" +
					"These moves cannot capture enemy pieces.\n" +
					`[Example](${wiki.ghuc}ordo/ordo_move.png)`)
				.addField(
					"Groups",
					"At the end of either player's turn, all of their pieces must be connected into a single group where all pieces are adjacent to at least one other, either diagonally or orthagonally. If a move is attempted and the moved piece(s) is not connected to the primary group, it is not a legal move.\n" +
					"If a player were to make a move that would separate their opponent's pieces into two or more groups, their opponent must immediately make a move that would reconnect their pieces into a single group again.\n" +
					"If a player's pieces were to be split into two or more groups and that player cannot reconnect them into a single group again on their next turn, the game immediately ends.\n" +
					`[Example](${wiki.ghuc}ordo/group_split.png)`)
				.addField(
					"Endgame",
					"There are 3 conditions for ending the game:\n" +
					` -A player moves a piece into any tile in their opponent's \"home row\" (for blue it's Row 8, and for white it's Row 1). This player is the winner. [Example not yet available](${wiki.ghuc}ordo/ending_1.png)\n` +
					` -All of a player's pieces have been captured and removed from the game. This player is the loser. [Example not yet available](${wiki.ghuc}ordo/ending_2.png)\n` +
					` -A player's pieces are split into two or more groups and cannot be reconnected into a single group on their next turn. This player is the loser. [Example not yet available](${wiki.ghuc}ordo/ending_3.png)`);
				break;
			case "soccer":
				embed.setDescription(
					`Paper Soccer is an ${wiki.asg} that can also be played with paper and pencil. The game consists of an 8-by-10 grid with two "goals" on either end, with a "ball" starting in the middle.\n` +
					"Two players take turns \"kicking\" the ball around along the gridlines, leaving trails where they go, until the ball enters one of the two goals.")
				.addField(
					"Movement",
					"On a player's turn, they can move the ball to an adjacent gridpoint both diagonally and orthagonally. Doing so marks the path between the two points, and that path cannot be taken again for the rest of the game.\n" +
					"If a player moves the ball to a gridpoint that already has a path connected to it, the player gets to go again. If the player touches the edge of the board, they also get to go again; but they cannot move along the edge of the board, they have to bounce off of it.\n" +
					"You move the ball by saying the direction you wish to move it. The bot accepts combinations of up/down/left/right, north/south/east/west, or a simple digit with 0 being north, 1 being northeast, etc.\n" +
					`[Example not yet available](${wiki.ghuc}/soccer/movement.png)`)
				.addField(
					"Endgame",
					"There are two possible ways to end the game:\n" +
					` -The ball enters one of the two goals located at either ends of the board The winner is whoever owns the goal the ball went into, even if the other player put it there. [Example not yet available](${wiki.ghuc}/soccer/winning.png)\n` +
					` -The ball becomes immovable, which can be achieved by having all 8 directions blocked by previous movements or the edge(s) of the board. In this situation, the player who didn't get the ball stuck wins. [Example not yet available](${wiki.ghuc}/soccer/losing.png)`);
				break;
			case "loa":
				embed.setDescription(
					`Lines of Action (or LOA) is an ${wiki.asg} played between two people. The object of the game is for a player to combine all of their pieces into a single connected group.\n` +
					"The game is played on an 8x8 tile board with players taking turns moving individual pieces around orthagonally or diagonally. Black goes first\n" +
					"Players start with 12 pieces aligned along all 4 edges of the board, with the 4 corner tiles being empty, with one player's pieces along the top and bottom edges and the other player's along the left and right edges.")
				.addField(
					"Movement",
					"In LOA, pieces must move as many tiles as there are total pieces along the line of tiles the piece is being moved, both orthagonally and diagonally.\n" +
					"For example, if the active player wants to move a piece along row 4 and there are 3 pieces total in row 4, the piece being moved has to move exactly 3 tiles to the left or right.\n",
					"Enemy pieces cannot be jumped over. However a player can jump over their own pieces freely. Enemy pieces can be captured if a piece lands on it, removing it from the game.\n" +
					"To move a piece, say the location of the piece you wish to move and the direction you wish to move it in, separated by a space.\n" +
					`[Example not yet available](${wiki.ghuc}/loa/movement.png)`)
				.addField(
					"Endgame",
					"The game ends when all of one player's pieces are adjacent into a single group. A group can have pieces adjoined both orthagonally and diagonally.\n" +
					`[Example not yet available](${wiki.ghuc}/loa/groups.png)\n` +
					"If a player were to have all but one of their pieces captured and only have one piece remaining, then that counts as a single grouping and therefor they win, unless the final capture combined their opponent's pieces into one group.\n" +
					`[Example not yet available](${wiki.ghuc}/loa/lastbutlost.png)`
				);
		}
		embed.setColor(new Color().random());
		message.author.send(embed);
		if (message.channel.type != "dm")
			return message.channel.send("The rules for " + GameName + " have been sent to you via DMs!");
	}
	if (["tourney", "tournament"].includes(args[0]))
		if (message.channel.guild.members.cache.get(message.author.id).roles.some(x => x.id == "597901572843896841"))
		{
			let player1 = args[1].match(/[0-9]+/)[0],
				player2 = args[2].match(/[0-9]+/)[0];
			games[gameName].newTourney(message.channel.id, player1, player2);
		}
};