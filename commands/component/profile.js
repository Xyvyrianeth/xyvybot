import { Xyvybot, dataBase, COMPONENT, BUTTON_STYLE } from "../../index.js";
import pkg from "canvas";
const { loadImage } = pkg;
import { drawProfile } from "../../assets/profile/profile.js";
import { newUser } from "../../index/discordFunctions.js";
import images from "../../assets/profile/backgrounds.json" assert { type: "json" };
import emoji from "../../assets/misc/emoji.json" assert { type: "json" };
import { Color } from "../../assets/misc/color.js";
const itemsPerPage = 20;

export const command = async (interaction) => {
    if (interaction.user.id != interaction.message.interaction.user.id)
    {
        return interaction.reply({ content: `You cannot use this interaction; it belongs to ${interaction.message.interaction.user}.`, ephemeral: true });
    }

    const channel = await Xyvybot.channels.fetch(interaction.channelId);
    const permissions = await channel.permissionsFor(Xyvybot.user.id);
    const customEmoji = await permissions.has(1n << 18n);
    const author = { attachment: "./assets/authors/profile.png", name: "author.png" };
    const components = interaction.message.components.map(row => {
        row.components = row.components.map(component => {
            component.data.disabled = true;
            return component; }); return row; });
    const embed = {
        author: { name: "Profile", icon_url: "attachment://author.png" },
        description: `${interaction.customId.split('.')[2] == "page" ? "Loading backgrounds" : "Generating profile"} ${customEmoji ? "<a:loading:1010988190250848276>" : ":hourglass:"}`,
        color: new Color().random().toInt() };
    await interaction.update({ embeds: [ embed ], files: [ author ], components: components });

    const command = interaction.customId.split('.');
    if (command[2] == "purchase")
    {
        const selectQuery = `SELECT * FROM profiles WHERE id = '${interaction.user.id}'`;
        const { rows } = await dataBase.query(selectQuery);
        const profile = rows.length == 0 ? await newUser(interaction.user.id) : rows[0];

        profile.money -= 500;

        const newBackground = Object.keys(images).filter(id => !profile.backgrounds.includes(id)).random();
        const updateQuery = `UPDATE profiles SET backgrounds = backgrounds || '{"${newBackground}"}', money = money - 500 WHERE id = '${interaction.user.id}'`;

        await dataBase.query(updateQuery);

        const embed = {
            author: { name: "profile", icon_url: "attachment://author.png" },
            description: `Successfully purchased a new background!\nID: \`${newBackground}\``,
            image: { url: "./assets/profile/backgrounds/" + newBackground + ".png" },
            color: new Color().random().toInt() };
        const actionRow = {
            type: COMPONENT.ACTION_ROW,
            components: [
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.GREEN,
                label: "Equip",
                customId: "profile.background.equip." + newBackground },
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.BLUE,
                label: "Purchase Another",
                customId: "profile.background.purchase",
                disabled: profile.money < 500 || profile.backgrounds.length == Object.keys(images).length },
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.RED,
                label: "Go back",
                customId: "profile.background.page." + Math.ceil((profile.backgrounds.length + 1) / itemsPerPage) } ] };

        return interaction.message.edit({ embeds: [ embed ], files: [ author ], components: [ actionRow ], attachments: [] });
    }
    if (command[2] == "page")
    {
        const query = `SELECT * FROM profiles WHERE id = '${interaction.user.id}'`;
        const { rows } = await dataBase.query(query);
        const profile = rows.length == 0 ? await newUser(interaction.user.id) : rows[0];
        const page = Number(command[3]);
        const max = Math.ceil(profile.backgrounds.length / itemsPerPage);
        const offset = profile.backgrounds.length > page * itemsPerPage ? page * itemsPerPage : profile.backgrounds.length;
        const b2 = [];

        for (let i = (page - 1) * itemsPerPage; i < offset; i++)
        {
            b2.push([
                profile.backgrounds[i],
                images[profile.backgrounds[i]].tags[profile.backgrounds[i]],
                `./assets/profile/backgrounds/${profile.backgrounds[i] + ".png"}`,
                profile.backgrounds[i] == profile.background ]);
        }

        const embed = {
            author: { name: "profile", icon_url: "attachment://author.png" },
            description: `Backgrounds owned by ${interaction.user}:\n\n` + b2.map(image => `\`${'0'.repeat(3 - String(profile.backgrounds.indexOf(image[0]) + 1).length) + (profile.backgrounds.indexOf(image[0]) + 1)}\`) [\`${image[0]}\`](${image[2]}) | \`${image[1].join("` `")}\` ${image[3] ? " **(Equipped)**" : ""}`).join('\n'),
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
                customId: "do.nothing",
                disabled: true },
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

        return interaction.message.edit({ embeds: [ embed ], files: [ author ], components: [ pageActionRow, equipActionRow, purchaseActionRow ], attachments: [] });
    }
    if (command[2] == "equip")
    {
        const newBackground = command[3];
        const selectQuery = `SELECT * FROM profiles WHERE id = '${interaction.user.id}'`;
        const profile = (await dataBase.query(selectQuery)).rows[0];
        const displaySide = images[newBackground].left && images[newBackground].right ? profile.lefty : images[newBackground].left;
        const updateQuery = `UPDATE profiles SET background = '${newBackground}', lefty = '${displaySide}' WHERE id = '${interaction.user.id}'`;
        await dataBase.query(updateQuery);

        const player = await Xyvybot.users.fetch(interaction.user.id);
        const avatar = await loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png");
        const background = await loadImage("./assets/profile/backgrounds/" + newBackground + ".png");
        const file = { attachment: await drawProfile(displaySide, player, profile, avatar, background), name: "profile.png" };
        const embed = {
            author: { name: "profile", icon_url: "attachment://author.png" },
            description: "Your new profile background has been equipped! Take a look!",
            image: { url: "attachment://profile.png" },
            color: new Color(profile.color).toInt() };

        return interaction.message.edit({ embeds: [ embed ], files: [ file, author ], components: [], attachments: [] });
    }
    if (command[2] == "preview")
    {
        const selectQuery = `SELECT * FROM profiles WHERE id = '${interaction.user.id}'`;
        const { rows } = await dataBase.query(selectQuery);
        const profile = rows.length == 0 ? await newUser(interaction.user.id) : rows[0];

        const newBackground = interaction.isButton() ? command[3] : interaction.values[0];
        const displaySide = images[newBackground].left && images[newBackground].right ? profile.lefty : images[newBackground].left;
        const description = (profile.background == newBackground ? "You currently have this background equipped" : "Equip this background?") + `\nID: \`${newBackground}\``;

        const player = await Xyvybot.users.fetch(interaction.user.id);
        const avatar = await loadImage(player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.${player.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png");
        const background = await loadImage("./assets/profile/backgrounds/" + newBackground + ".png");
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
            type: COMPONENT.ACTION_ROW,
            components: [
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.RED,
                label: "Go back",
                customId: "profile.background.page." + Math.ceil((profile.backgrounds.indexOf(backgroundIDs[1]) + 1) / itemsPerPage) },
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.BLUE,
                emoji: emoji.previous_1,
                customId: `profile.background.preview.${backgroundIDs[0]}.previous`,
                disabled: profile.backgrounds.length == 1 },
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.BLUE,
                emoji: emoji.next_1,
                customId: `profile.background.preview.${backgroundIDs[2]}.next`,
                disabled: profile.backgrounds.length == 1 },
            {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.GREEN,
                label: "Equip this!",
                customId: "profile.background.equip." + newBackground,
                disabled: profile.background == newBackground } ] };

        return interaction.message.edit({ embeds: [ embed ], components: [ actionRow ], files: [ file, author ], attachments: [] });
    }
}