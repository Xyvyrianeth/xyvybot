import { Client, version, COMPONENT, BUTTON_STYLE } from "../index.js";
import { botError } from "../index/discordFunctions.js";
import { Games } from "../games/Games.js";
import { Color } from "../assets/misc/color.js";

export const onReady = async () => {
    Client.user.setPresence({ status: "ONLINE", activity: { name: version + "!", type: "PLAYING" } });
    setInterval(() => {
        Client.user.setPresence({ status: "ONLINE", activity: { name: [
            version + "!",
            "in " + Client.guilds.cache.size + " servers!",
            "Use the command /help for a list of commands!",
            "Now fully converted to slash commands and buttons!",
            "Used by at least one person every day!",
            "Reversi and Chill",
            "I currently have 10 playable games, and I want to add more. Suggest your favorite Abstract Strategy Game with the command /request!",
            "What games do you want to see me support? Use the command /request to send me some suggestions!",
            "they don't think it be like it is, but it do",
            "I will never support Chess. There's already a bot for that. It's literally called Chess Bot. I will not be doing that, thank you.",
            "One day, I'll be completed.",
            "Did you know you can play some games against me myself?",
            "No human has ever beaten my AI bot in a game of Squares!",
            "The best bot for playing a specific collection of Abstract Strategy Games that I know of!",
            "You can also play games via DMs! Someone else has to want to play somewhere else, though.",
            "Some day, I'll be a popular bot.",
            "Ever heard of the game Ordo?",
            "Adding Go would be a mistake because there's no guaranteed end to it. It just goes on and on until both players decide they're done or somebody dies and time runs out.",
            "Now with slash commands!",
            "Let's play Countdown!" ].random(), type: "PLAYING" } }); }, 30000);

    console.log("Bot is ready");
}

export const messageCreate = async message => {
    const channel = await Client.channels.fetch(message.channelId);
    if (!channel)
    {   // Can't find channel??
        return;
    }
    if (channel.guildId != null)
    {
        if (![0, 1, 3, 5, 10, 11, 12].includes(channel.type))
        {   // Invalid channel types
            return;
        }
        if (!channel.permissionsFor(Client.user.id)?.has(1n << 11n) || !channel.permissionsFor(Client.user.id).has(1n << 15n))
        {   // Lacks Send Messages and Attach Files permissions
            return;
        }
        if (([10, 11, 12].includes(channel.type)) && !channel.permissionsFor(Client.user.id).has(1n << 38n))
        {   // Lacks Send Message in Threads permission
            return;
        }
    }

    try
    {
        if (message.author.id == Client.user.id || !message.author.bot)
        {
            return await import(`../commands/message/message.js`).then(Command => Command.command(message));
        }
    }
    catch (err)
    {
        return botError(err, message, true);
    }
}

