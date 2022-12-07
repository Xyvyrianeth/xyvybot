import { Collection } from "discord.js";
// import { nsfwTags } from "../../commands/nsfw.js";
export const commands = new Collection();

commands.set("othello", {
	name: "othello",
	attachment: true,
	description: "A classic game of Reversi where two players place their own pieces to capture their opponent's, and the player with the most pieces by the end wins!",
	fields: [ { title: "Usage",
				body: "Use the attached buttons to play this game",
				inline: false } ] });
commands.set("squares", {
	name: "squares",
	attachment: true,
	description: "A game unique to this bot where two players take turns placing pieces on a board trying to make as many squares as possible!",
	fields: [ { title: "Usage",
				body: "Use the attached buttons to play this game\n" +
					  "This game can be played against the bot itself",
				inline: false } ] });
commands.set("rokumoku", {
	name: "rokumoku",
	attachment: true,
	description: "This game is like Tic-Tac-Toe but l o n g e r.\nMake a row of 6 in a 12x12 board before your opponent!",
	fields: [ { title: "Usage",
				body: "Use the attached buttons to play this game\n" +
					  "This game can be played against the bot itself",
				inline: false } ] });
commands.set("ttt3d", {
	name: "3dTicTacToe",
	attachment: true,
	description: "It's like normal Tic-Tac-Toe, but it's in 3D!\nGet a line of 4 utilizing all 3 dimensions!",
	fields: [ { title: "Usage",
				body: "Use the attached buttons to play this game\n" +
					  "This game can be played against the bot itself",
				inline: false } ] });
commands.set("connect4", {
	name: "connect4",
	attachment: true,
	description: "The classic vertical 4-in-a-row game\nYou already know what this is.",
	fields: [ { title: "Usage",
				body: "Use the attached buttons to play this game",
				inline: false } ] });
commands.set("ordo", {
	name: "ordo",
	attachment: true,
	description: "Think Checkers, but all your pieces must be touching.\nGet to your opponent's home row or separate their pieces to win!",
	fields: [ { title: "Usage",
				body: "Use the attached buttons to play this game",
				inline: false } ] });
commands.set("soccer", {
	name: "paperSoccer",
	attachment: true,
	description: "Get the ball to your end of the field! You can move the ball in any direction, but you go again if the ball touches a spot it's already been before!",
	fields: [ { title: "Usage",
				body: "Use the attached buttons to play this game",
				inline: false } ] });
commands.set("loa", {
	name: "linesOfAction",
	attachment: true,
	description: "Get all of your pieces into one continuous group before your opponent! Pieces can only move as many spaces as there are pieces along the line they're moving.",
	fields: [ { title: "Usage",
				body: "Use the attached buttons to play this game",
				inline: false } ] });
commands.set("latrones", {
	name: "latrones",
	attachment: true,
	description: "Capture all of your opponent's pieces before they capture all of yours!",
	fields: [ { title: "Usage",
				body: "Use the attached buttons to play this game",
				inline: false } ] });
commands.set("spiderlinetris", {
	name: "spiderlinetris",
	attachment: true,
	description: "Connect Four but even more silly",
	fields: [ { title: "Usage",
				body: "Use the attached buttons to play this game",
				inline: false } ] });
commands.set("profile", {
	name: "profile",
	attachment: true,
	description: "Use this command to get an image displaying all of your board game statistics overlaid on a background of your choosing!",
	fields: [ { title: "Usage",
				body: "**/profile create**\n\u200b \u200b \u200b \u200b Create a profile if you haven't already\n" +
					  "**/profile view**\n\u200b \u200b \u200b \u200b View your own or another user's profile\n" +
					  "**/profile edit**\n\u200b \u200b \u200b \u200b Change certain aspects of your profile\n" +
					  "**/profile backgrounds**\n\u200b \u200b \u200b \u200b Manage all of your profile backgrounds",
				inline: false } ] });
commands.set("leaderboard", {
	name: "leaderboard",
	attachment: true,
	description: "Use this command to see how you compare to the rest of the world in your board game endeavors!",
	fields: [ { title: "Usage",
				body: "Use the buttons to navigate through the leaderboards, and use the dropdown to sort the rankings by game",
				inline: false } ] });
commands.set("history", {
	name: "history",
	attachment: true,
	description: "Use this command to get a list of all of your completed games, including information such as who you played against, who won, and a link to the .gif of the game's move history!",
	fields: [ { title: "Usage",
				body: "Use the buttons to navigate through your game history\n" +
					  "Specify a user to get anyone's game history (if they have one)",
				inline: false } ] });
commands.set("minesweeper", {
	name: "minesweeper",
	attachment: true,
	description: "Utilizing the power of spoilers, this command sets up a simple game of minesweeper. Simply click on the spoilers to reveal a space and follow the numbers to locate (but don't click) the bombs!",
	fields: [ { title: "Usage",
				body: "Unfortunately, there's a bug in Discord (possibly a bug, I'm not sure, maybe it's intentional) that won't display more than 99 spoiler objects, so setting the size of the board or number of bombs has been disabled until that gets fixed or changed.",
				inline: false } ] });
