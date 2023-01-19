import pkg from "canvas";
const { loadImage } = pkg;
import { client, db, newUser, emoji } from "../index.js";
import { drawProfile } from "../assets/profile/profile.js";
import images from "../assets/profile/backgrounds.json" assert { type: "json" };
import { Color } from "../assets/misc/color.js";
import { newUIColor } from "../assets/misc/newUIColor.js";
const itemsPerPage = 20;

export const command = async (interaction) => {
	if ((interaction.isButton() || interaction.isSelectMenu()) && interaction.user.id != interaction.message.interaction.user.id)
	{
		return interaction.reply({ content: `You cannot use this interaction; it belongs to ${interaction.message.interaction.user}.`, ephemeral: true });
	}

	const customEmoji = client.channels.cache.get(interaction.channelId).permissionsFor(client.user.id).has(1n << 18n);
	const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/profile.png", name: "author.png" };
	if (interaction.isCommand())
	{
		let embed = {
			author: { name: "Profile", icon_url: "attachment://author.png" },
			description: `${interaction.options._subcommand == "backgrounds" ? "Loading backgrounds" : "Generating profile"} ${customEmoji ? "<a:loading:1010988190250848276>" : ":hourglass:"}`,
			color: new Color().random().toInt() };
		await interaction.reply({ embeds: [embed], files: [author] });
	}
	else
	{
		const components = interaction.message.components.map(row => {
			row.components = row.components.map(component => {
				component.data.disabled = true;
				return component; }); return row; });
		const embed = {
			author: { name: "Profile", icon_url: "attachment://author.png" },
			description: `${interaction.customId.split('.')[2] == "page" ? "Loading backgrounds" : "Generating profile"} ${customEmoji ? "<a:loading:1010988190250848276>" : ":hourglass:"}`,
			color: new Color().random().toInt() };
		await interaction.update({ embeds: [embed], files: [author], components: components });
	}

	if (interaction.isCommand())
	{
		switch (interaction.options._subcommand)
		{
			case "view":
			{
				const userID = interaction.options._hoistedOptions.length == 0 ? interaction.user.id : interaction.options._hoistedOptions[0].value;
				const player = await client.users.fetch(userID);
				const query = `SELECT * FROM profiles WHERE id = '${player.id}'`;
				const { rows } = await db.query(query);
				const profile = rows.length == 0 ? !interaction.options._group ? await newUser(interaction.user.id) : false : rows[0];

				if (!profile)
				{
					return interaction.editReply("User does not have a profile");
				}

				const avatar = await loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png");
				const background = await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/backgrounds/" + profile.background + ".png");
				const attachment = { attachment: await drawProfile(profile.lefty, player, profile, avatar, background), name: "profile.png" };
				const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile.png", name: "author.png" };
				const embed = {
					author: { name: "profile", icon_url: "attachment://author.png" },
					description: `${player}`,
					image: { url: "attachment://profile.png" },
					color: new Color(profile.color).toInt() };

				return interaction.editReply({ embeds: [embed], files: [attachment, author] });
			}
			case "create":
			{
				const player = await client.users.fetch(interaction.user.id);
				const query = `SELECT * FROM profiles WHERE id = '${player.id}'`;
				const { rows } = await db.query(query);
				const profile = rows.length == 0 ? await newUser(interaction.user.id) : false;

				if (!profile)
				{
					return interaction.editReply({ content: "You already have a profile! Use the command `/profile view` to see it!", ephemeral: true });
				}

				const avatar = await loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png");
				const background = await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/backgrounds/" + profile.background + ".png");
				const attachment = { attachment: await drawProfile(profile.lefty, player, profile, avatar, background), name: "profile.png" };
				const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/profile.png", name: "author.png" };
				const embed = {
					author: { name: "profile", icon_url: "attachment://author.png" },
					description: `${player}`,
					image: { url: "attachment://profile.png" },
					color: new Color(profile.color).toInt() };

				return interaction.editReply({ embeds: [embed], files: [attachment, author] });
			}
			case "backgrounds":
			{
				const query = `SELECT *\nFROM profiles\nWHERE id = '${interaction.user.id}'`;
				const { rows } = await db.query(query);
				const profile = rows.length == 0 ? await newUser(interaction.user.id) : rows[0];

				const max = Math.ceil(profile.backgrounds.length / itemsPerPage);
				const page = 1;
				const a = profile.backgrounds.length >= itemsPerPage ? itemsPerPage : profile.backgrounds.length;
				const b1 = profile.backgrounds;
				const b2 = [];

				for (let i = 0; i < a; i++)
				{
					b2.push([
						b1[i],
						images.tags[b1[i]],
						`https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/backgrounds/${b1[i] + ".png"}`,
						b1[i] == profile.background ]);
				}

				const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/profile.png", name: "author.png" };
				const embed = {
					author: { name: "profile", icon_url: "attachment://author.png" },
					description: `Backgrounds owned by ${interaction.user} (Page ${page} of ${max}):\n\n` + b2.map(image => `\`${'0'.repeat(3 - String(profile.backgrounds.indexOf(image[0]) + 1).length) + (profile.backgrounds.indexOf(image[0]) + 1)}\`) [\`${image[0]}\`](${image[2]}) | \`${image[1].join("` `")}\` ${image[3] ? " **(Equipped)**" : ""}`).join('\n'),
					footer: { text: profile.backgrounds.length + " total backgrounds owned" },
					color: new Color().random().toInt() };
				const pageActionRow = {
					type: 1,
					components: [
					{	type: 2, style: 1, // Blue Button
						emoji: emoji.previous_3,
						customId: "profile.background.page.1.1",
						disabled: page == 1 },
					{	type: 2, style: 1, // Blue Button
						emoji: emoji.previous_1,
						customId: "profile.background.page." + (page - 1) + ".2",
						disabled: page == 1 },
					{	type: 2, style: 2, // Grey Button
						label: `Page ${page}/${max}`,
						customId: "do.nothing" },
					{	type: 2, style: 1, // Blue Button
						emoji: emoji.next_1,
						customId: "profile.background.page." + (page + 1) + ".3",
						disabled: page == max },
					{	type: 2, style: 1, // Blue Button
						emoji: emoji.next_3,
						customId: "profile.background.page." + max + ".4",
						disabled: page == max } ] };
				const equipActionRow = {
					type: 1,
					components: [
						{	type: 3,
							customId: "profile.background.preview." + page,
							placeholder: "Preview a background",
							options: b2.map(image => { return { label: '0'.repeat(3 - String(profile.backgrounds.indexOf(image[0]) + 1).length) + (profile.backgrounds.indexOf(image[0]) + 1) + ') ' + image[0], description: `${image[1].join(", ").substring(0, 99)}`, value: image[0] }; }) } ] };
				const purchaseActionRow = {
					type: 1,
					components: [
					{	type: 2, style: 3,
						label: "Purchase New Background (500 money)",
						customId: "profile.background.purchase",
						disabled: profile.money < 500 || profile.backgrounds.length == images.ids.length } ] };

				return interaction.editReply({ embeds: [embed], files: [author], components: [pageActionRow, equipActionRow, purchaseActionRow] });
			}
			case "edit":
			{
				if (interaction.options._hoistedOptions.length == 0)
				{
					return interaction.editReply({ content: "You have to change *something*", ephemeral: true });
				}

				const player = await client.users.fetch(interaction.user.id);
				const selectQuery = `SELECT *\nFROM profiles\nWHERE id = '${player.id}'`;
				const { rows } = await db.query(selectQuery);
				const profile = rows.length == 0 ? await newUser(player.id) : rows[0];
				const background = await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/backgrounds/" + profile.background + ".png");

				const updates = [];
				const fails = [];
				interaction.options._hoistedOptions.forEach(option => {
					switch (option.name)
					{
						case "title":
						{
							const title = option.value.split('').filter(a => /[a-zA-Z0-9—–\-_!?.,:;/\\\(\)\[\]\{\}\|~+×@#$%^&*÷='<>`¡¿€£¥°• ©®¢™✓¶∆πΩΠμ§∞≠≈]/.test(a)).join('').replace(/'/g, "\u200b");
							if (title == profile.title)
							{
								fails.push(`Your title is already "${title.replace(/\u200b/g, "'")}"`);
							}
							else
							{
								updates.push(`title = '${title}'`);
								profile.title = title;
							}
							break;
						}
						case "color":
						{
							if (!/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(option.value) && option.value !== "default")
							{
								fails.push(`\`${option.value}\` is not a valid hexidecimal color value`);
								break;
							}
							const newColor = option.value == "default" ? new Color(newUIColor(background)).toHexa() : (/^#/.test(option.value) ? '' : '#') + option.value;
							if (newColor == profile.color)
							{
								fails.push(`Your profile color is already \`${newColor}\``);
							}
							else
							{
								updates.push(`color = '${newColor}'`);
								profile.color = newColor;
							}
							break;
						}
						case "displayside":
						{
							if ((option.value == "left") == profile.lefty)
							{
								fails.push(`Your information panel is already on the ${option.value} side`);
							}
							else
							{
								updates.push(`lefty = ${option.value == "left"}`);
								profile.lefty = option.value == "left";
							}
							break;
						}
					}
				});

				if (fails.length != 0)
				{
					return interaction.editReply({ content: fails.join("\n"), ephemeral: true });
				}

				const updateQuery = `UPDATE profiles\nSET ${updates.join(", ")}\nWHERE id = '${player.id}'`;
				await db.query(updateQuery);

				const avatar = await loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png");
				const attachment = { attachment: await drawProfile(profile.lefty, player, profile, avatar, background), name: "profile.png" };
				const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/profile.png", name: "author.png" };
				const embed = {
					author: { name: "profile", icon_url: "attachment://author.png" },
					description: "Successfully updated your profile! Take a look:",
					image: { url: "attachment://profile.png" },
					color: new Color(profile.color).toInt() };

				return interaction.editReply({ embeds: [embed], files: [author, attachment] });
			}
		}
	}

	if (interaction.isButton() || interaction.isSelectMenu())
	{
		const command = interaction.customId.split('.');
		const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/profile.png", name: "author.png" };

		switch (command[1])
		{
			case "background":
			{
				switch (command[2])
				{
					case "purchase":
					{
						const selectQuery = `SELECT *\nFROM profiles\nWHERE id = '${interaction.user.id}'`;
						const { rows } = await db.query(selectQuery);
						const profile = rows.length == 0 ? await newUser(interaction.user.id) : rows[0];

						profile.money -= 500;

						const newBackground = images.ids.filter(id => !profile.backgrounds.includes(id)).random();
						const updateQuery = `UPDATE profiles\nSET backgrounds = array_append(backgrounds, '${newBackground}'), money = money - 500\nWHERE id = '${interaction.user.id}'`;

						await db.query(updateQuery);

						const embed = {
							author: { name: "profile", icon_url: "attachment://author.png" },
							description: `Successfully purchased a new background!\nID: \`${newBackground}\``,
							image: { url: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/backgrounds/" + newBackground + ".png" },
							color: new Color().random().toInt() };
						const actionRow = {
							type: 1,
							components: [
							{	type: 2, style: 3, // Green Button
								label: "Equip",
								customId: "profile.background.equip." + newBackground },
							{	type: 2, style: 1, // Blue Button
								label: "Purchase Another",
								customId: "profile.background.purchase",
								disabled: profile.money < 500 || profile.backgrounds.length == images.ids.length },
							{	type: 2, style: 4, // Red Button
								label: "Go back",
								customId: "profile.background.page." + Math.ceil((profile.backgrounds.length + 1) / itemsPerPage) } ] };

						return interaction.message.edit({ embeds: [embed], files: [author], components: [actionRow], attachments: [] });
					}
					case "page":
					{
						const query = `SELECT *\nFROM profiles\nWHERE id = '${interaction.user.id}'`;
						const { rows } = await db.query(query);
						const profile = rows.length == 0 ? await newUser(interaction.user.id) : rows[0];
						const page = Number(command[3]);
						const max = Math.ceil(profile.backgrounds.length / itemsPerPage);
						const offset = profile.backgrounds.length > page * itemsPerPage ? page * itemsPerPage : profile.backgrounds.length;
						const b2 = [];

						for (let i = (page - 1) * itemsPerPage; i < offset; i++)
						{
							b2.push([
								profile.backgrounds[i],
								images.tags[profile.backgrounds[i]],
								`https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/backgrounds/${profile.backgrounds[i] + ".png"}`,
								profile.backgrounds[i] == profile.background ]);
						}

						const embed = {
							author: { name: "profile", icon_url: "attachment://author.png" },
							description: `Backgrounds owned by ${interaction.user}:\n\n` + b2.map(image => `\`${'0'.repeat(3 - String(profile.backgrounds.indexOf(image[0]) + 1).length) + (profile.backgrounds.indexOf(image[0]) + 1)}\`) [\`${image[0]}\`](${image[2]}) | \`${image[1].join("` `")}\` ${image[3] ? " **(Equipped)**" : ""}`).join('\n'),
							footer: { text: profile.backgrounds.length + " total backgrounds owned" },
							color: new Color().random().toInt() };
						const pageActionRow = {
							type: 1,
							components: [
							{	type: 2, style: 1, // Blue Button
								emoji: emoji.previous_3,
								customId: "profile.background.page.1.1",
								disabled: page == 1 },
							{	type: 2, style: 1, // Blue Button
								emoji: emoji.previous_1,
								customId: "profile.background.page." + (page - 1) + ".2",
								disabled: page == 1 },
							{	type: 2, style: 2, // Grey Button
								label: `Page ${page}/${max}`,
								customId: "do.nothing",
								disabled: true },
							{	type: 2, style: 1, // Blue Button
								emoji: emoji.next_1,
								customId: "profile.background.page." + (page + 1) + ".3",
								disabled: page == max },
							{	type: 2, style: 1, // Blue Button
								emoji: emoji.next_3,
								customId: "profile.background.page." + max + ".4",
								disabled: page == max } ] };
						const equipActionRow = {
							type: 1,
							components: [
							{	type: 3,
								customId: "profile.background.preview." + page,
								placeholder: "Preview a background",
								options: b2.map(image => { return { label: '0'.repeat(3 - String(profile.backgrounds.indexOf(image[0]) + 1).length) + (profile.backgrounds.indexOf(image[0]) + 1) + ') ' + image[0], description: `${image[1].join(", ").substring(0, 99)}`, value: image[0] }; }) } ] };
						const purchaseActionRow = {
							type: 1,
							components: [
							{	type: 2, style: 3,
								label: "Purchase New Background (500 money)",
								customId: "profile.background.purchase",
								disabled: profile.money < 500 || profile.backgrounds.length == images.ids.length } ] };

						return interaction.message.edit({ embeds: [embed], files: [author], components: [pageActionRow, equipActionRow, purchaseActionRow], attachments: [] });
					}
					case "equip":
					{
						const newBackground = command[3];
						const selectQuery = `SELECT *\nFROM profiles\nWHERE id = '${interaction.user.id}'`;
						const profile = (await db.query(selectQuery)).rows[0];
						const displaySide = images.display.left.includes(newBackground) ? true : images.display.right.includes(newBackground) ? false : profile.lefty;
						const updateQuery = `UPDATE profiles\nSET background = '${newBackground}', lefty = '${displaySide}'\nWHERE id = '${interaction.user.id}'`;
						await db.query(updateQuery);

						const player = await client.users.fetch(interaction.user.id);
						const avatar = await loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png");
						const background = await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/backgrounds/" + newBackground + ".png");
						const file = { attachment: await drawProfile(displaySide, player, profile, avatar, background), name: "profile.png" };
						const embed = {
							author: { name: "profile", icon_url: "attachment://author.png" },
							description: "Your new profile background has been equipped! Take a look!",
							image: { url: "attachment://profile.png" },
							color: new Color(profile.color).toInt() };

						return interaction.message.edit({ embeds: [embed], files: [file, author], components: [], attachments: [] });
					}
					case "preview":
					{
						const selectQuery = `SELECT *\nFROM profiles\nWHERE id = '${interaction.user.id}'`;
						const { rows } = await db.query(selectQuery);
						const profile = rows.length == 0 ? await newUser(interaction.user.id) : rows[0];

						const newBackground = interaction.isButton() ? command[3] : interaction.values[0];
						const displaySide = images.display.left.includes(newBackground) ? true : images.display.right.includes(newBackground) ? false : rows[0].lefty;
						const description = (profile.background == newBackground ? "You currently have this background equipped" : "Equip this background?") + `\nID: \`${newBackground}\``;

						const player = await client.users.fetch(interaction.user.id);
						const avatar = await loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png");
						const background = await loadImage("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/profile/backgrounds/" + newBackground + ".png");
						const file = { attachment: await drawProfile(displaySide, player, profile, avatar, background, true), name: newBackground + ".png" };
						const embed = {
							author: { name: "profile", icon_url: "attachment://author.png" },
							description: description,
							image: { url: "attachment://" + newBackground + ".png" },
							color: new Color().random().toInt() };

						const index = profile.backgrounds.indexOf(newBackground);
						const backgroundIDs = [
							profile.backgrounds[index == 0 ? profile.backgrounds.length - 1 : index - 1],
							newBackground,
							profile.backgrounds[index + 1 == profile.backgrounds.length ? 0 : index + 1] ];

						const actionRow = {
							type: 1,
							components: [
							{	type: 2, style: 4, // Red Button
								label: "Go back",
								customId: "profile.background.page." + Math.ceil((profile.backgrounds.indexOf(backgroundIDs[1]) + 1) / itemsPerPage) },
							{	type: 2, style: 1, // Blue Button
								emoji: emoji.previous_1,
								customId: `profile.background.preview.${backgroundIDs[0]}.previous`,
								disabled: profile.backgrounds.length == 1 },
							{	type: 2, style: 1, // Blue Button
								emoji: emoji.next_1,
								customId: `profile.background.preview.${backgroundIDs[2]}.next`,
								disabled: profile.backgrounds.length == 1 },
							{	type: 2, style: 3, // Green button
								label: "Equip this!",
								customId: "profile.background.equip." + newBackground,
								disabled: profile.background == newBackground } ] };

						return interaction.message.edit({ embeds: [embed], components: [actionRow], files: [file, author], attachments: [] });
					}
				}
			}
		}
	}
}