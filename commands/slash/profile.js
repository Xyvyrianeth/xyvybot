import { Client, dataBase, COMPONENT, BUTTON_STYLE } from "../../index.js";
import pkg from "canvas";
const { loadImage } = pkg;
import { drawProfile } from "../../assets/profile/profile.js";
import { newUser } from "../../index/discordFunctions.js";
import images from "../../assets/profile/backgrounds.json" assert { type: "json" };
import emoji from "../../assets/misc/emoji.json" assert { type: "json" };
import { Color } from "../../assets/misc/color.js";
import { newUIColor } from "../../assets/misc/newUIColor.js";
const itemsPerPage = 20;

export const command = async (interaction) => {
    const channel = await Client.channels.fetch(interaction.channelId);
    const permissions = await channel.permissionsFor(Client.user.id);
    const customEmoji = await permissions.has(1n << 18n);
    const author = { attachment: "./assets/authors/profile.png", name: "author.png" };
    const tempEmbed = {
        author: { name: "Profile", icon_url: "attachment://author.png" },
        description: `${interaction.options._subcommand == "backgrounds" ? "Loading backgrounds" : "Generating profile"} ${customEmoji ? "<a:loading:1010988190250848276>" : ":hourglass:"}`,
        color: new Color().random().toInt() };
    await interaction.reply({ embeds: [ tempEmbed ], files: [ author ] });

    const subCommand = interaction.options._subcommand;
    if (subCommand == "view")
    {
        const userID = interaction.options._hoistedOptions.length == 0 ? interaction.user.id : interaction.options._hoistedOptions[0].value;
        const player = await Client.users.fetch(userID);
        const query = `SELECT * FROM profiles WHERE id = '${player.id}'`;
        const { rows } = await dataBase.query(query);
        const profile = rows.length == 0 ? !interaction.options._group ? await newUser(interaction.user.id) : false : rows[0];

        if (!profile)
        {
            return interaction.editReply("User does not have a profile");
        }

        const avatar = await loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png");
        const background = await loadImage(`./assets/profile/backgrounds/${profile.background}.png`);
        const attachment = { attachment: await drawProfile(profile.lefty, player, profile, avatar, background), name: "profile.png" };
        const author = { attachment: "./assets/authors/profile.png", name: "author.png" };
        const embed = {
            author: { name: "profile", icon_url: "attachment://author.png" },
            description: `${player}`,
            image: { url: "attachment://profile.png" },
            color: new Color(profile.color).toInt() };

        return interaction.editReply({ embeds: [ embed ], files: [ attachment, author ] });
    }
    if (subCommand == "create")
    {
        const player = await Client.users.fetch(interaction.user.id);
        const query = `SELECT * FROM profiles WHERE id = '${player.id}'`;
        const { rows } = await dataBase.query(query);
        const profile = rows.length == 0 ? await newUser(interaction.user.id) : false;

        if (!profile)
        {
            return interaction.editReply({ content: "You already have a profile! Use the command `/profile view` to see it!", ephemeral: true });
        }

        const avatar = await loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png");
        const background = await loadImage("./assets/profile/backgrounds/" + profile.background + ".png");
        const attachment = { attachment: await drawProfile(profile.lefty, player, profile, avatar, background), name: "profile.png" };
        const author = { attachment: "./assets/authors/profile.png", name: "author.png" };
        const embed = {
            author: { name: "profile", icon_url: "attachment://author.png" },
            description: `${player}`,
            image: { url: "attachment://profile.png" },
            color: new Color(profile.color).toInt() };

        return interaction.editReply({ embeds: [ embed ], files: [ attachment, author ] });
    }
    if (subCommand == "backgrounds")
    {
        const query = `SELECT * FROM profiles WHERE id = '${interaction.user.id}'`;
        const { rows } = await dataBase.query(query);
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
                images[b1[i]].tags,
                `./assets/profile/backgrounds/${b1[i] + ".png"}`,
                b1[i] == profile.background ]);
        }

        const author = { attachment: "./assets/authors/profile.png", name: "author.png" };
        const embed = {
            author: { name: "profile", icon_url: "attachment://author.png" },
            description: `Backgrounds owned by ${interaction.user} (Page ${page} of ${max}):\n\n` + b2.map(image => `\`${'0'.repeat(3 - String(profile.backgrounds.indexOf(image[0]) + 1).length) + (profile.backgrounds.indexOf(image[0]) + 1)}\`) [\`${image[0]}\`](${image[2]}) | \`${image[1].join("` `")}\` ${image[3] ? " **(Equipped)**" : ""}`).join('\n'),
            footer: { text: profile.backgrounds.length + " total backgrounds owned" },
            color: new Color().random().toInt() };
        const pageActionRow = {
            type: COMPONENT.ACTION_ROW,
            components: [
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.BLUE,
                emoji: emoji.previous_3,
                customId: "profile.background.page.1.1",
                disabled: page == 1 },
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.BLUE,
                emoji: emoji.previous_1,
                customId: "profile.background.page." + (page - 1) + ".2",
                disabled: page == 1 },
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.GREY,
                label: `Page ${page}/${max}`,
                customId: "do.nothing" },
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.BLUE,
                emoji: emoji.next_1,
                customId: "profile.background.page." + (page + 1) + ".3",
                disabled: page == max },
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.BLUE,
                emoji: emoji.next_3,
                customId: "profile.background.page." + max + ".4",
                disabled: page == max } ] };
        const equipActionRow = {
            type: COMPONENT.ACTION_ROW,
            components: [
                {   type: COMPONENT.DROP_MENU,
                    customId: "profile.background.preview." + page,
                    placeholder: "Preview a background",
                    options: b2.map(image => { return { label: '0'.repeat(3 - String(profile.backgrounds.indexOf(image[0]) + 1).length) + (profile.backgrounds.indexOf(image[0]) + 1) + ') ' + image[0], description: `${image[1].join(", ").substring(0, 99)}`, value: image[0] }; }) } ] };
        const purchaseActionRow = {
            type: COMPONENT.ACTION_ROW,
            components: [
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.GREEN,
                label: "Purchase New Background (500 money)",
                customId: "profile.background.purchase",
                disabled: profile.money < 500 || profile.backgrounds.length == Object.keys(images).length } ] };

        return interaction.editReply({ embeds: [ embed ], files: [ author ], components: [ pageActionRow, equipActionRow, purchaseActionRow ] });
    }
    if (subCommand == "edit")
    {
        if (interaction.options._hoistedOptions.length == 0)
        {
            return interaction.editReply({ content: "You have to change *something*", ephemeral: true });
        }

        const player = await Client.users.fetch(interaction.user.id);
        const selectQuery = `SELECT * FROM profiles WHERE id = '${player.id}'`;
        const { rows } = await dataBase.query(selectQuery);
        const profile = rows.length == 0 ? await newUser(player.id) : rows[0];
        const background = await loadImage("./assets/profile/backgrounds/" + profile.background + ".png");

        const updates = [];
        const fails = [];
        await interaction.options._hoistedOptions.forEach(option => {
            if (option.name == "title")
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
                return;
            }
            if (option.name == "color")
            {
                if (!/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(option.value) && option.value !== "default")
                {
                    return fails.push(`\`${option.value}\` is not a valid hexidecimal color value`);
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
                return;
            }
            if (option.name == "displayside")
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
                return;
            }
        });

        if (fails.length != 0)
        {
            return interaction.editReply({ content: fails.join("\n"), ephemeral: true });
        }

        const updateQuery = `UPDATE profiles SET ${updates.join(", ")} WHERE id = '${player.id}'`;
        await dataBase.query(updateQuery);

        const avatar = await loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png");
        const attachment = { attachment: await drawProfile(profile.lefty, player, profile, avatar, background), name: "profile.png" };
        const author = { attachment: "./assets/authors/profile.png", name: "author.png" };
        const embed = {
            author: { name: "profile", icon_url: "attachment://author.png" },
            description: "Successfully updated your profile! Take a look:",
            image: { url: "attachment://profile.png" },
            color: new Color(profile.color).toInt() };

        return interaction.editReply({ embeds: [ embed ], files: [ author, attachment ] });
    }
}