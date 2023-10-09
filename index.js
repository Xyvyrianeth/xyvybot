import { Client } from "discord.js";
import dotenv from "dotenv";
import PG from "pg";

dotenv.config();

export const Xyvybot = new Client({ intents: [1, 2, 512, 4096, 32768] });
export const dataBase = new PG.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, keepAlive: true });

import Package from "./package.json" assert { type: "json" };
export const version = Package.version;
export const bannedUsers = [];
export const gameCount = 10;
export const BUTTON_STYLE = { BLUE: 1, GREY: 2, GREEN: 3, RED: 4, LINK: 5 };
export const COMPONENT_TYPE = { ACTION_ROW: 1, BUTTON: 2, DROP_MENU: 3 };

import * as clientOn from "./index/clientOn.js";
import * as dataBaseOn from "./index/dataBaseOn.js";
Xyvybot.once('ready', clientOn.onReady);
Xyvybot.on('messageCreate', clientOn.messageCreate);
Xyvybot.on('interactionCreate', clientOn.interactionCreate);
Xyvybot.on('guildCreate', clientOn.guildCreate);
Xyvybot.on('channelDelete', channel => clientOn.channelDelete(channel, "channel"));
Xyvybot.on('threadDelete', channel => clientOn.channelDelete(channel, "channel"));
Xyvybot.on('guildDelete', guild => clientOn.channelDelete(guild, "guild"));
dataBase.on('error', dataBaseOn.error);

await Xyvybot.login(process.env.TOKEN);
// await Xyvybot.login(process.env.REAL_TOKEN);
await dataBase.connect();