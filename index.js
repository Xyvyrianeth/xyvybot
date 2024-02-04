"use strict";

import { Client as discordClient } from "discord.js";
import dotenv from "dotenv";
import PG from "pg";

dotenv.config();

export const Client = new discordClient({ intents: [1, 2, 512, 4096, 32768] });
export const dataBase = new PG.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, keepAlive: true });

import Package from "./package.json" assert { type: "json" };
export const version = Package.version;
export const bannedUsers = [];
export const gameCount = 10;
export const COMPONENT = { ACTION_ROW: 1, BUTTON: 2, DROP_MENU: 3 };
export const BUTTON_STYLE = { BLUE: 1, GREY: 2, GREEN: 3, RED: 4, LINK: 5 };

import * as clientOn from "./index/clientOn.js";
import * as dataBaseOn from "./index/dataBaseOn.js";
Client.once('ready', clientOn.onReady);
Client.on('messageCreate', clientOn.messageCreate);
Client.on('interactionCreate', clientOn.interactionCreate);
Client.on('guildCreate', clientOn.guildCreate);
Client.on('channelDelete', channel => clientOn.channelDelete(channel, "channel"));
Client.on('threadDelete', channel => clientOn.channelDelete(channel, "channel"));
Client.on('guildDelete', guild => clientOn.channelDelete(guild, "guild"));
dataBase.on('error', dataBaseOn.error);

await Client.login(process.env[process.argv[2]]);
await dataBase.connect();