export const interactionCreate = async interaction => {
    if (interaction.user.bot)
    {
        return;
    }

    try {
        if ((interaction.isButton() || interaction.isSelectMenu()) && (!interaction.customId.startsWith("trivia") && Math.abs(new Date().getTime() - (interaction.message.editedTimestamp || interaction.message.createdTimestamp)) >= (1800000)))
        {
            const actionRow = {
                type: COMPONENT.ACTION_ROW,
                components: [
                {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.RED, // Red Button
                    customId: "do.nothing",
                    label: "This interaction has expired",
                    disabled: true } ] };
            return interaction.update({ components: [ actionRow ] });
        }

        const channel = await Client.channels.fetch(interaction.channelId);
        if (![0, 1, 3, 5, 10, 11, 12].includes(channel.type))
        {   // Invalid channel types
            return;
        }

        const command = interaction.isCommand() ? interaction.commandName : interaction.customId.split('.')[0];
        const games = ["othello", "squares", "rokumoku", "3dtictactoe", "connect4", "ordo", "papersoccer", "linesofaction", "latrones", "spiderlinetris"];
        const permissions = channel.permissionsFor(Client.user.id);
        if ([10, 11, 12].includes(channel.type) && !permissions.has(1n << 38n))
        {
            return interaction.reply({ content: "This command is disabled in this thread due to incorrect permissions. Contact the server staff about correcting this.", ephemeral: true });
        }

        const text = "This command is disabled in this channel due to missing specific permissions. Contact the server staff about correcting this.";
        const customEmoji = !permissions.has(1n << 18n);
        const requirementChannels = [
            // [], [], [],
            games.concat(["hangman", "history", "iq", "leaderboard", "profile", "replay", "trivia"]),
            games.concat(["hangman", "iq", "trivia"]),
            games.concat(["hangman", "history", "iq", "leaderboard", "profile", "replay", "trivia"]),
        ];
        const perms = [
            requirementChannels[0].includes(command) && !permissions.has(1n << 10n),
            requirementChannels[1].includes(command) && !permissions.has(1n << 11n),
            requirementChannels[2].includes(command) && !permissions.has(1n << 15n) ];

        if (perms.includes(true))
        {
            const content = text + "\n\n__Required Permissions__:\n" + perms.filter((perm, index) => requirementChannels[index].includes(command)).map((perm, index) => {
                    const title = [ "View Channel", "Send Messages", "Attach Files" ].filter((perm, index) => requirementChannels[index].includes(command))[index];
                    return `${perm ? customEmoji ? ":x:" : `<:uncheck:1011006268783206541>` : customEmoji ? ":white_check_mark:" : `<:check:1011006269815017492>`} **${title}**`
                }).join('\n');
            return interaction.reply({ content: content, ephemeral: true });
        }

        if (interaction.isCommand())
        {
            if (games.includes(command))
            {
                return await import(`../commands/slash/game.js`).then(Command => Command.command(interaction));
            }
            return await import(`../commands/slash/${command}.js`).then(Command => Command.command(interaction));
        }
        else
        {
            if (games.includes(command))
            {
                return await import(`../commands/component/game.js`).then(Command => Command.command(interaction));
            }
            return await import(`../commands/component/${command}.js`).then(Command => Command.command(interaction));
        }
    }
    catch (err)
    {
        return botError(err, interaction, false);
    }
}

export const guildCreate = async guild => {
    const owner = await guild.members.fetch(guild.ownerId);
    const embed = {
        author: { name: "Thank you for installing Xyvybot!", url: "./assets/misc/avatar.png" },
        description:
            "To set it up correctly, use the command /setup in whichever channels you want it to be used in and adjust permissions as needed. " +
            "Don't worry, it only needs a few basic permissions your typical server member would have anyways.\n\n" +
            "To avoid injury, the bot will disable certain features if it does not have the necessary permissions in a given channel. " +
            "This is done to avoid it crashing via attempting to do something it's not allowed to do.\n\n" +
            "Once your channels are all set up, the bot is good to go. Enjoy!",
        color: new Color().random().toInt() };

    await owner.send({ embeds: [ embed ] });
}

export const channelDelete = async (Thing, thing) => {
    const Game = Games.find(game => game[thing + "s"].includes(Thing.id));
    if (!Game)
    {
        return;
    }

    const display = await Rules.drawBoard(Game);
    const imageName = `${Game.game}_${Game.end}_${Game.id}.png`;
    const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png", name: "author.png" };
    const attachment = { attachment: display, name: imageName };
    const embed = {
        author: {
            name: `${Game.name} | x!${Game.game} | [Rules]`,
            icon_url: "attachment://author.png",
            url: "https://github.com/Xyvyrianeth/xyvybot_assets/wiki/" + Game.game },
        description: `<@${Game.players[0]}> VS <@${Game.players[1]}>\n\n${Game.endMessage()}`,
        image: { url: "attachment://" + imageName },
        color: new Color(Game.turnColors[Game.turn | 0]).toInt() };
    const payload = {
        content: "The server you were playing a game in has either been deleted or has removed me. For your convenience, you may now play the game here.",
        embeds: [ embed ],
        files: [ author, attachment ] };

    if (Game[thing + "s"][0] !== Game[thing + "s"][1])
    {
        const index = Game[thing + "s"].indexOf(Thing.id);
        const playerId = Game.players[index];
        await Client.users.send(playerId, payload).then(message => Game.channels[index] = message.channelId);
        Game.guilds[index] = null;
    }
    for (const index in Game.players)
    {
        const playerId = Game.players[index];
        await Client.users.send(playerId, payload).then(message => Game.channels[index] = message.channelId);
        Game.guilds[index] = null;
    }
}