commands.set("iq", {
	name: "iq",
	attachment: true,
	description: "This command puts a very simple puzzle in the chat, and the first user to solve it in the chat wins!",
	fields: [ { title: "Disclaimer",
				body: "Hopefully I shouldn't have to inform any users that IQ is not real. It doesn't exist. It's a myth created by eugenicists who push racist propaganda and support racist policies. Intelligence is not something some people are simply born with \"more of\", and the concept of intelligence is not simple enough to be measurable as a single numerical quantity. I chose \"IQ\" to be the name of this command because the kind of puzzles it generates are the same kind of silly questions you see on fake IQ tests on the internet, and they cannot and do not prove just how smart a person actually is.",
				inline: false } ] });
commands.set("hangman", {
	name: "hangman",
	attachment: true,
	description: "This command sets up a game of Hangman for any number of users to play.\n\nSupports over 2000 different words and phrases spanning over 7 different categories!",
	fields: [ { title: "Usage",
				body: "**/hangman `category`**†\n\n" +
					  "To guess a letter, just say the letter. Your guess must be alphanumerical, so punctuations and accent marks are automatically filled in at the start (guessing \"n\" fills in both \"n\" and \"ñ\").",
				inline: false },
			  { title: "Categories",
				body: " - Tabletop/Board/Card Games\n - Movies\n - TV Shows\n - Video Games\n - Anime/Manga\n - Countries\n - Pokémon",
				inline: false } ] });
commands.set("trivia", {
	name: "trivia",
	attachment: false,
	description: "Throws a multiple-choice trivia question into the chat. Powered by Open Trivia Database.",
	fields: [ { title: "Usage",
				body: "**/trivia**",
				inline: false } ] });
commands.set("letters", {
	name: "letters",
	attachment: false,
	description: "From the show Countdown: Try to make the longest word possible using the 9 available letters.",
	fields: [ { title: "Usage",
				body: "**/letters**",
				inline: false },
			  {	title: "Rules",
				body: "1. Letters can only be used as many times as they appear during selection.\n2. Words must be English and found in the dictionary.\n3. Proper nouns, abbreviations, and acronymns are not permissable. Compound words containing hyphens, spaces, and apostrophes are not permissable.\n4. Words with accent marks on letters *are* allowed so long as they can be found in an English dictionary.",
				inline: false } ] });
commands.set("numbers", {
	name: "numbers",
	attachment: false,
	description: "From the show Countdown: Try to reach the target number using the 6 available numbers via addition, subtraction, multiplication, and sometimes division.",
	fields: [ { title: "Usage",
				body: "**/numbers**",
				inline: false },
			  {	title: "Rules",
				body: "1. Numbers can only be used as many times as they appear during selection.\n2. Numbers can only be added to, subtracted from, multiplied by, or divided by each other, but can be done in any order, and operations can be grouped in any way.\n3. Fractional numbers and negatives are not permissable.",
				inline: false } ] });
commands.set("help", {
	name: "help",
	attachment: false,
	description: "Gives a complete list of all usable commands supported by Xyvybot.",
	fields: [ { title: "Usage",
				body: "**/help `command`**†",
				inline: false },
			  { title: "Options",
				body: "**command**\n\u200b \u200b \u200b \u200b The command you want more information on",
				inline: false } ] });
commands.set("request", {
	name: "request",
	attachment: false,
	description: "Have an idea for a new game? Think you know a way a game or other command can be improved? This command lets you send your ideas directly to the creator!",
	fields: [ { title: "Usage",
				body: "**/request `what you wish to request`**",
				inline: false } ] });
commands.set("bug", {
	name: "bug",
	attachment: false,
	description: "Has the bot behaved in a way that you don't believe was intended by the creator? Use this command to let him know!",
	fields: [ { title: "Usage",
				body: "**/bug `command` `the issue with it you've found`**",
				inline: false },
			  { title: "Options",
				body: "**command**\n\u200b \u200b \u200b \u200b The command you think you've found an issue with",
				inline: false } ] });
commands.set("nekos", {
	name: "nekos",
	attachment: true,
	description: "Get a picture of a cute anime catgirl!",
	fields: [] });
commands.set("graph", {
	name: "graph",
	attachment: true,
	description: "Use this command to manipulate a very simple and inefficient graphing calculator! Can graph up to 10 different functions at once and displayed as any color of your choosing!\n\nEquations must be in the format *y* = *mx* + *b* or *f*(*x*) = *mx* + *b*",
	fields: [ { title: "Usage",
				body: "**/graph help**\n\u200b \u200b \u200b \u200b Gives you a link to the /graph [wiki](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/x!graph)!\n" +
					  "**/graph equate `equation1` `equation2` `equation3`...**\n\u200b \u200b \u200b \u200b Graphs up to 10 equations at once",
				inline: false },
			  { title: "Options",
				body: "**equation#**\n\u200b \u200b \u200b \u200b Equations must be in the format *y* = *mx* + *b* or *f*(*x*) = *mx* + *b*.\n\u200b \u200b \u200b \u200b Specify the color in the same option after the equation, separated with a semicolon (;). Color must be a hexadecimal value.",
				inline: false } ] });
commands.set("credits", {
	name: "credits",
	attachment: false,
	description: "Curious about what runs under the bot's hood? Use this command to find out!",
	fields: [] });
// commands.set("nsfw", {
// 	name: "nsfw",
// 	attachment: true,
// 	description: "Want some hentai?",
// 	fields: [ { title: "Usage",
// 				body: "**/nsfw `tag`**†",
// 				inline: false },
// 			  { title: "Tags",
// 				body: "```\n" + nsfwTags + "\n```",
// 				inline: false } ] });