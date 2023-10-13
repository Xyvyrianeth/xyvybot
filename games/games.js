import { Collection } from "discord.js";
import { Client } from "../index.js";
export const Games = new Collection();

const interval = () => {
    Games.forEach(async (Game, id) => {
        if (--Game.timer > 0)
        {
            return;
        }

        if (Game.channels[0] == Game.channels[1])
        {
            const Channel = await Client.channels.fetch(Game.channels[0]);
            const channelPerms = Channel.permissionsFor(Client.user.id);
            const hasPerms1 = await channelPerms.has([1n << 10n, 1n << 38n]);
            const hasPerms2 = await channelPerms.has([1n << 10n, 1n << 11n]);
            if (!Channel || ([10, 11, 12].includes(Channel.type) && !hasPerms1) || !hasPerms2)
            {
                for (let index in Game.players)
                {
                    const user = await Client.users.fetch(Game.players[index]);
                    const message = Game.players[index] == Game.player ? `It looks like you have run out of time against <@${Game.players[[1, 0][index]]}>, so the game has ended.` : `It looks like <@${Game.player}> has run out of time, so the game has ended.`;
                    await user.send(message);
                }
            }
            else
            {
                const message = Game.started ? `Whoops, it looks like <@${Game.player}> has run out of time, so this game is over!` : `It appears nobody wants to play right now, <@${Game.players[0]}>.`;
                await Channel.send(message);
            }
        }
        else
        {
            for (let index in Game.channels)
            {
                const Channel = await Client.channels.fetch(Game.channels[index]);
                const channelPerms = await Channel.permissionsFor(Client.user.id);
                const hasPerms1 = await channelPerms.has([1n << 10n, 1n << 38n]);
                const hasPerms2 = await channelPerms.has([1n << 10n, 1n << 11n]);
                if (!Channel || ([10, 11, 12].includes(Channel.type) && !hasPerms1) || !hasPerms2)
                {
                    const user = await Client.users.fetch(Game.players[index]);
                    const message = Game.players[index] == Game.player ? `It looks like you have run out of time against <@${Game.players[[1, 0][index]]}>, so the game has ended.` : `It looks like <@${Game.player}> has run out of time, so the game has ended.`;
                    await user.send(message);
                }
                else
                {
                    const message = Game.started ? `Whoops, it looks like <@${Game.player}> has run out of time, so this game is over!` : `It appears nobody wants to play right now, <@${Game.players[0]}>.`;
                    await Channel.send(message);
                }
            }
        }
        Games.delete(id);
    });
}

setInterval(interval, 1000);