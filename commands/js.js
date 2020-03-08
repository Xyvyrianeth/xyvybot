const Discord = require("discord.js");
exports.command = (cmd, args, input, message) => {
	if (message.author.id != "357700219825160194")
		return;
	if (message.content.startsWith("x!js ```js\n") && message.content.endsWith("```"))
	{
		let toEval = input.substring(6, input.length - 3);
		let embed = new Discord.MessageEmbed()
			.setTitle("x!js")
			.setColor(new Color().random())
			.setTimestamp();
		try
		{
			let output = "";
			let print = function() {
				for (let i of arguments)
					output += '\n' + i;
			}
			let image = (canvas) => {
				attachment = new Discord.MessageAttachment(canvas.toBuffer(), "image.png");
				embed.attachFiles(attachment);
				embed.setImage("attachment://image.png");
			}
			evaled = eval(toEval);
			if (output == "") embed.setDescription("```js\n" + evaled + "```");
			else embed.setDescription("```md" + output + "```");
			message.channel.send(embed);
		}
		catch (err)
		{
			let stack = err.stack.split('\n');
			let a = stack.length;
			for (let i = 0; i < stack.length; i++)
				if (stack[i].includes("at Client.emit"))
				{
					a = i;
					break;
				}
			let Err = [];
			let b = false;
			for (let i = 1; i < a; i++)
			{
				Err.push(stack[i]);
				if (/<anonymous>:[0-9]+:[0-9]+/.test(stack[i]))
				{
					let c = stack[i].match(/<anonymous>:[0-9]+:[0-9]+/)[0].split(':');
					b = [toEval.split('\n')[Number(c[1]) - 1], Number(c[2]) - 1];
				}
			}
			if (!b)
				embed.setDescription("```" + err + "``````\n" + Err.join("\n") + "```");
			else
				embed.setDescription("```" + err + "``````" + b[0] + '\n' + ' '.repeat(b[1]) + "^```");
			message.channel.send(embed);
		}
	}
}