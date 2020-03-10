const Discord = require("discord.js"),
	  nekos = require("nekos.life"),
	  Nekos = new nekos();
var { Color } = require("/app/assets/misc/color.js");
exports.command = (cmd, args, input, message) => {
	let tags = Object.keys(Nekos.nsfw).sort();

	if (message.channel.type != "dm" && !message.channel.nsfw)
		return;
	else
	if (!input)
	{
		let type = tags.random();
		return Nekos.nsfw[type]().then((nsfw) => message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("x!nsfw", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/nekos_life.png")
				.setDescription(`Tag: \`${type}\` | Do \`x!nsfw ${type}\` to see more like this\nDo \`x!nsfw tags\` to see all tags`)
				.setFooter("Powered by Nekos.Life")
				.setColor(new Color().random())
				.setImage(nsfw.url)));
	}
	else
	if (input.startsWith('['))
		return message.channel.send("With***out*** the brackets. How is that ***not*** obvious? You're probably too young to look at porn, go play violent video games, instead.");
	else
	if (["tags", "help"].includes(input))
	{
		let joined = '';
		for (let i = 0; i < tags.length; i++)
			joined += tags[i] + ' '.repeat(16 - (tags[i].length % 16));
		Nekos.nsfw.eroNeko().then((help) => message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("x!nsfw", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/nekos_life.png")
				.setTitle("NSFW Tags")
				.setDescription('```md\n' + joined.trim() + '```\n**Usage**: `x!nsfw [tag]`')
				.setFooter("Powered by Nekos.Life")
				.setColor(new Color().random())
				.setImage(help.url)));
	}
	else
	if (["random"].includes(args[0]))
	{
		let types = [],
			nopes = [],
			type;
		if (!args[1])
			type = tags.random();
		else
		{
			for (let i = 1; i < args.length; i++)
			{
				let tag = tags.filter(tag => {
					if (!types.includes(tag) && (tag.toLowerCase() == args[i].toLowerCase() || tag.toLowerCase().includes(args[i].toLowerCase())))
						return true;
				});
				if (tag.length == 0)
					nopes.push(args[i]);
				else
					types = types.concat(tag);
			}
			if (types.length + nopes.length > tags.length)
				return message.channel.send("There's not even that many tags, try again.");
			else
			if (types.length > 0)
				type = types.random();
			else
				return message.channel.send("None of those tags exist.");
		}

		return Nekos.nsfw[type]().then(nsfw => message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("x!nsfw", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/nekos_life.png")
				.setDescription(`Tag: \`${type}\`\nSelected randomly from: [\`${types.join('`, `')}\`]${nopes.length > 0 ? `\nQueried tags that don't exist: [\`${nopes.join('`, `')}\`]` : ''}`)
				.setFooter("Powered by Nekos.Life")
				.setColor(new Color().random())
				.setImage(nsfw.url)));
	}
	else
	if (["exclude"].includes(args[0]))
	{
		let types = [],
			nopes = [];
		if (!args[1])
			type = tags.random();
		else
		{
			for (let i = 1; i < args.length; i++)
			{
				let tag = tags.filter(tag => {
					if (!types.includes(tag) && (tag.toLowerCase() == args[i].toLowerCase() || tag.toLowerCase().includes(args[i].toLowerCase())))
						return true;
				});
				if (tag.length == 0)
					nopes.push(args[i]);
				else
					types = types.concat(tag);
			}

			if (types.length + nopes.length > tags.length)
				return message.channel.send("There's not even that many tags, try again.");
			else
			if (types.length == tags.length)
				return message.channel.send("That removes literally every tag, try again.");
			if (types.length > 0)
			{
				let Types = [];
				for (let i = 0; i < tags.length; i++)
					if (!types.includes(tags[i]))
						Types.push(tags[i]);
				type = Types.random();
			}
			else
				return message.channel.send("None of those tags exist.");
		}
		return Nekos.nsfw[type]().then(nsfw => message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("x!nsfw", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/nekos_life.png")
				.setDescription(`Tag: \`${type}\`\nTags excluded: [\`${types.join('`, `')}\`]${nopes.length > 0 ? `\nQueried tags that don't exist: [\`${nopes.join('`, `')}\`]` : ''}`)
				.setFooter("Powered by Nekos.Life")
				.setColor(new Color().random())
				.setImage(nsfw.url)));
	}
	else
	if (args.length > 1)
	{
		let types = [];
		let nopes = [];
		for (let i = 0; i < args.length; i++)
		{
			let tag = tags.filter(tag => {
				if (!types.includes(tag) && (tag.toLowerCase() == args[i].toLowerCase() || tag.toLowerCase().includes(args[i].toLowerCase())))
					return true;
			});
			if (tag.length == 0)
				nopes = nopes.push(args[i]);
			else
				types = types.concat(tag);
		}
		if (types.length == 0)
			return message.channel.send("Query matched no tags, try again.");
		let queue = [];
		if (types.length <= 5)
			queue = queue.concat(types);
		if (types.length > 5)
			for (let i = 0; i < 5; i++)
				queue.push(types[i]);
		let Types = [];
		for (let i = 0; i < queue.length; i++)
		{
			Nekos.nsfw[queue[i]]().then(nsfw => {
				Types.push(nsfw.url);
				if (Types.length == queue.length)
				{
					let Tags = [];
					for (let x = 0; x < Types.length; x++)
						Tags.push(`[${types[x]}](${Types[x]})`);
					return message.channel.send(
						new Discord.MessageEmbed()
							.setAuthor("x!nsfw", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/nekos_life.png")
							.setDescription(`Tags: [\`${queue.join('`, `')}\`]${types.length > 5 ? `\nMaximum of 5 tags allowed` : ''}\n\n[${Tags.join(']\n\n[')}]`)
							.setFooter("Powered by Nekos.Life")
							.setColor(new Color().random())
							.setImage(queue[0]));
				}
			});
		}
	}
	else
	{
		let type = tags.some(tag => tag.toLowerCase() == args[0].toLowerCase()) ?
			tags.filter(tag => tag.toLowerCase() == args[0].toLowerCase())[0] :
		tags.some(tag => tag.toLowerCase().includes(args[0].toLowerCase())) ?
			tags.filter(tag => tag.toLowerCase().includes(args[0].toLowerCase())).random() :
			false;
		if (!type)
			return message.channel.send("Sorry, I don't have that!");

		return Nekos.nsfw[type]().then(nsfw => message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("x!nsfw", "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/nekos_life.png")
				.setDescription(`Tag: \`${type}\``)
				.setFooter("Powered by Nekos.Life")
				.setColor(new Color().random())
				.setImage(nsfw.url)));
	}
};