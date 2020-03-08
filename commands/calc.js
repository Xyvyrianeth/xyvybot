const Discord = require("discord.js");
var { equ } = require("/app/assets/misc/equ.js");
exports.command = (cmd, args, input, message) => {
	if (!input)
		return message.channel.send("__**Syntax**__: \"x!calc `equation`\"");

	let answer = equ(input);

	if (answer[0] == "equated")
		return message.channel.send("```Input: " + input + "``````Output: " + answer[1] + "```");
	else
		return message.channel.send("```Input: " + input + "``````Output: " + answer[1] + "```");
};
