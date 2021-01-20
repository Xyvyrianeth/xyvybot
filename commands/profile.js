const Discord = require("discord.js");
const Canvas = require("canvas");
const Profile = require("/app/assets/profile/profile.js");
const { client, db, newUser } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js"),
	images = require("/app/assets/backgrounds/images.json");
exports.command = (cmd, args, input, message) => {
	if (!input || /^<@!?[0-9]+>$/.test(input))
	{
		let player;
		if (!input)
			player = client.users.cache.get(message.author.id);
		else
		if (message.channel.type !== "dm" && /^<@!?[0-9]+>$/.test(input))
			player = client.users.cache.get(input.match(/[0-9]+/)[0]);

		if (player == null)
			return message.channel.send("User not found.");

		let query1 = `SELECT * FROM profiles WHERE id = '${player.id}'`;
		return db.query(query1, (err, res) => {
			if (err)
				return sqlError(message, err, query1);

			let profile;
			if (res.rows.length == 0 && !input)
				profile = newUser(message.author.id, message);
			else
			if (res.rows.length == 0)
				return message.channel.send("No user with that ID currently has a profile.");
			else
				profile = res.rows[0];

			Canvas.loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png").then((image1) => {
				Canvas.loadImage('/app/assets/backgrounds/' + profile.background.substring(0, 7) + (profile.background.substring(7) == 'p' ? ".png" : ".jpg")).then((image2) => {
					let embed = new Discord.MessageEmbed()
						.setAuthor("x!profile")
						.setDescription(`<@${player.id}>`)
						.attachFiles(new Discord.MessageAttachment(Profile["draw" + (profile.lefty ? "Left" : "Right")](player, profile, image1, image2), "profile.png"))
						.setImage("attachment://profile.png")
						.setColor(profile.color);
					return message.channel.send(embed);
				});
			})
			.catch(err => message.channel.send("```" + err + "```"));
		});
	}

	else
	if (["background", "backgrounds", "bg", "bgs"].includes(args[0]))
	{
		if (!args[1])
		{
			let query1 = `SELECT *\nFROM profiles\nWHERE id = '${message.author.id}'`;
			return db.query(query1, (err, res) => {
				if (err)
					return sqlError(message, err, query1);
				if (res.rows.length == 0)
					return message.channel.send("You have not yet created a profile. To do that, say \"x!profile\" right now!");

				let  max = Math.ceil(res.rows[0].backgrounds.length / 20),
					curr = !args[2] ? 1                                                                         : /^[0-9]+$/.test(args[2]) ? args[2] >= max ? max                           : args[2]            : false,
					   a = !args[2] ? res.rows[0].backgrounds.length > 20 ? 0  : 0                              : /^[0-9]+$/.test(args[2]) ? args[2] >= max ? (max - 1) * 20                : (args[2] - 1) * 20 : false,
					   b = !args[2] ? res.rows[0].backgrounds.length > 20 ? 20 : res.rows[0].backgrounds.length : /^[0-9]+$/.test(args[2]) ? args[2] >= max ? res.rows[0].background.length : args[2] * 20       : false;
				if (curr == false)
				   return message.channel.send("Invalid page number.");

				let b1 = res.rows[0].backgrounds,
					b2 = [];
				for (let i = a; i < b; i++) {
					if (b1[i] == res.rows[0].background)
						b2.push(`\`${b1[i]}\` [${images.titles[b1[i]]}](https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/backgrounds/${b1[i].substring(0, 7) + {j: ".jpg", p: ".png"}[b1[i][7]]}) **(Equipped)**`);
					else
						b2.push(`\`${b1[i]}\` [${images.titles[b1[i]]}](https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/backgrounds/${b1[i].substring(0, 7) + {j: ".jpg", p: ".png"}[b1[i][7]]})`);
				}
				let embed = new Discord.MessageEmbed()
					.setColor(new Color().random())
					.setAuthor("x!profile")
					.setDescription(`Backgrounds owned by <@${message.author.id}> (Page ${curr} of ${max}):\n\n` + b2.join('\n'));
				return message.channel.send(embed);
			});
		}
		else
		if (["buy", "purchase"].includes(args[1]))
		{
			let query1 = `SELECT *\nFROM profiles\nWHERE id = '${message.author.id}'`;
			return db.query(query1, (err, res) => {
				if (err)
					return sqlError(message, err, query1);
				if (res.rows.length == 0)
					return message.channel.send("You have not yet created a profile. To do that, say \"**x!profile**\" right now!");
				if (res.rows[0].backgrounds.length == images.ids.length)
					return message.channel.send("There are no more backgrounds for you to purchase, because you've got them all already!");
				if (res.rows[0].money < 500)
					return message.channel.send("You do not have enough money to buy another background! Backgrounds cost 500 money each! Get more money by playing games (and winning)!");

				newbg = images.ids.filter(id => !res.rows[0].backgrounds.includes(id)).random();

				let query2 = `UPDATE profiles\nSET backgrounds = array_append(backgrounds, '${newbg}'), money = money - 500\nWHERE id = '${message.author.id}'`;
				return db.query(query2, (err) => {
					if (err)
						return sqlError(message, err, query2);
					else
					{
						let embed = new Discord.MessageEmbed()
							.setColor(new Color().random())
							.setAuthor("x!profile")
							.setDescription("Successfully purchased a new background! ID: `" + newbg + "`\nTo Equip it, say \"x!profile background " + newbg + "\"!")
							.attachFiles(new Discord.MessageAttachment("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/backgrounds/" + newbg.substring(0, 7) + {j: ".jpg", p: ".png"}[newbg[8]], "new_background.png"))
							.setImage("attachment://new_background.png");
						return message.channel.send(embed);
					}
				});
			});
		}
		else
		if (/^[a-zA-Z0-9]{7}[jp]$/.test(args[1]))
		{
			if (!images.ids.includes(args[1]))
				return message.channel.send("This background ID does not exist.");

			let query1 = `SELECT *\nFROM profiles\nWHERE id = '${message.author.id}'`;
			return db.query(query1, (err, res) => {
				if (err)
					return sqlError(message, err, query1);
				if (res.rows.length == 0)
					return message.channel.send("You have not yet created a profile. To do that, say \"**x!profile**\" right now!");
				if (!res.rows[0].backgrounds.includes(args[1]))
					return message.channel.send("You do not own that background.");

				let lorr = images.display.left.includes(args[1]) ? true : images.display.right.includes(args[1]) ? false : res.rows[0].lefty,
					query2 = `UPDATE profiles\nSET background = '${args[1]}', lefty = '${lorr}'\nWHERE id = '${message.author.id}'`;
				return db.query(query2, (err) => {
					if (err)
						return sqlError(message, err, query2);
					else
					{
						let player = client.users.cache.get(message.author.id),
							profile = res.rows[0];
						profile.background = args[1];
						Canvas.loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png").then((image1) => {
							Canvas.loadImage('/app/assets/backgrounds/' + profile.background.substring(0, 7) + (profile.background.substring(7) == 'p' ? ".png" : ".jpg")).then((image2) => {
								let embed = new Discord.MessageEmbed()
									.setAuthor("x!profile")
									.setDescription(`Your new profile background has been equipped, <@${player.id}>! Take a look!`)
									.attachFiles(new Discord.MessageAttachment(Profile["draw" + (lorr ? "Left" : "Right")](player, profile, image1, image2), "profile.png"))
									.setImage("attachment://profile.png")
									.setColor(profile.color);
								return message.channel.send(embed);
							});
						})
						.catch(err => message.channel.send("```" + err + "```"));
					}
				});
			});
		}
		else
			return message.channel.send("Unknown request.");
	}

	else
	if (["righty", "lefty", "sidedisplay", "displayside", "displaylorr", "leftorright", "rightorleft", "changeside", "sidechange", "side"].includes(args[0]))
	{
		let query1 = `SELECT *\nFROM profiles\nWHERE id = '${message.author.id}'`;
		return db.query(query1, (err, res) => {
			if (err)
				return sqlError(message, err, query1);
			if (res.rows.length == 0)
				return message.channel.send("You have not yet created a profile. To do that, say \"**x!profile**\" right now!");

			let query2 = `UPDATE profiles\nSET lefty = '${!res.rows[0].lefty}'\nWHERE id = '${message.author.id}'`;
			return db.query(query2, (err) => {
				if (err)
					return sqlError(message, err, query2);
				else
					return message.channel.send("Successfully updated your information display to the " + (res.rows[0].lefty ? "right" : "left") + " side!");
			});
		});
	}

	else
	if (["title", "subtext"].includes(args[0]))
	{
		if (!args[1])
		{
			let query1 = `SELECT *\nFROM profiles\nWHERE id = '${message.author.id}'`;
			return db.query(query1, (err, res) => {
				if (err)
					return sqlError(message, err, query1);
				if (res.rows.length == 0)
					newUser(message.author.id, message);

				let embed = new Discord.MessageEmbed()
					.setColor(new Color().random())
					.setAuthor("x!profile")
					.setDescription("Your current title is `" + res.rows[0].title + "`.");
				return message.channel.send(embed);
			});
		}

		args.shift();
		let title = args.join(" ");


		let query1 = `SELECT *\nFROM profiles\nWHERE id = '${message.author.id}'`;
		return db.query(query1, (err, res) => {
			if (err)
				return sqlError(message, err, query1);
			if (res.rows.length == 0)
				newUser(message.author.id, message);

			let query2 = `UPDATE profiles\nSET title = '${title}'\nWHERE id = '${message.author.id}'`;
			return db.query(query2, (err) => {
				if (err)
					return sqlError(message, err, query2);
				return message.channel.send("Successfully updated your title to `" + title + "`!");
			});
		});
	}

	else
	if (["color", "colors"].includes(args[0]))
	{
		if (!args[1])
			return message.channel.send("Please include the color you wish to set your profile color to, and please make it a hexidecimal value ('#' followed by 3 or 6 digits and/or letters).");
		else
		if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(args[1]))
			return message.channel.send("That is not a color hexidecimal. Try again.");
		let query1 = `SELECT *\nFROM profiles\nWHERE id = '${message.author.id}'`;
		return db.query(query1, (err, res) => {
			if (err)
				return sqlError(message, err, query1);
			if (res.rows.length == 0)
				return message.channel.send("You have not yet created a profile. To do that, say \"x!profile\" right now!");

			let query2 = `UPDATE profiles\nSET color = '${(args[1].startsWith('#') ? '' : '#') + args[1]}'\nWHERE id = '${message.author.id}'`;
			return db.query(query2, (err) => {
				if (err)
					return sqlError(message, err, query2);
				let canvas = new Canvas.createCanvas(100, 40),
					ctx = canvas.getContext('2d');
				ctx.fillStyle = (args[1].startsWith('#') ? '' : '#') + args[1];
				ctx.fillRect(0, 0, 100, 40);
				return message.channel.send("Successfully updated your color to `" + (args[1].startsWith('#') ? '' : '#') + args[1] + "`!", new Discord.MessageAttachment(canvas.toBuffer()));
			});
		});
	}

	else
	if (["help"].includes(input))
	{
		return message.channel.send(
			new Discord.MessageEmbed()
				.setAuthor("x!profile")
				.setTitle("Available subcommands for x!profile")
				.setDescription(
					"x!profile `subcommand`\n" +
					"\n" +
					"**`backgrounds`** - Shows you all of your owned backgrounds or allows you to buy more or equip them.\n" +
					"**`title`** - Displays your currently equipped title, your currently owned titles, or allows you to change your currently equipped title (if you know the ID for it).\n" +
					"**`color`** - Allows you to change the color your profile uses to display information.\n" +
					"**`displayside`** - Allows you to change which side all the text n stuff is displayed on in your profile. Changing backgrounds will sometimes do that automatically to pick the optimal side.")
				.setColor(new Color().random()));
	}

	else
		return message.channel.send("Invalid syntax. Try \"x!profile help\" for more information on how to use this.");
}