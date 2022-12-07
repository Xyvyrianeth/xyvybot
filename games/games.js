import { Collection } from "discord.js";
import { client } from "../Xyvy.js";
export const Games = new Collection();

setInterval(function() {
	Games.forEach(Game => {
		Game.timer--;
		if (Game.timer <= 0)
		{
			if (Game.channels[0] == Game.channels[1])
			{
				const Channel = client.channels.cache.get(Game.channels[0]);
				const channelPerms = Channel.permissionsFor(client.user.id);
				if (!Channel || ([10, 11, 12].includes(Channel.type) && !channelPerms.has([1n << 10n, 1n << 38n])) || !channelPerms.has([1n << 10n, 1n << 11n]))
				{
					for (let index in Game.players)
					{
						const user = client.users.cache.get(Game.players[index]);
						const message = Game.players[index] == Game.player ? `It looks like you have run out of time against <@${Game.players[[1, 0][index]]}>, so the game has ended.` : `It looks like <@${Game.player}> has run out of time, so the game has ended.`;
						user.send(message);
					}
				}
				else
				{
					const message = Game.started ? `Whoops, it looks like <@${Game.player}> has run out of time, so this game is over!` : `It appears nobody wants to play right now, <@${Game.players[0]}>.`;
					Channel.send(message);
				}
			}
			else
			{
				for (let index in Game.channels)
				{
					const Channel = client.channels.cache.get(Game.channels[index]);
					const channelPerms = Channel.permissionsFor(client.user.id);
					if (!Channel || ([10, 11, 12].includes(Channel.type) && !channelPerms.has([1n << 10n, 1n << 38n])) || !channelPerms.has([1n << 10n, 1n << 11n]))
					{
						const user = client.users.cache.get(Game.players[index]);
						const message = Game.players[index] == Game.player ? `It looks like you have run out of time against <@${Game.players[[1, 0][index]]}>, so the game has ended.` : `It looks like <@${Game.player}> has run out of time, so the game has ended.`;
						user.send(message);
					}
					else
					{
						const message = Game.started ? `Whoops, it looks like <@${Game.player}> has run out of time, so this game is over!` : `It appears nobody wants to play right now, <@${Game.players[0]}>.`;
						Channel.send(message);
					}
				}
			}
			Games.delete(Game.id);
		}
	});
}, 1000);