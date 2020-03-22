const Discord = require("discord.js");
const Canvas = require("canvas");
const Profile = require("/app/assets/profile/profile.js");
const { db } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js"),
	titles = require("/app/assets/profile/titles.json"),
	images = require("/app/assets/backgrounds/images.json");
exports.command = (cmd, args, input, message) => {
	if (!input || /^<@!?[0-9]+>$/.test(input) || /^[0-9]+$/.test(input))
	{
		let member;
		if (!input)
			member = message.channel.guild.members.cache.get(message.author.id);
		else
		if (message.channel.type !== "dm")
			member = message.channel.guild.members.cache.get(input.match(/[0-9]+/)[0]);
		else
			return message.channel.send("Cannot display other users' profiles in DMs, yet, sorry!");

		if (member == null)
			return message.channel.send("User not found.");
		else
			member = member.user;

		let query1 = `SELECT * FROM profiles WHERE id = '${member.id}'`;
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

			Canvas.loadImage(member.avatar ? `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.${member.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png").then((image1) => {
				Canvas.loadImage('/app/assets/backgrounds/' + profile.background.substring(0, 7) + (profile.background.substring(7) == 'p' ? ".png" : ".jpg")).then((image2) => {
					return message.channel.send(
						new Discord.MessageEmbed()
						.setTitle("User Profile")
						.setDescription(`<@${member.id}>`)
						.attachFiles(new Discord.MessageAttachment(Profile["draw" + (profile.lefty ? "Left" : "Right")](member, profile, image1, image2), "profile.png"))
						.setImage("attachment://profile.png")
						.setTimestamp()
						.setColor(profile.color)
					);
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
				if (res.rows[0].backgrounds.length == 1)
					return message.channel.send("This is your current background, <@" + message.author.id + ">!\nTo get more backgrounds, say \"x!profile background purchase\" to get a new one!\n**Note**: buying a new background will give you a random one, but you will be able to keep it along with any previously owned backgrounds, such as the one you were given when you first created a profile. All backgrounds cost 500 money.", new Discord.MessageAttachment("./assets/backgrounds/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == 'j' ? ".jpg" : ".png")));

				return message.channel.send("This is your current background, <@" + message.author.id + ">! New backgrounds cost 500 money.\nSay \"x!profile backgrounds own\" to view a list of the other backgrounds you own.", new Discord.MessageAttachment("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/backgrounds/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == 'j' ? ".jpg" : ".png")));
			});
		}
		else
		if (["owned"].includes(args[1]))
		{
			let query1 = `SELECT *\nFROM profiles\nWHERE id = '${message.author.id}'`;
			return db.query(query1, (err, res) => {
				if (err)
					return sqlError(message, err, query1);
				if (res.rows.length == 0)
					return message.channel.send("You have not yet created a profile. To do that, say \"x!profile\" right now!");
				let a,
					b;
					max = Math.ceil(res.rows[0].backgrounds.length / 15);
				if (!args[2])
				{
					if (res.rows[0].backgrounds.length > 10)
					{
						a = 0;
						b = 10;
					}
					else
					{
						a = 0;
						b = res.rows[0].backgrounds.length;
					}
				}
				else
				if (/^[0-9]+$/.test(args[2]))
				{
					if (args[2] >= max)
					{
						a = (max - 1) * 15;
						b = res.rows[0].background.length;
					}
					else
					{
						b = args[2] * 15;
						a = b - 15;
					}
				}
				else
					return message.channel.send("Invalid page number.");
				let b1 = res.rows[0].backgrounds,
					b2 = [];
				for (let i = a; i < b; i++) {
					if (b1[i] !== res.rows[0].background)
						b2.push('`' + b1[i] + "`[" + images.titles[b1[i]] + "](https://i.imgur.com/" + b1[i].substring(0, 6) + {j: ".jpg", p: ".png"}[b1[i][7]] + ')');
					else
						b2.push('`' + b1[i] + "`[" + images.titles[b1[i]] + "](https://i.imgur.com/" + b1[i].substring(0, 6) + {j: ".jpg", p: ".png"}[b1[i][7]] + ') **(Equipped)**');
				}
				let embed = new Discord.MessageEmbed()
					.setColor(new Color().random())
					.setTitle("x!profile backgrounds")
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
					return message.channel.send("There are no more backgrounds for you to purchase, because you've got them all already! When new ones are added, you'll be able to buy more, ok?");
				if (res.rows[0].money < 500)
					return message.channel.send("You do not have enough money to buy another background! Backgrounds cost 500 money each! Get more money by playing games (and winning)!");

				newbg = images.ids.random();
				do
					newbg = images.ids.random();
				while (res.rows[0].backgrounds.includes(newbg));
				res.rows[0].backgrounds.push(newbg);

				let query2 = `UPDATE profiles\nSET backgrounds = ARRAY ${JSON.stringify(res.rows[0].backgrounds).replace(/"/g, "'")}, money = '${res.rows[0].money - 500}'\nWHERE id = '${message.author.id}'`;
				return db.query(query2, (err) => {
					if (err)
						return sqlError(message, err, query2);
					else
						return message.channel.send("Successfully purchased a new background! To equip it, say \"x!profile background **`background ID`**\". New background ID: `" + newbg + '`', new Discord.MessageAttachment("./assets/backgrounds/" + newbg.substring(0, 7) + (newbg.substring(7) == 'j' ? ".jpg" : ".png")));
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

				let query2 = `UPDATE profiles\nSET background = '${args[1]}', lefty = '${images.display.left.includes(args[1]) ? true : images.display.right.includes(args[1]) ? false : res.rows[0].lefty}'\nWHERE id = '${message.author.id}'`;
				return db.query(query2, (err) => {
					if (err)
						return sqlError(message, err, query2);
					else
						return message.channel.send("Successfully equipped the background to `" + args[1] + "`!");
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
	if (["title", "titles"].includes(args[0]))
	{
		if (!args[1])
		{
			let query1 = `SELECT *\nFROM profiles\nWHERE id = '${message.author.id}'`;
			return db.query(query1, (err, res) => {
				if (err)
					return sqlError(message, err, query1);
				if (res.rows.length == 0)
					return message.channel.send("You have not yet created a profile. To do that, say \"x!profile\" right now!");
				if (res.rows[0].titles.length == 1)
					return message.channel.send("The only title you own is the title you currently have equipped. Get some more and then check back with me, ok?");
				let t1 = res.rows[0].titles,
					t2 = [];
				for (let i = 0; i < res.rows[0].titles.length; i++)
				{
					if (t1[i] !== res.rows[0].title)
						t2.push('[' + titles[t1[i]] + "](" + t1[i] + ')');
					else
						t2.push('[' + titles[t1[i]] + "](" + t1[i] + ') (Equipped)');
				}
				return message.channel.send("```md\n# All Titles owned by user:" + res.rows[0].id + ":\n\n  [Title Text](titleID)\n\n  " + t2.join("\n  ") + "\n\nIf you wish to equip any of these, do \"x!profile title `titleID`\" (capitals are important!)!```");
			});
		}

		if (!Object.keys(titles).includes(args[1]))
			return message.channel.send("That title ID does not exist. Try again.");

		let query1 = `SELECT *\nFROM profiles\nWHERE id = '${message.author.id}'`;
		return db.query(query1, (err, res) => {
			if (err)
				return sqlError(message, err, query1);
			if (res.rows.length == 0)
				return message.channel.send("You have not yet created a profile. To do that, say \"x!profile\" right now!");

			let query2 = `UPDATE profiles\nSET title = '${args[1]}'\nWHERE id = '${message.author.id}'`;
			return db.query(query2, (err) => {
				if (err)
					return sqlError(message, err, query2);
				return message.channel.send("Successfully updated your title to `" + titles[args[1]] + "`!");
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
				.setTitle("Available subcommands for x!profile")
				.setDescription(
					"x!profile `subcommand`\n" +
					"\n" +
					"**`backgrounds`** - Opens the background menu for changing your profile's background.\n" +
					"**`displayside`** - Allows you to change which side all the text n stuff is displayed on in your profile. Changing backgrounds will sometimes do that automatically to pick the optimal side.\n" +
					"**`title`** - Displays your currently equipped title, your currently owned titles, or allows you to change your currently equipped title (if you know the ID for it).\n" +
					"**`color`** - Allows you to change the color your profile uses to display information.")
				.setColor(new Color().random()));
	}

	else
		return message.channel.send("Invalid syntax. Try \"x!profile help\" for more information on how to use this.");
}