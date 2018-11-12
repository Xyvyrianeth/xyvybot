var version = "2.30.1.6";

const Discord = require("discord.js");
const Canvas = require("canvas");
const Jimp = require("jimp");
const GIFEncoder = require("gifencoder");
const streamBuffers = require("stream-buffers");
const ytdl = require("ytdl-core");

var { client,config } = require("/app/Xyvy.js");
var Profile = require("/app/stuffs/profile.js");
var { Color } = require("/app/stuffs/color.js");
var titles = require("/app/stuffs/titles.json");
var images = require("/app/stuffs/images.json");
var { table } = require("/app/stuffs/table.js");

var admins = "357700219825160194".split(' ');
var RE = {
    ping: /^<@[0-9]{1,}>$/,
    id1: /[0-9]{1,}/,
    id2: /^[0-9]{1,}$/,
    color: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
};

const pg = require("pg");
var db = new pg.Client(config.DATABASE_URL);
db.connect().then(() => console.log("Connected to Database!")).catch(() => console.error("Could not connect to Database."));
   
const jishoApi = require("unofficial-jisho-api");
const jisho = new jishoApi();
   
const nekos = require("nekos.life");
const Nekos = new nekos();

/* Does not work
const paladinsAPI = require("paladins-api");
const paladins = new paladinsAPI(config.HIREZ_API[0], config.HIREZ_API[1]);
var palID;
paladins.connect("PC", (err, res) => {
    if (err) return console.log(err);
    palID = res;
});
*/

var bugTimers = {};
var bugTimer = setInterval(function() {
    for (let i in bugTimers) {
        bugTimers[i] -= 1;
        if (bugTimers[i] == 0) delete bugTimers[i];
    }
}, 10);

var requestTimers = {};
var requestTimer = setInterval(function() {
    for (let i in requestTimers) {
        requestTimers[i] -= 1;
        if (requestTimers[i] == 0) delete requestTimers[i];
    }
}, 10);
var games = {
    connect4: require("/app/games/connect4.js"),
    squares: require("/app/games/squares.js"),
    othello: require("/app/games/othello.js"),
    gomoku: require("/app/games/gomoku.js"),

    channels: require("/app/games/channels.js").channels
}

function botError(message, err) {
    message.channel.send("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~```");
    return client.guilds.get("399327996076621825").channels.get("467902250128506880").send(
        `\`\`\`Server: ${message.channel.guild.name} (${message.channel.guild.id})\n` +
        `Channel: ${message.channel.name} (${message.channel.id})\`\`\`\n` +
        `\`\`\`User errored on:\`\`\`<@${message.author.id}>\n\n` +
        `\`\`\`\n` +
        `Message sent:\`\`\`\`\`\`\n` +
        `${message.content.replace(/`/g, "\\\`")}\`\`\`\n` +
        `\`\`\`\n` +
        `${err.join("\n")}\`\`\``
    );
}
function sqlError(message, err, res) {
    message.channel.send("```\nWhoops! It appears there was some sort of error with the database! Not sure if it's my fault or not, but Xyvy will look into it!```");
    let query = res.replace(/`/g, "\\`").length > 1500 ? "Check console" : res.replace(/`/g, "\\`");
    if (query == "Check console") console.log(res);
    return client.guilds.get("399327996076621825").channels.get("478371618620571648").send(
        `\`\`\`Server: ${message.channel.guild.name} (${message.channel.guild.id})\n` +
        `Channel: ${message.channel.name} (${message.channel.id})\`\`\`\n` +
        `\`\`\`\n` +
        `Query:\`\`\`\`\`\`sql\n` +
        `${query}\`\`\`\n` +
        `\`\`\`\n` +
        `${err}\`\`\``
    );
}

function command(message) {
  
    let a = message.channel.type == "dm" ? "user" : "guild";
    let args = message.content.split(/ {1,}/);
    let cmd = args.shift().replace("x!", '').toLowerCase();
    let input = args.join(' ');
    let sendChat = function(content, options) {
        if (typeof content == "string") content = content.replace(/\$user\$/g, `<@${message.author.id}>`);
        if (options == undefined) message.channel.send(content);
        else
        message.channel.send(content, options);
    }
   
    for (let i in aliases[a])
        if (aliases[a][i].includes(cmd))
            try {
                return commands[i](cmd, args, input, message, sendChat);
            } catch (error) {
                let errs = [];
                for (let i = 0; i < error.stack.split('\n').length; i++) {
                    if (error.stack.split('\n')[i].includes("at emitOne")) break
                    else
                    errs.push(error.stack.split('\n')[i]);
                }
                botError(message, errs);
            }
   
}
   
function other(message) {
    let sendChat = function(content, options) {
        if (typeof content == "string") content = content.replace(/\$user\$/g, `<@${message.author.id}>`);
        if (options == undefined) message.channel.send(content);
        else
        message.channel.send(content, options);
    }
    if (message.channel.type == "dm" || message.author.bot) return;

    if (games.channels[message.channel.id] && games.channels[message.channel.id].started && message.author.id == games.channels[message.channel.id].player && games.channels[message.channel.id].RE.test(message.content)) {
        setTimeout(function() {
            message.delete();
        }, 5000);
        try {
            return sendChat(games[games.channels[message.channel.id].game].takeTurn(message.channel, message.content));
        } catch (error) {
            delete games.channels[message.channel.id];
            sendChat("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough~```");
            let errs = [];
            for (let i = 0; i < error.stack.split('\n').length; i++) {
                if (error.stack.split('\n')[i].includes("at emitOne")) break
                else
                errs.push(error.stack.split('\n')[i]);
            }
            return client.guilds.get("399327996076621825").channels.get("467902250128506880").send(botError(message, errs));
        }
    }
}
   
function bot(message) {
    if (message.attachments.array().length != 0) {
        let img = message.attachments.first().filename;
        if (/^(connect4|squares|othello|gomoku)_[0-2]_[0-9]{1,}(|vs[0-9]{1,})\.png$/.test(img)) {
            if (!games.channels.hasOwnProperty(message.channel.id)) return client.guilds.get("399327996076621825").channels.get("467902250128506880").send("Bot is sending images when it shouldn't @`function bot`.");

            let game = games.channels[message.channel.id];
            let end = img.match(/_[0-2]_/)[0].substring(1, 2);
            if (end === '0') return game.lastDisplay = message;

            let result = false;
            if (end === '1') {
                result = {
                    winner: game.players[game.winner],
                    loser: game.players[game.winner == 0 ? 1 : 0],
                    game: JSON.stringify(["othello", "squares", "gomoku", "3dttt", "connect4"].indexOf(game.game) + 1),
                    casual: game.casual,
                    score: game.score
                };
            }
            delete games.channels[message.channel.id];

            if (result) db.query(`SELECT * FROM profiles WHERE id = '${result.winner}' OR id = '${result.loser}'`, function(err, res) {
                if (err) sqlError(message, err, `SELECT * FROM profiles WHERE id = '${result.winner}' OR id = '${result.loser}'`);
                if (!result.casual) {
                    let wins;
                    let lose;
                    if (res.rows.length == 0) {
                        wins = newUser(result.winner);
                        lose = newUser(result.loser);
                    }
                    else
                    if (res.rows.length == 2) {
                        wins = res.rows[0].id == result.winner ? res.rows[0] : res.rows[1];
                        lose = res.rows[0].id == result.loser ? res.rows[0] : res.rows[1];
                    }
                    else
                    if (res.rows[0].id == result.winner) {
                        lose = newUser(result.loser);
                        wins = res.rows[0];
                    }
                    else
                    if (res.rows[0].id == result.loser) {
                        lose = res.rows[0];
                        wins = newUser(result.winner);
                    }
                    let booty = Math.ceil(lose["elo" + result.game] / 10);
                    let query = `UPDATE profiles
                        SET elo${result.game} = ${wins["elo" + result.game] + booty}, win${result.game} = ${wins["win" + result.game] + 1}
                        WHERE id = '${wins.id}';
                        UPDATE profiles
                        SET elo${result.game} = ${lose["elo" + result.game] - booty}, los${result.game} = ${lose["los" + result.game] + 1}
                        WHERE id = '${lose.id}';`
                    return db.query(query, function(err) {
                        if (err) sqlError(message, err, query);
                    });
                }
                
            }); 
        }
    }
    else
    {
        if (/<@[0-9]{1,}> is now requesting a new game of (Connect 4|Squares|Othello|Gomoku), say `x![3a-z]{1,} start` to play against them!/.test(message.content)) return games.channels[message.channel.id].lastDisplay = message;
        if ([
            "Column is full, please pick another.",
            "There's already a stone there, pick another spot!",
            "You cannot place there."
        ].includes(message.content)) 
            return setTimeout(function() {
                message.delete();
            }, 10000);
    }
}
   
function newUser(id) {
    let image = backgrounds.ids.random();
    let query = `INSERT INTO profiles (
            id,       color,   title,      titles,             background,  backgrounds,         lorr,     money,  elo1,  elo2,  elo3,  elo4,  elo5,  elo6,  elo7,  win1,  win2,  win3,  win4,  win5,  win6,  win7,  los1,  los2,  los3,  los4,  los5,  los6,  los7
        ) VALUES (
            '${id}',  '#aaa',  'default',  ARRAY ['default'],  '${image}',  ARRAY ['${image}'],  'right',  0,      1000,  1000,  1000,  1000,  1000,  1000,  1000,  0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0
        )`;
    db.query(query, function(err) {
        if (err) return sqlError(message, err, query);
    });
    return { id: id, color: "#aaa", title: "default", titles: ["default"], background: image, backgrounds: [image], lorr: "right", money: 0, elo1: 1000, elo2: 1000, elo3: 1000, elo4: 1000, elo5: 1000, elo6: 1000, elo7: 1000, win1: 0, win2: 0, win3: 0, win4: 0, win5: 0, win6: 0, win7: 0, los1: 0, los2: 0, los3: 0, los4: 0, los5: 0, los6: 0, los7: 0 };
}

var aliases = {
    guild: {
        // Games
        "games": ["games"],
        "othello": ["othello"],
        "squares": ["squares"],
        "gomoku": ["gomoku", "gobang", "renju"],
        "ttt3d": ["3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe"],
        "connect4": ["connectfour", "connect4", "cfour", "c4"],
        "pente": ["pente"],
        "ninemen": ["ninemen", "morris", "ninemensmorris", "ninemenmorris"],
        "profile": ["profile", "scorecard", "prof"],

        // Small Games
        "hangman": ["hangman", "hm"],
        "math": ["math", "quickmath", "quickmaffs", "maffs"],
        "iq": ["iq", "fakeiqtest", "fakeiqquiz", "fakeiq"],
        "sequence": ["sequence", "pattern"],
        "shuffle": ["shuffle", "scramble"],
       
        // Utility
        "about": ["about", "info", "bot"],
        "help": ["help", "hlep", "je;[", "geko", "helo", "halp", "hlp", "hekp", "he;p", "commands"],
        "avatar": ["avatar", "pfp"],
        "aliases": ["aliases"],
        "guild": ["guild", "server"],
        "kick": ["kick"],
        "ban": ["ban"],
       
        // Miscellaneous
        "anime": ["anime"],
        "manga": ["manga"],
        "jisho": ["jisho", "kanji", "japanese", "jp"],
        "jshelp": ["jshelp", "javascript"],
        "nekos": ["nekos", "neko", "nya", "catgirl", "catgirls", "nekomimi"],
        "cats": ["cats", "cat", "meow"],
        "calc": ["calc", "calculate", "domath"],
        "graph": ["graph"],
       
        // NSFW
        "nsfw": ["nsfw", "hentai", "lewd", "porn"],
       
        // Admin-only
        "js": ["js"],
        "pg": ["pg"],
    },
    user: {
        // Games
        "profile": ["profile", "scorecard", "prof"],
    
        // Small Games
       
        // Utility
        "about": ["about", "info", "bot"],
        "help": ["help", "hlep", "je;[", "geko", "helo", "halp", "hlp", "hekp", "he;p", "commands"],
        "avatar": ["avatar", "pfp"],
        "aliases": ["aliases"],
        "bug": ["reportbug", "bugreport", "bug", "report"],
        "request": ["request", "suggest", "suggestion", "requestion"],
       
        // Miscellaneous
        "anime": ["anime"],
        "manga": ["manga"],
        "jisho": ["jisho", "kanji", "japanese", "jp"],
        "jshelp": ["jshelp", "javascript"],
        "nekos": ["nekos", "neko", "nya", "catgirl", "catgirls", "nekomimi"],
        "cats": ["cats", "cat", "meow"],
        "calc": ["calc"],
        "graph": ["graph"],
       
        // NSFW
        "nsfw": ["nsfw", "hentai", "lewd", "porn"],
       
        // Admin-only
        "js": ["js"],
        "pg": ["pg"],
    }
}

var commands = {
   
    // Games
    "games": function(cmd, args, input, message, sendChat) {
        if (!args[0]) {
            let embed = new Discord.RichEmbed();
            embed.setDescription("Input tree for command x!games\n`x!games [input]`");
            embed.addField("leaderboard", "View the players with the 10 highest ELOs for every game or the players with the 10 highest combined ELOs.\n`x!games leaderboard [game]`\nLeave `[game]` blank for general top 10 players.");
            embed.addField("stats", "View either your stats or another player's stats.");
            embed.addField("info", "A detailed information about how the ELO system works and the entire ranking system in general.");
            embed.addField("games", "A list of all the games that are a part of the ranking system and a few details about them.");
            embed.setColor(new Color().random());
            sendChat(embed);
        }
        if (["leaderboard", "top"].includes(args[0])) {
            let elos = false;
            if (!args[1])                                 elos = "elo1 + elo2 + elo3 + elo4 + elo5 + elo6 + elo7";
            if (aliases.guild.othello.includes(args[1]))  elos = "elo1";
            if (aliases.guild.squares.includes(args[1]))  elos = "elo2";
            if (aliases.guild.gomoku.includes(args[1]))   elos = "elo3";
            if (aliases.guild.ttt3d.includes(args[1]))    elos = "elo4";
            if (aliases.guild.connect4.includes(args[1])) elos = "elo5";
            if (aliases.guild.pente.includes(args[1]))    elos = "elo6";
            if (aliases.guild.ninemen.includes(args[1]))  elos = "elo7";
            if (!elos) return sendChat("Unknown game.");
            
            let wins = elos.replace(/elo/g, "win");
            let loss = elos.replace(/elo/g, "los");
            let query = [
                `SELECT`,
                `    id,`,
                `    elos AS elo,`,
                `    wins AS win,`,
                `    loss AS los,`,
                `    ((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) AS ci_lower_bound`,
                `FROM profiles`,
                `WHERE wins + loss > 0`,
                `ORDER BY`,
                `    elo DESC,`,
                `    ci_lower_bound DESC,`,
                `    id ASC`,
                `LIMIT 10;`,
                ``,
                `SELECT`,
                `    id,`,
                `    elos AS elo,`,
                `    wins AS win,`,
                `    loss AS los,`,
                `    ((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) AS ci_lower_bound`,
                `FROM profiles`,
                `WHERE`,
                `    id = '${message.author.id}'`,
                `    AND`,
                `    wins + loss > 0;`,
                ``,
                `SELECT CAST(COUNT(id) + 1 AS int) AS place`,
                `FROM profiles`,
                `WHERE`,
                `    0 < ANY (SELECT wins + loss FROM profiles WHERE id = '${message.author.id}')`,
                `    AND`,
                `    id != '${message.author.id}'`,
                `    AND`,
                `    wins + loss > 0`,
                `    AND`,
                `    elos >= ANY (SELECT elos FROM profiles WHERE id = '${message.author.id}')`,
                `    AND`,
                `    ((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) > ANY (SELECT ((wins + 1.9208) / (wins + loss) - 1.96 * SQRT((trunc((wins) * (loss), 1) / (wins + loss)) + 0.9604) / (wins + loss)) / (1 + 3.8416 / (wins + loss)) FROM profiles WHERE id = '${message.author.id}');`
            ].join('\n').replace(/elos/g, elos).replace(/wins/g, wins).replace(/loss/g, loss);
            return db.query(query, function(err, res) {
                if (err) return sqlError(message, err, query);
                if (!res || res.length !== 3) return sqlError(message, "No res", query);
                if (res[0].rows.length > 0) {
                    let top = [];
                    for (let i = 0; i < res[0].rows.length; i++) top.push(res[0].rows[i]);

                    let game;
                    if (!args[1]) game = "All Games"
                    else
                    game = ["Othello", "Squares", "Gomoku", "3D Tic Tac Toe", "Connect Four", "Pente", "Nine Men's Morris"][elos[3] - 1];

                    let users = [];
                    for (let i = 0; i < top.length; i++) {
                        if (i == 0) top[i].place = i + 1;
                        else
                        if (top[i].elo == top[i - 1].elo && top[i].ci_lower_bound == top[i - 1].ci_lower_bound) top[i].place = top[i - 1].place;
                        else
                        top[i].place = i + 1;

                        let place = top[i].place;
                        let id = top[i].id;
                        let elo = top[i].elo;
                        let win = top[i].win;
                        let los = top[i].los;
                        let w_l = win + los > 0 ? (win / (win + los) * 100).toFixed(2) + '%' : "\u034f \u034f N/A \u034f \u034f";

                        users.push('`' + '\u034f '.repeat(5 - String(place).length) + place + ')` | `' + '\u034f '.repeat(5 - String(elo).length) + elo + "` | `" + '\u034f '.repeat(3 - String(win).length) + win + "` / `" + '\u034f '.repeat(3 - String(los).length) + los + "` (`" + '\u034f '.repeat(w_l !== "\u034f \u034f N/A \u034f \u034f" ? 7 - w_l.length : 0) + w_l + "`) | <@" + id + ">");
                    }
                    if (res[1].rows.length != 0) {
                        users.push('');
                        users.push("Your rank:")
                        let user = res[1].rows[0];
                        let place = res[2].rows[0].place;
                        let id = user.id;
                        let elo = user.elo;
                        let win = user.win;
                        let los = user.los;
                        let w_l = win + los > 0 ? (win / (win + los) * 100).toFixed(2) + '%' : "\u034f \u034f N/A \u034f \u034f";

                        users.push('`' + '\u034f '.repeat(5 - String(place).length) + place + ')` | `' + '\u034f '.repeat(5 - String(elo).length) + elo + "` | `" + '\u034f '.repeat(3 - String(win).length) + win + "` / `" + '\u034f '.repeat(3 - String(los).length) + los + "` (`" + '\u034f '.repeat(w_l !== "\u034f \u034f N/A \u034f \u034f" ? 7 - w_l.length : 0) + w_l + "`) | <@" + id + ">");
                    }
                    let embed = new Discord.RichEmbed();
                    embed.setTitle("Leaderboard for " + game);
                    embed.setDescription("__`\u034f RANK \u034f` | `\u034f ELO \u034f` | `\u034f W \u034f` / `\u034f L \u034f` (`WINRATE`) | <@USER>__\n" + users.join('\n'));
                    embed.setColor(new Color().random());
                    sendChat(embed);
                }
                else
                {
                    sendChat("Nobody has played this game, yet, so I can't yet give a scoreboard.");
                }
            });
        }
        if (["stats", "statistics"].includes(args[0])) {
            let id = message.author.id;
            let gm = "all";
            let games = [].concat(aliases.guild.othello, aliases.guild.squares, aliases.guild.gomoku, aliases.guild.ttt3d, aliases.guild.connect4, aliases.guild.pente, aliases.guild.ninemen);
            if (!args[1]) {}
            else
            if (args[1] && !args[2]) {
                if (RegExp.id1.test(args[1])) id = args[1];
                else
                if (games.includes(args[1])) gm = args[1];
                else
                return sendChat("I can't do that.");
            }
            else
            if (args[2]) {
                if (RegExp.id1.test(args[1]) && games.includes(args[2])) {
                    id = args[1];
                    gm = args[2]
                }
                else
                if (RegExp.id1.test(args[2]) && games.includes(args[1])) {
                    id = args[2];
                    gm = args[1];
                }
                else
                return sendChat("I can't do that.");
            }
            else
            return sendChat("I can't do that.");

            let Gm = false;
            if (gm == "all") Gm = "all";
            else
            for (let i of aliases.guild) if (aliases.guild[i].includes(gm)) Gm = Number(["othello", "squares", "gomoku", "ttt3d", "connect4", "pente", "ninemen"].indexOf(i) + 1);
            if (Gm) {
                let query = `SELECT * FROM profiles WHERE id = '${id}'; `;
                return db.query(query, function(err, res) {
                    if (err) sqlError(message, err, query);
                    let user;
                    if (res.rows.length == 0) user = newUser(message.author.id);
                    else
                    user = res.rows[0];

                    let embed = new Discord.RichEmbed();
                    embed.setTitle("User Statistics for " + (Gm == "all" ? "all games" : ["Othello", "Squares", "Gomoku", "3D Tic Tac Toe", "Connect Four", "Pente", "Nine Men's Morris"][Gm - 1]));
                    if (Gm == "all") {
                        let ok = [];
                        for (let i = 0; i < 7; i++) {
                            let game = ["Othello", "Squares", "Gomoku", "3D Tic Tac Toe", "Connect Four", "Pente", "Nine Men's Morris"][Gm - 1];
                            let elo = user["elo" + (i + 1)];
                            let win = user["win" + (i + 1)];
                            let los = user["los" + (i + 1)];
                            let w_l = win + los > 0 ? (win / (win + los) * 100).toFixed(2) + "%" : "\u034f \u034f N/A \u034f \u034f";
                            ok.push('`' + game + ' \u034f'.repeat(17 - game.length) + '` | `' + '\u034f '.repeat(5 - String(elo).length) + elo + "` | `" + '\u034f '.repeat(3 - String(win).length) + win + "` / `" + '\u034f '.repeat(3 - String(los).length) + los + "` (`" + '\u034f '.repeat(w_l !== "\u034f \u034f N/A \u034f \u034f" ? 7 - w_l.length : 0) + w_l + "`)");
                        }
                        embed.setDescription("__`\u034f \u034f \u034f \u034f Game Name \u034f \u034f \u034f \u034f`__ | __`\u034f ELO \u034f`__ | __`\u034f W \u034f`__ / __`\u034f L \u034f`__ (__`\u034f WIN % \u034f`__)\n" + ok.join("\n"));
                    }
                    else
                    embed.setDescription("**__Game__: " + ["Othello", "Squares", "Gomoku", "3D Tic Tac Toe", "Connect Four", "Pente", "Nine Men's Morris"][Gm - 1] + "\n__ELO__: " + user["elo" + Gm] + "\n__W/L(%)__:" + user["win" + Gm] + " / " + user["los" + Gm] + " (" + (user["win" + Gm] + user["los" + Gm] > 0 ? user["win" + Gm] / (user["win" + Gm] + user["los" + Gm]) : "N/A") + ")**");

                    embed.setColor(new Color().random());
                    return sendChat(embed);
                });
            }
            else
            {
                botError(message, "`Gm` was not set to something despite being logically able to reach that point. This error should not ever appear for any reason other than JavaScript itself has broke.");
                return sendChat("Unknown error. Seriously, somebody help me, this should not be JavaScriptily possible.");
            }
        }
        else
        if (["info", "about"].includes(args[0])) {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Information");
            embed.setDescription("I, Xyvyrianeth (I'm speaking through this bot), am a big fan of [abstract strategy games](https://en.wikipedia.org/wiki/Abstract_strategy_game). I like them so much I tried to create my own competetive social network in Discord that revolves around a select few of these types of games.");
            embed.addField("\u034f", "Like every network of competition, there needs to be a way to evaluate who's better than who. Most PvP games, like League of Legends, have a score called attached to each player called ELO. ELO is most likely a number of some sort, and the method in which players can gain or lose ELO differs for each game. In some games, you gain ELO exclusively by winning and lose it exclusively from losing. In other games, ELO gained or lossed is based on the player's personal evaluation in a given match, and winning or losing only somewhat or doesn't affect it.");
            embed.addField("\u034f", "For my bot, I used a system I heard from a friend (I don't know if he made it up or heard it from somewhere else or not, but credit goes to you, WholeWheatThins). Basically, everyone starts out with an ELO of 1000. After a game ends, the loser loses 10% of their ELO (rounded up) and it goes to the winner.\nIf the loser of a game had 1000 ELO, they lose 100, which goes to the winner.\nIf the loser had 1500 ELO, they lose 150.\nIf 5 ELO, they lose 1 (10% of 5 rounded up is 1. You stop losing ELO from losing when you have no ELO left to lose).\nWith this system, you better benefit winning against people who are supposedly better than you are. You don't gain much from beating people who aren't very good, and that applies to both ELO and your own skill of the game you suck at because you only play against other people who suck, so git gud.");
            embed.addField("\u034f", "ELOs can be sorted either by game or totally, which is average ELO for all games (some people might only care about Othello). Everyone has their own ELO, but those numbers can sometimes end up being the same for multiple users, so instead of sorting by alphabetical order next, we'll use the [Lower bound of Wilson score confidence interval for a Bernoulli parameter](https://www.evanmiller.org/how-not-to-sort-by-average-rating.html): A user with 500 wins and 500 losses will score above someone with 5 wins and 1 loss, and the user with 5 wins and 1 loss will score above someone with 500 wins and 1000 losses. It's the perfect balance between net positive results (`wins - losses`) and average results (`wins / (wins + losses)`).\nIf two users have the same ELO *and* the same number of wins and losses, *then* we'll sort them by ID, I guess.");
            embed.addField("\u034f", "For now, these scores and such won't mean anything other than a way to sort out the best. Until I think enough people are playing games on my bot, I won't be forming any sort of tournaments, and ELOs will never be reset. Get more people using this bot and I might change that.");
            embed.setColor(new Color().random());
            return sendChat(embed);
        }
        else
        if (["games"].includes(args[0])) {
            let embed = new Discord.RichEmbed();
            embed.setDescription("I have 4 games currently and 3 planned.\n\n**Games**: Othello, Squares, Gomoku, Connect Four\n**Planned**: 3D Tic Tac Toe, Pente, Nine Men's Morris\n\nI chose these games ~~mostly because they're very simple games with very simple rules and mechanics and they're easy to calculate who won and who lost and~~ because they're easy for people to learn, easy for people to get into, easy for people to get good at. I'm never going to add Chess or Go ~~because they're both complicated in terms of mechanics and win/lose/end-game criteria and~~ because they're not easy to learn, not easy to play, not easy to become skilled at. Plus, they take ***foreverrrrrr*** to play.\n\nBefore I decide the bot is \"complete,\" I want at least 10 games. However, deciding what games I want to add to the bot is not gonna be easy, so toss me some suggestions using x!request (make sure it's an [abstract strategy game](https://en.wikipedia.org/wiki/Abstract_strategy_game) before you suggest it my way).");
            embed.setColor(new Color().random());
            sendChat(embed);
        }
    },

    "connect4": function(cmd, args, input, message, sendChat) {
        if (message.channel.type == "dm") return sendChat("This command is not available through DMs!");
        if (!input) return sendChat(`__**Connect Four**__\nTo start a game, type \`x!${cmd} start\`!`);
        if (["start"].includes(args[0])) {
            message.delete();
            if (!games.channels.hasOwnProperty(message.channel.id)) {
                if (!args[1]) return sendChat(games.connect4.newGame(message.channel, message.author.id, cmd, false));
                if (["causal", "fun"].includes(args[1])) return sendChat(games.connect4.newGame(message.channel, message.author.id, cmd, true));
            }
            if (!games.channels[message.channel.id].started) {
                if (message.author.id != games.channels[message.channel.id].players[0] || message.author.id == "357700219825160194") {
                    k = games.connect4.startGame(message.channel, message.author.id);
                    return sendChat(k[0], k[1]);
                }
                else
                return sendChat("You cannot play yourself!");
            }
        }
        else
        if (["board", "showboard"].includes(input)) {
            if (!games.channels.hasOwnProperty(message.channel.id)) return sendChat("There is no active Connect Four game in this channel, $user$!");
            if (!games.channels[message.channel.id].started) return sendChat("The game has not yet started, $user$!");
            return sendChat(new Discord.Attachment(games.connect4.drawBoard(games.channels[message.channel.id], 0)))
        }
        else
        if (["quit", "forfeit", "leave"].includes(input)) {
            if (!games.channels.hasOwnProperty(message.channel.id)) return sendChat("There is not a game in this channel for you to quit!");
            if (message.author.id != games.channels[message.channel.id].players[0] && message.author.id != games.channels[message.channel.id].players[1]) return sendChat("You are not a participant of this game, $user$!");
            if (!games.channels[message.channel.id].started) sendChat("$user$ has cancelled the pending game.");
            else
            sendChat("$user$ has forfeit the game.");
            delete games.channels[message.channel.id];
        }
        else
        if (["rules", "howtoplay"].includes(args[0])) {
            new Discord.RichEmbed();
            embed.setDescription("If you don't know how to play this game, you had a shitty childhood.");
            embed.setColor(new Color().random());
            return sendChat(embed);
        }
    },
   
    "squares": function(cmd, args, input, message, sendChat) {
        if (message.channel.type == "dm") return sendChat("This command is not available through DMs!");
        if (!input) return sendChat(`__**Squares**__\nTo start a game, type \`x!${cmd} start\`!`);
        if (["start"].includes(args[0])) {
            message.delete();
            if (!games.channels.hasOwnProperty(message.channel.id)) {
                if (!args[1]) return sendChat(games.squares.newGame(message.channel, message.author.id, cmd, false));
                if (["causal", "fun"].includes(args[1])) return sendChat(games.squares.newGame(message.channel, message.author.id, cmd, true));
            }
            if (!games.channels[message.channel.id].started) {
                if (message.author.id != games.channels[message.channel.id].players[0] || message.author.id == "357700219825160194") {
                    k = games.squares.startGame(message.channel, message.author.id);
                    return sendChat(k[0], k[1]);
                }
                else
                return sendChat("You cannot play yourself!");
            }
        }
        else
        if (["board", "showboard"].includes(input)) {
            if (!games.channels.hasOwnProperty(message.channel.id)) return sendChat("There is no active Squares game in this channel, $user$!");
            if (!games.channels[message.channel.id].started) return sendChat("The game has not yet started, $user$!");
            let game = games.channels[message.channel.id];
            return sendChat(new Discord.Attachment(game.buffer, `squares_0_${game.players[0]}vs${game.players[1]}.png`));
        }
        else
        if (["quit", "forfeit", "leave"].includes(input)) {
            if (!games.channels.hasOwnProperty(message.channel.id)) return sendChat("There is not a game in this channel for you to quit!");
            if (message.author.id != games.channels[message.channel.id].players[0] && message.author.id != games.channels[message.channel.id].players[1]) return sendChat("You are not a participant of this game, $user$!");
            if (!games.channels[message.channel.id].started) sendChat("$user$ has cancelled the pending game.");
            else
            sendChat("$user$ has forfeit the game.");
            delete games.channels[message.channel.id];
        }
        else
        if (["rules", "howtoplay"].includes(args[0])) {
            new Discord.RichEmbed();
            embed.setDescription("This game was created by Xyvy himself because he was bored and didn't want to work on Gomoku win logic one night. It's played almost exactly like Gomoku, except for the objective of the game and the limitless board size. The board size is always 10x10, and the object of the game is to have created more squares than your opponent before the end. You make a square by placing 4 of your stones in a square pattern. Stones can be a part of multiple squares, and squares can range in size from 2x2 to 10x10 (if you put a stone in all 4 corners of the map, that's a point to you!).\n\nTaking turns is the same as in Gomoku: 2 stones per turn, but whoever goes first only places 1 stone on their very first turn. This eliminates \"first player advantage\" where player 1 is the only one that can have more stones on the board than their opponent.\n\nThe game ends when there are no more empty spaces on the board. After that, the squares are counted for each player and the player with more squares is declared the winner.");
            embed.setColor(new Color().random());
            return sendChat(embed);
        }
    },
   
    "othello": function(cmd, args, input, message, sendChat) {
        if (message.channel.type == "dm") return sendChat("This command is not available through DMs!");
        if (!input) return sendChat(`__**Othello**__\nTo start a game, type \`x!${cmd} start\`!`);
        if (["start"].includes(args[0])) {
            message.delete();
            if (!games.channels.hasOwnProperty(message.channel.id)) {
                if (!args[1]) return sendChat(games.othello.newGame(message.channel, message.author.id, cmd, false));
                if (["causal", "fun"].includes(args[1])) return sendChat(games.othello.newGame(message.channel, message.author.id, cmd, true));
            }
            if (!games.channels[message.channel.id].started) {
                if (message.author.id != games.channels[message.channel.id].players[0] || message.author.id == "357700219825160194") {
                    k = games.othello.startGame(message.channel, message.author.id);
                    return sendChat(k[0], k[1]);
                }
                else
                return sendChat("You cannot play yourself!");
            }
        }
        else
        if (["board", "showboard"].includes(input)) {
            if (!games.channels.hasOwnProperty(message.channel.id)) return sendChat("There is no active Othello game in this channel, $user$!");
            if (!games.channels[message.channel.id].started) return sendChat("The game has not yet started, $user$!");
            let game = games.channels[message.channel.id];
            return sendChat(new Discord.Attachment(game.buffer, `othello_0_${game.players[0]}vs${game.players[1]}.png`));
        }
        else
        if (["quit", "forfeit", "leave"].includes(input)) {
            message.delete();
            if (games.channels[message.channel.id] && games.channels[message.channel.id].players.includes(message.author.id)) {
                if (!games.channels[message.channel.id].started) sendChat("$user$ has cancelled the pending game.");
                else
                return sendChat(games.othello.takeTurn(message.channel, "quit"));
                delete games.channels[message.channel.id];
            }
        }
        else
        if (["rules", "howtoplay"].includes(args[0])) {
            new Discord.RichEmbed();
            embed.setDescription("[Click here to learn how to play Othello!](https://www.wikipedia.org/wiki/Reversi#Rules)\nI don't really know how to explain it without pictures.");
            embed.setColor(new Color().random());
            return sendChat(embed);
        }
    },

    "gomoku": function(cmd, args, input, message, sendChat) {
        if (message.channel.type == "dm") return sendChat("This command is not available through DMs!");
        if (!input) return sendChat(`__**Gomoku**__\nTo start a game, type \`x!${cmd} start\`!`);
        if (["start"].includes(args[0])) {
            message.delete();
            if (!games.channels.hasOwnProperty(message.channel.id)) {
                if (!args[1]) return sendChat(games.gomoku.newGame(message.channel, message.author.id, cmd, false));
                if (["causal", "fun"].includes(args[1])) return sendChat(games.gomoku.newGame(message.channel, message.author.id, cmd, true));
            }
            if (!games.channels[message.channel.id].started) {
                if (message.author.id != games.channels[message.channel.id].players[0] || message.author.id == "357700219825160194") {
                    k = games.gomoku.startGame(message.channel, message.author.id);
                    return sendChat(k[0], k[1]);
                }
                else
                return sendChat("You cannot play yourself!");
            }
        }
        else
        if (["board", "showboard"].includes(input)) {
            if (!games.channels.hasOwnProperty(message.channel.id)) return sendChat("There is no active Gomoku game in this channel, $user$!");
            if (!games.channels[message.channel.id].started) return sendChat("The game has not yet started, $user$!");
            let game = games.channels[message.channel.id];
            return sendChat(new Discord.Attachment(game.buffer, `gomoku_0_${game.players[0]}vs${game.players[1]}.png`));
        }
        else
        if (["quit", "forfeit", "leave"].includes(input)) {
            if (!games.channels.hasOwnProperty(message.channel.id)) return sendChat("There is not a game in this channel for you to quit!");
            if (message.author.id != games.channels[message.channel.id].players[0] && message.author.id != games.channels[message.channel.id].players[1]) return sendChat("You are not a participant of this game, $user$!");
            if (!games.channels[message.channel.id].started) sendChat("$user$ has cancelled the pending game.");
            else
            sendChat("$user$ has forfeit the game.");
            delete games.channels[message.channel.id];
        }
        else
        if (["rules", "howtoplay"].includes(args[0])) {
            new Discord.RichEmbed();
            embed.setDescription("Gomoku, also called Go Bang or Renju, in the simplest terms, is a very large game of Tic Tac Toe. The board is 19x19 instead of 3x3, and instead of a 3-in-a-row, you want a 5-in-a-row.\n\nTaking turns differs from traditional 1v1 board games like checkers in that each player does not get 1 move per turn. In Gomoku, both players get 2 moves per turn, but player 1 only gets one move on their very first turn. This removes what's known as \"player 1 advantage,\" which is very prevalent in Tic Tac Toe, where player 1 is able to have more pieces on the board than player 2, but player 2 can never have more pieces on the board than player 1.\n\nTo win, you must have 5 of your stones in a line. No more, no less. That's right: if you have 6 or more in a line, you cannot win.");
            embed.setColor(new Color().random());
            return sendChat(embed);
        }
    },

    "ttt3d": function(cmd, args, input, message, sendChat) {
        return sendChat("This game has not yet been implemented to this bot. Please be patient, it will be added eventually.");
    },

    "pente": function(cmd, args, input, message, sendChat) {
        return sendChat("This game has not yet been implemented to this bot. Please be patient, it will be added eventually.");
    },

    "ninemen": function(cmd, args, input, message, sendChat) {
        return sendChat("This game has not yet been implemented to this bot. Please be patient, it will be added eventually.");
    },

    "profile": function(cmd, args, input, message, sendChat) {
        if (!input || RE.ping.test(input) || RE.id2.test(input)) {
            let member;
            if (!input) member = message.channel.guild.members.get(message.author.id);
            else
            if (message.channel.type !== "dm") member = message.channel.guild.members.get(input.match(RE.id1)[0]);
            else
            return sendChat("Cannot display other users' profiles in DMs, yet, sorry~");
  
            if (member == null) return sendChat("User not found.");
            else
            member = member.user;
   
            return db.query(`SELECT * FROM profiles WHERE id = '${member.id}'`, function(err, res) {
                if (err) return sqlError(message, err, `SELECT * FROM profiles WHERE id = '${member.id}'`);
  
                let profile;
                if (res.rows.length == 0 && !input) profile = newUser(message.author.id, message.channel);
                else
                if (res.rows.length == 0) return sendChat("No user with that ID currently has a profile.");
                else
                profile = res.rows[0];
  
                Jimp.read("./img/backgrounds/" + profile.background.substring(0, 7) + (profile.background.substring(7) == "j" ? ".jpg" : ".png")).then(function(image1) {
                    image1.getBuffer("image/png", function(err, src) {
                        let { Image } = require("canvas");
                        background = new Image;
                        background.src = src;
                        if (member.avatar)
                            Jimp.read(`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png`).then(function(image2) {
                                image2.getBuffer("image/png", function(err, src) {
                                    let { Image } = require("canvas");
                                    avatar = new Image;
                                    avatar.src = src;
                                    return sendChat(`Profile for **${member.username}**:`, new Discord.Attachment(Profile.card(member.username, profile, background, avatar), "profile.png"));
                                });
                        }).catch(err => sendChat("```" + err + "```"));
                        else
                            Jimp.read("./img/defaultAvatar.png").then(function(image2) {
                                image2.getBuffer("image/png", function(err, src) {
                                    let { Image } = require("canvas");
                                    avatar = new Image;
                                    avatar.src = src;
                                    return sendChat(`Profile for **${member.username}**:`, new Discord.Attachment(Profile.card(member.username, profile, background, avatar), "profile.png"));
                                });
                        }).catch(err => sendChat("```" + err + "```"));
                    });
                }).catch(err => sendChat("```" + err + "```"));
            });
        }
        
        else
        if (input.startsWith('[')) return sendChat("With***out*** the brackets, you twit.");
        
        else
        if (["background", "backgrounds", "bg", "bgs"].includes(args[0])) {
            if (!args[1] && !["backgrounds", "bgs"].includes(args[0])) {
                return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sendChat("```" + err + "```");
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you do not yet have a background. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].backgrounds.length == 1) return sendChat("This is your current background, $user$!\nTo get more backgrounds, do `x!profile background purchase` to get a new one!\n**Note**: buying a new background will give you a random one, but you will be able to keep it along with any previously owned backgrounds, such as the one you were given when you first created a profile. All backgrounds cost 20 Xuvys.", new Discord.Attachment("https://i.imgur.com/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == "j" ? ".jpg" : ".png")));
                    return sendChat("This is your current background, $user$! New backgrounds are still 20 Xuvys.\nDo `x!profile backgrounds` to view the other backgrounds you own.", new Discord.Attachment("https://i.imgur.com/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == "j" ? ".jpg" : ".png")));
                });
            }
            else
            if (["owned"].includes(args[1]) || (!args[1] && ["backgrounds", "bgs"].includes(args[0]))) {
                return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sqlError(message, err, `SELECT * FROM profiles WHERE id = '${member.id}'`);
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you cannot view the backgrounds you own. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].backgrounds.length == 1) return sendChat("You only have 1 background, and it's the one you have equipped.");
                    let b1 = res.rows[0].backgrounds;
                    let b2 = [];
                    for (let i = 0; i < res.rows[0].backgrounds.length; i++) {
                        if (b1[i] !== res.rows[0].background) b2.push('[' + images.titles[b1[i]] + "](" + b1[i] + ')');
                        else
                        b2.push('[' + images.titles[b1[i]] + "](" + b1[i] + ') (Equipped)');
                    }
                    return sendChat(`\`\`\`md\n# All Backgrounds owned by user ${res.rows[0].id}:\n\n  [Background Title](background ID)\n\n  ${b2.join("\n  ")}\n\nIf you wish to equip any of these, do \`x!profiles background [title ID]\` (capitals are important!)\`\`\``);
                });
            }
            else
            if (["buy", "purchase"].includes(args[1])) {
                return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sqlError(message, err, `SELECT * FROM profiles WHERE id = '${member.id}'`);
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you cannot yet purchase a new background. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].backgrounds.length == images.ids.length) return sendChat("There are no more backgrounds for you to purchase, because you've got them all already! When new ones are added, you'll be able to buy more, okay~?");
                    if (res.rows[0].money < 20) return sendChat("You do not have enough money to buy another background! Get more money by playing games (and winning)!");
  
                    newbg = images.ids.random();
                    do {
                        newbg = images.ids.random();
                    } while (res.rows[0].backgrounds.includes(newbg));
                    res.rows[0].backgrounds.push(newbg);
                    return db.query(`UPDATE profiles
                        SET backgrounds = ARRAY ${JSON.stringify(res.rows[0].backgrounds).replace(/"/g, "'")}, money = '${res.rows[0].money - 20}'
                        WHERE id = '${message.author.id}'`, function(err) {
                            if (err) sqlError(message, err, `UPDATE profiles
                                SET backgrounds = ARRAY ${JSON.stringify(res.rows[0].backgrounds).replace(/"/g, "'")}, money = '${res.rows[0].money - 20}'
                                WHERE id = '${message.author.id}'`);
                            else
                            return sendChat("Successfully purchased a new background! To equip it, do `x!profile background [background ID]`. New background ID: `" + newbg + '`', new Discord.Attachment("./img/backgrounds/" + newbg.substring(0, 7) + (newbg.substring(7) == "j" ? ".jpg" : ".png")));
                    });
                });
            }
            else
            if (/^[a-zA-Z0-9]{7}[jp]$/.test(args[1])) {
                if (!images.ids.includes(args[1])) return sendChat("That image ID does not exist. Did you make sure you capitalized the correct letters? That's important, you know.");
                return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sqlError(message, err, `SELECT * FROM profiles WHERE id = '${member.id}'`);
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you cannot yet equip a new background. If you want to change that fact, do `x!profile` right now!");
                    if (!res.rows[0].backgrounds.includes(args[1])) return sendChat("You do not own that background!");
                    return db.query(`UPDATE profiles
                        SET background = '${args[1]}'
                        WHERE id = '${message.author.id}'`, function(err) {
                            if (err) sqlError(message, err, `UPDATE profiles
                                SET background = '${args[1]}'
                                WHERE id = '${message.author.id}'`);
                            else
                            return sendChat("Successfully equipped the background `" + args[1] + "`!");
                    });
                });
            }
            else
            if (args[1].startsWith('[')) return sendChat("With***out*** the brackets, you twit.");
            else
            return sendChat("Unknown request.");
        }
        else
        if (["lorr", "sidedisplay", "displayside", "displaylorr", "leftorright", "rightorleft"].includes(args[0])) {
            return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                if (err) return sqlError(message, err, `SELECT * FROM profiles WHERE id = '${member.id}'`);
                if (res.rows.length == 0) return sendChat("You have not yet created a profile, so your information is displayed on neither the left nor the right. If you want to change that fact, do `x!profile` right now!");
                return db.query(`UPDATE profiles
                    SET lorr = '${res.rows[0].lorr == "left" ? "right" : "left"}'
                    WHERE id = '${message.author.id}'`, function(err) {
                        if (err) sqlError(message, err, `UPDATE profiles
                            SET lorr = '${res.rows[0].lorr == "left" ? "right" : "left"}'
                            WHERE id = '${message.author.id}'`);
                        else
                        return sendChat("Successfully updated your information display to the " + (res.rows[0].lorr == "left" ? "right" : "left") + " side!");
                });
            });
        }
        else
        if (["title", "titles"].includes(args[0])) {
            if (!args[1]) {
                return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sqlError(message, err, `SELECT * FROM profiles WHERE id = '${member.id}'`);
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you do not yet have any titles. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].titles.length == 1) return sendChat("The only title you own is the title you currently have equipped. Get some more and then check back with me, okay~?");
                    let t1 = res.rows[0].titles;
                    let t2 = [];
                    for (let i = 0; i < res.rows[0].titles.length; i++) {
                        if (t1[i] !== res.rows[0].title) t2.push('[' + titles[t1[i]] + "](" + t1[i] + ')');
                        else
                        t2.push('[' + titles[t1[i]] + "](" + t1[i] + ') (Equipped)');
                    }
                    return sendChat("```md\n# All Titles owned by user:" + res.rows[0].id + ":\n\n  [Title Text](titleID)\n\n  " + t2.join("\n  ") + "\n\nIf you wish to equip any of these, do `x!profile title [titleID]` (capitals are important!)!```");
                });
            }
            if (args[1].startsWith('[')) return sendChat("With***out*** the brackets, you twit.");
            if (!Object.keys(titles).includes(args[1])) return sendChat("That title ID does not exist. Try again.");
            return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                if (err) return sqlError(message, err, `SELECT * FROM profiles WHERE id = '${member.id}'`);
                if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you do not yet have the ability to change your title. If you want to change that fact, do `x!profile` right now!");
                return db.query(`UPDATE profiles
                    SET title = '${args[1]}'
                    WHERE id = '${message.author.id}'`, function(err) {
                        if (err) return sqlError(message, err, `UPDATE profiles
                            SET title = '${args[1]}'
                            WHERE id = '${message.author.id}'`);
                        return sendChat("Successfully updated your title to `" + titles[args[1]] + "`!");
                });
            });
        }
        else
        if (["color", "colors"].includes(args[0])) {
            if (!args[1]) return sendChat("Please include the color you wish to set your profile color to, and please make it a hexidecimal value ('#' followed by 3 or 6 digits and/or letters).");
            else
            if (!RE.color.test(args[1])) return sendChat("That is not a color hexidecimal. Try again.");
            return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                if (err) return sqlError(message, err, `SELECT * FROM profiles WHERE id = '${member.id}'`);
                if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you do not yet have the ability to change your profile's color. If you want to change that fact, do `x!profile` right now!");
                return db.query(`UPDATE profiles
                    SET color = '${(args[1].startsWith('#') ? '' : '#') + args[1]}'
                    WHERE id = '${message.author.id}'`, function(err) {
                        if (err) return sqlError(message, err, `UPDATE profiles
                            SET color = '${(args[1].startsWith('#') ? '' : '#') + args[1]}'
                            WHERE id = '${message.author.id}'`);
                        let canvas = new Canvas(100, 40);
                        let ctx = canvas.getContext('2d');
                        ctx.fillStyle = (args[1].startsWith('#') ? '' : '#') + args[1];
                        ctx.fillRect(0, 0, 100, 40);
                        return sendChat("Successfully updated your color to `" + (args[1].startsWith('#') ? '' : '#') + args[1] + "`!", new Discord.Attachment(canvas.toBuffer()));
                });
            });
        }
        else
        if (["help"].includes(input)) return sendChat("**Available sub-commands for `x!profile`** (do `x!profile [subcommand]`):\n\n**backgrounds** - opens the background menu for changing your profile's background\n**displaylorr** - allows you to change which side all the text n stuff is displayed on in your profile\n**title** - can display your currently equipped title, your currently owned titles, or allows you to change your currently equipped title (if you know the ID for it)\n**color** - allows you to change the color your profile uses to display text");
        else
        return sendChat("Invalid syntax. Try `x!profile help` for more information on how to use this.");
    },
   
    // Smaller Games

    "hangman": function(cmd, args, input, message, sendChat) {
        return sendChat("This game has not yet been implemented to this bot. Please be patient, it will be added eventually.");
    },

    "math": function(cmd, args, input, message, sendChat) {
        return sendChat("This game has not yet been implemented to this bot. Please be patient, it will be added eventually.");
    },

    "iq": function(cmd, args, input, message, sendChat) {
        return sendChat("This game has not yet been implemented to this bot. Please be patient, it will be added eventually.");
    },

    "sequence": function(cmd, args, input, message, sendChat) {
        return sendChat("This game has not yet been implemented to this bot. Please be patient, it will be added eventually.");
    },

    "shuffle": function(cmd, args, input, message, sendChat) {
        return sendChat("This game has not yet been implemented to this bot. Please be patient, it will be added eventually.");
    },

    // Utility
    "avatar": function(cmd, args, input, message, sendChat) {
        if (!input || RE.ping.test(input) || RE.id2.test(input)) {
            let member;
            if (!input) member = message.channel.guild.members.get(message.author.id);
            else
            if (message.channel.type !== "dm") member = message.channel.guild.members.get(input.match(RE.id1)[0]);
            else
            return sendChat("Cannot display other users' avatars in DMs, yet, sorry~");
  
            if (member == null) return sendChat("User not found.");
            else
            member = member.user;

            let embed = new Discord.RichEmbed();
            embed.setTitle("User Avatar");
            embed.setDescription(`Avatar for <@${member.id}>`);
            embed.setImage(`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=2048`);
            embed.setColor(new Color().random());
            return sendChat(embed);
        }
        else
        return sendChat("Unknown request.");
    },

    "help": function(cmd, args, input, message, sendChat) {
        if (!input) {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Help");
            embed.setDescription("A list of all commands supported by Bakeneko~\n`\*command either dysfunctional or not yet available`\n`" + (message.channel.type == "dm" ? "Some of these commands do not work in servers" : "Some of these commands do not work in DMs") + "`\nFor more help about any specific command, do \"`x![command]` `help`\"");
            let helps;
            if (message.channel.type == "dm") helps = [
                    ["`I apologize, but none of my larger games can work in DMs. When I get bigger and more people are playing my games regularly, I'll make it where you can play against strangers through DMs.`"],
                    ["\\*`hangman", "\\*`quickmaffs", "\\*`iq", "\\*`sequence", "\\*`shuffle"],
                    ["\\*`about", "`help", "`avatar",, "`aliases", "`bugreport", "`request"],
                    ["\\*`anime", "\\*`manga", "`jisho", "\\*`jshelp", "`nekos", "`calculate", "`graph"]
                ];
            else
            helps = [
                    ["`games", "`othello", "`squares", "`gomoku", "\\*`3dtictactoe", "`connect4", "\\*`pente", "\\*`ninemen", "`profile"],
                    ["\\*`hangman", "\\*`quickmaffs", "\\*`iq", "\\*`sequence", "\\*`shuffle"],
                    ["\\*`about", "`help", "`avatar", "`aliases", "`server", "`kick", "`ban"],
                    ["\\*`anime", "\\*`manga", "`jisho", "\\*`jshelp", "`nekos", "`calculate", "`graph"]
                ];
            if (message.channel.type == "dm") helps[2] = helps[2].concat(["`bugreport", "`request"]);
            embed.addField("Games", `${helps[0].join("\`  ")}\``, true);
            embed.addField("Smaller Games", `${helps[1].join("\`  ")}\``, true);
            embed.addField("Utility", `${helps[2].join("\`  ")}\``, true);
            embed.addField("Miscellaneous", `${helps[3].join("\`  ")}\``);
            if (message.channel.type == "dm" || message.channel.nsfw) {
                embed.addField("NSFW", `NSFW command only available in DMs or NSFW-marked channels (if you're seeing this, then you can use it here). Say \`x!nsfw help\` for a list of all the lewds I'm capable of.`);
            }
            embed.setColor(new Color().random());
            embed.setFooter("Xyvybot version " + version);
            return sendChat(embed);
        }
        else
        if (["games", "utility", "profile", "miscellaneous", "misc", "nsfw"].includes(input)) {
            let embed = new Discord.RichEmbed();
            embed.setTitle(input.toUpperCase());
            embed.setDescription({
                "games": "Just a few board games. I'm not gonna add chess. No.",
                "utility": "Random stuffs that relate to the bot or users or servers.",
                "profile": "Not sure what I'm gonna do for this, yet.",
                "miscellaneous": "Other stuffs. Things that don't fit well in other categories.",
                "misc": "Other stuffs. Things that don't fit well in other categories.",
                "nsfw": "Lewd stuffs. Not available in server channels that aren't marked NSFW. It's stupid that some bots have created their own permission system to enable NSFW stuff in specific channels, like, just check if the channel is marked NSFW and you're good to go. It's 354% easier for the server owners than your stupid \"Sorry, NSFW commands are disabled here. Do `/bot commands enable nsfw` to enable them here!\" shit. Learn what's easy."
            }[input]);
        }
        else
        {
            if (message.channel.type != "dm") {
                for (let i in aliases.guild) {
                    if (aliases.guild[i].includes(input)) {
                        let embed = new Discord.RichEmbed();
                        embed.setTitle("Command Info");
                        embed.setDescription({
                            "calc": "Make a basic calculation. I repeat, ***BASIC*** calculation, implying \"simple\" or \"kindergarten-level\". I am not a TI calculator.",
                            "graph": "Turn a basic equation into a visual image. I repeat, ***BASIC*** equation, implying \"simple\" or \"kindergarten-level\". I am not Desmos.",
                            "help": "Get a list of all available commands. And the unavailable ones, too. They exist, but probably don't work.",
                            "guild": "Get information about this guild. This one, right here: " + message.channel.guild.name,
                            "user": "Get information about your user in relation to this guild. Or someone else, too.",
                            "connect4": "Play a game of the original vertical checkers game with someone else (that's actually what it used to be called).",
                            "squares": "Play a game of making a bunch of the 2nd coolest shape with someone else! A game created by Xyvy himself.",
                            "othello": "Play a game of Reversi with someone else (Othello = competative Reversi, they're the same thing).",
                            "gomoku": "Play a game of Go Bang with someone else! It's like Tic Tac Toe, but bigger!",
                            "ttt3d": "Play a game of 3D Tic Tac Toe with someone else! It's like Tic Tac Toe, but a cube!",
                            "pente": "Play a game of Pente with someone else! It's like Tic Tac Toe, but violent!",
                            "ninemen": "Play a game of Nine Men's Morris with someone else! It's not like Tic Tac Toe. Well, it kinda is, but in the same sense, not really.",
                            "hangman": "Play a game of Hangman with other people!",
                            "math": "Compete with other people to see who can do math the fastest!",
                            "iq": "Simple things you might find on a fake IQ test!",
                            "sequence": "Find the next item in the pattern!",
                            "shuffle": "Be the first to unscramble a big word!",
                            "profile": "Get your profile card, complete with game stats and all, which is just your wins and losses.",
                            "anime": "Get information about any anime from MyAnimeList. Weeb shit.",
                            "manga": "Get information about any manga from MyAnimeList. Mega-weeb shit.",
                            "jisho": "Get translations to and from Japanese. Ultra-weeb shit.",
                            "jshelp": "Get help with JavaScript, the easiest programming language besides Malbolge.",
                            "nekos": "Get a picture of a catgirl, the thing everyone wants to exist but science can't provide.",
                            "cats": "Get a picture of a cat. Not a catgirl, a cat. A feline. These exist.",
                            "js": "Usable by Xyvyrianeth only. You probably don't even know how to use it.",
                            "pg": "Usable by Xyvyrianeth only. How did you even know this existed?",
                            "aliases": "Get all existing aliases for any given command. All of them.",
                            "nsfw": "Get a NSFW image or gif. It will most likely be hentai-esque." + (message.channel.nsfw ? " You can use that here. Go ahead." : " You cannot use that here. Don't even try."),
                        }[i]);
                        embed.addField("Aliases", '`' + aliases.guild[i].join("`\n`") + '`');
                        embed.setFooter("Xyvybot version " + version);
                        embed.setColor(new Color().random());
                        return sendChat(embed);
                    }
                }
                return sendChat("Unknown request.");
            }
            else
            {
                for (let i in aliases.user) {
                    if (aliases.user[i].includes(input)) {
                        let embed = new Discord.RichEmbed()
                        embed.setTitle("Command Info");
                        embed.setDescription({
                            "calc": "Make a basic calculation. I repeat, ***BASIC*** calculation, implying \"simple\" or \"kindergarten-level\". I am not a TI calculator.",
                            "graph": "Turn a basic equation into a visual image. I repeat, ***BASIC*** equation, implying \"simple\" or \"kindergarten-level\". I am not Desmos.",
                            "help": "Get a list of all available commands. And the unavailable ones, too. They exist, but probably don't work.",
                            "bug": "Use this to report any bugs you find while using my stuff. You can only report once every 2 hours because assholes will likely spam it. If assholes attempt to spam it, they will be prevented from ever doing it again.",
                            "profile": "Get your profile card, complete with game stats and all, which is just your wins and losses.",
                            "anime": "Get information about any anime from MyAnimeList. Weeb shit.",
                            "manga": "Get information about any manga from MyAnimeList. Mega-weeb shit.",
                            "jisho": "Get translations to and from Japanese. Ultra-weeb shit.",
                            "jshelp": "Get help with JavaScript, the easiest programming language besides Malbolge.",
                            "nekos": "Get a picture of a catgirl, the thing everyone wants to exist but science can't provide.",
                            "cats": "Get a picture of a cat. Not a catgirl, a cat. A feline. These exist.",
                            "js": "Usable by Xyvyrianeth only. You probably don't even know how to use it.",
                            "pg": "Usable by Xyvyrianeth only. How did you even know this existed?",
                            "aliases": "Get all existing aliases for any given command. All of them.",
                            "nsfw": "Get a NSFW image or gif. It will most likely be hentai-esque. You can use that here. Go ahead. I'll FILL your DMs with hentai if you really want me to.",
                        }[i]);
                        embed.addField("Aliases", '`' + aliases.user[i].join("`\n`") + '`');
                        embed.setFooter("Xyvybot version " + version);
                        embed.setColor(new Color().random());
                        return sendChat(embed);
                    }
                }
                return sendChat("Unknown request.");
            }
        }
    },
  
    "about": function(cmd, args, input, message, sendChat) {
        let embed = new Discord.RichEmbed();
        embed.setTitle("About me");
        embed.addDescription("Let's start off by saying that the only reason this bot exists is because someone else told me I should make it. Not for any reason in particular, they were just testing me to see if I could do it.\nWell, I did it, and then I found I enjoyed making it, so I kept building on it. It's still a piece of crap, but it works, and that's all that matters, right?\n\nFast-forward 2 years and I find myself interested in abstract strategy games, like Go and Othello. It's not easy using a completely different application or software to play simple games with my friends on Discord, so I made this bot able to do what those other apps did, and we had fun.\n*Then*, someone suggested I make this bot go public so *other people* won't have the same problem. Thank that person (I forgot who, honestly) for telling me to solve that problem for you if you had it as well.");
    },

    "aliases": function(cmd, args, input, message, sendChat) {
        if (!input) return sendChat("To view all the aliases for a command, do `x!aliases` `[command name]`");
        else
        if (input.startsWith('[')) return sendChat("With***out*** the brackets.");
        for (let i in aliases.guild) {
            if (aliases.guild[i].includes(input)) {
                let embed = new Discord.RichEmbed();
                embed.setTitle("Aliases for " + i);
                embed.setDescription("`" + aliases.guild.join("`  `") + "`");
                embed.setColor(new Color().random());
                return sendChat(embed);
            }
        }
    },

    "bug": function(cmd, args, input, message, sendChat) {
        return db.query(`SELECT bug FROM bans`, function(err, res) {
            if (err) return sendChat("```" + err + "```");
            if (!rows.includes(message.author.id)) {
                if (bugTimers[message.author.id]) return sendChat("You can submit 1 bug every 2 hours. Xyvy doesn't like being spammed, you know.");
                if (!input) return sendChat("Here is how to format a bug report:\n\n```\nx!reportbug [command that's bugged]\n[description of bug (less than 1000 characters, please)]```\nPlease take note that if you submit a fake bug report, your user ID will be blacklisted and you will no longer be able to use this command. Don't be a dick.");
                let com = input.split("\n")[0];
                console.log('"' + com + '"');
                if (com.startsWith("[")) return sendChat("With***out*** the brackets, you twit.");
                let aliases = message.channel.type == "dm" ? aliases.user : aliases.guild;
                let a = false;
                for (let i in aliases) 
                    if (aliases[i].includes(com)) {
                        a = true;
                        break;
                    }
                if (!a) return sendChat("That command does not exist!");
                let desc = input.substring(com.length).trim();
                if (desc.length > 1000) return sendChat("Your description must be 1000 characters or shorter! This is not my personal preference, it's just a Discord thing.");
                let embed = new Discord.RichEmbed();
                embed.setTitle("Bug Report");
                embed.setAuthor(message.author.username + "#" + message.author.discriminator + " (" + message.author.id + ")");
                embed.setDescription("**Command**: " + com + "\n\n" + desc);
                client.guilds.get("399327996076621825").channels.get("467853697528102912").send(embed);
                bugTimers[message.author.id] = 100 * 60 * 60 * 2;
                return sendChat("Bug report sent! Thanks for helping out!");
            }
            else
            sendChat("You are not allowed to use this command, since you thought you were funny and tried to spam it at some point. Way to go, you're a dick. You should feel proud.");
        })
    },

    "request": function(cmd, args, input, message, sendChat) {
        return db.query(`SELECT request FROM bans`, function(err, res) {
            if (err) return sendChat("```" + err + "```");
            if (!rows.includes(message.author.id)) {
                if (requestTimers[message.author.id]) return sendChat("You can submit 1 request every 2 hours. Xyvy doesn't like being spammed, you know.");
                if (!input) return sendChat("Here is how to format a request:\n\n```\nx!request [description of suggestion (less than 1000 characters, please)]```\nPlease take note that if you submit a fake request, your user ID will be blacklisted and you will no longer be able to use this command. Don't be a dick.");
                if (input.length > 1000) return sendChat("Your description must be 1000 characters or shorter! This is not my personal preference, it's just a Discord thing.");
                let embed = new Discord.RichEmbed();
                embed.setTitle("User Request");
                embed.setAuthor(message.author.username + "#" + message.author.discriminator + " (" + message.author.id + ")");
                embed.setDescription("**Suggestion**:\n" + input);
                client.guilds.get("399327996076621825").channels.get("468245442388295691").send(embed);
                requestTimers[message.author.id] = 100 * 60 * 60 * 2;
                return sendChat("Request sent! Thanks for the suggestion!");
            }
            else
            sendChat("You are not allowed to use this command, since you thought you were funny and tried to spam it at some point. Way to go, you're a dick. You should feel proud.");
        });
    },
   
    "guild": function(cmd, args, input, message, sendChat) {
        if (!input) {
            let guild = message.channel.guild;
            embed = new Discord.RichEmbed();
            embed.setTitle("Guild ID: " + guild.id);
            embed.setAuthor(guild.name);
            embed.setColor(new Color().random());
            if (guild.icon != null) embed.setThumbnail(guild.icon);
   
            owner = guild.members.get(guild.ownerID).user;
            embed.addField("Owner", `${owner.username}#${owner.discriminator}\n<@${owner.id}>`);
            embed.addField("Region", guild.region, true);
            embed.addField("Verification Level", ["None", "Low", "Medium", "(╯°□°）╯︵ ┻━┻", "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻"][guild.verificationLevel], true);
            embed.addBlankField();
            let channels = guild.channels.array();
            let text = 0;
            let voice = 0;
            for (let i = 0; i < channels.length; i++) {
                if (channels[i].type == "text") text += 1;
                if (channels[i].type == "voice") voice += 1;
            }
            embed.addField("Channels", guild.channels.array().length + " total", true);
            embed.addField("Text", text, true);
            embed.addField("Voice", voice, true);
            let members = guild.members.array();
            let humans = guild.memberCount;
            let bots = 0;
            for (let i = 0; i < members.length; i++) if (members[i].user.bot) bots += 1;
            embed.addField("Members", humans + " total", true);
            embed.addField("Humans", humans - bots, true);
            embed.addField("Bots", bots, true);
   
            return sendChat(embed);
   
        }
    },

    "kick": function(cmd, args, input, message, sendChat) {
        let user = message.channel.guild.members.get(message.author.id);
        if (!user.hasPermission("KICK_MEMBERS")) return;
        if (!input) return sendChat("**Proper Usage**: `x!kick <@user>`");
        if (!RE.ping.test(args[0]) || !RE.id2.test(args[0])) return sendChat("Invalid user mention, try again.");
        else
        {
            message.channel.guild.members.get(args[0].match(RE.id1)[0]).kick(args[1] ? input.substring(args[0].lenght + 1) : "Probably for something annoying.").then(() => sendChat("kicked user <@" + args[0].match(RE.id1)[0] + ">")).catch((err) => sendChat("Failed to kick user <@" + args[0].match(RE.id1)[0] + ">```\n" + err + "```"))
        }

    },

    "ban": function(cmd, args, input, message, sendChat) {
        let user = message.channel.guild.members.get(message.author.id);
        if (user.hasPermission("BAN_MEMBERS")) return;
        if (!input) return sendChat("**Proper Usage**: `x!ban <@user>`");
        if (!RE.ping.test(args[0]) || !RE.id2.test(args[0])) return sendChat("Invalid user mention, try again.");
        else
        {
            message.channel.guild.members.get(args[0].match(RE.id1)[0]).ban({ days: 1, reason: args[1] ? input.substring(args[0].length + 1) : "Probably for something annoying." }).then(() => sendChat("baned user <@" + args[0].match(RE.id1)[0] + ">")).catch((err) => sendChat("Failed to ban user <@" + args[0].match(RE.id1)[0] + ">```\n" + err + "```"))
        }

    },
   
    // Miscellaneous
    "anime": function(cmd, args, input, message, sendChat) {
   
    },
       
    "manga": function(cmd, args, input, message, sendChat) {
   
    },
       
    "jisho": function(cmd, args, input, message, sendChat) {
        if (!input) return sendChat("Jisho, the Japanese Dictionary!\nSearch for Kanji definitions, radicals, examples, and more!\nFor more help, use the command `x!jisho help`!");
           
        else
        if (["help", "syntax"].includes(input)) {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Jisho Syntax");
            embed.addField("Kanji", "Returns all there is to know about a Kanji!\nExample: `x!jisho kanji 語`");
            embed.addField("Examples", "Returns example sentences for a Kanji!\nExample: `x!jisho example 日`");
            embed.addField("Phrase", "Returns a definition for a Kanji phrase!\nExample: `x!jisho phrase 日曜日`");
            embed.addField("Kana", "Returns a simple Hiragana chart with a short explanation as to how Kana works!");
        }
   
        else
        if (["kanji"].includes(args[0])) {
            if (!args[1]) return sendChat("Please include a query");
            input = input.substring(args[0].length + 1);
            jisho.searchForKanji(input).then(result => {
                if (!result.found) return sendChat(`"${input}" not found.`);
                let embed = new Discord.RichEmbed();
                embed.setTitle("Kanji: " + input);
                embed.setDescription(`${result.meaning}\nJLPT Level: ${result.jlptLevel}`);
                let onyomi = `${result.onyomiExamples[0].example} (${result.onyomiExamples[0].reading})\n \u00a0 ${(result.onyomiExamples[0].meaning + ' ').match(/.{0,40} /g).join('\n \u00a0 ').trim()}`;
                embed.addField("On'yomi", `__Reading${result.onyomi.length > 1 ? 's' : ''}__: ${result.onyomi.join(', ')}\n\n__Example__:\n${onyomi}`);
                let kunyomi = `${result.kunyomiExamples[0].example} (${result.kunyomiExamples[0].reading})\ \u00a0  ${(result.kunyomiExamples[0].meaning + ' ').match(/.{0,40} /g).join('\n \u00a0 ').trim()}`;
                embed.addField("Kun'yomi", `__Reading${result.kunyomi.length > 1 ? 's' : ''}__: ${result.kunyomi.join(', ')}\n\n__Example__:\n${kunyomi}`);
                embed.addField("Radical", `${result.radical.symbol} ${result.radical.forms ? `(${result.radical.forms.join(", ")}) ` : ''}"${result.radical.meaning}"`, true);
                embed.addField("Parts", result.parts.join(", "), true);
                embed.addField("Stroke Count: " + result.strokeCount, "Stroke Order:", true);f5
  
                embed.setImage(result.strokeOrderDiagramUri);
                embed.setURL(result.uri);
               
                sendChat(embed);
            });
        }
   
        else
        if (["examples"].includes(args[0])) {
            if (!args[1]) return sendChat("Please include a query");
            input = input.substring(args[0].length + 1);
            jisho.searchForExamples(input).then(result => {
                if (!result.found) return sendChat(`"${input}" not found.`);
                let embed = new Discord.RichEmbed();
                embed.setTitle(`Examples sentences containing "${input}"`);
                examples = result.results.random(5);
                for (let i = 0; i < examples.length; i++) {
                    embed.addField((i + 1) + ") " + examples[i].kanji, `${examples[i].kana}\n${examples[i].english}`);
                }
                return sendChat(embed);
            });
        }
   
        else
        if (["phrase", "word"].includes(args[0])) {
            if (!args[1]) return sendChat("Please include a query");
            input = input.substring(args[0].length + 1);
            jisho.searchForPhrase(input).then(result => {
                if (result.data.length == 0) return sendChat("Nothing found.");
                let embed = new Discord.RichEmbed();
                embed.setTitle("Phrase: " + input);
                let definition = result.data[0];
                embed.addField("Definition", definition.senses[0].english_definitions);
                embed.addField("Reading", definition.japanese[0].reading);
                sendChat(embed);
            });
        }
   
        else
        if (["kana"].includes(args[0])) {
            if (!args[1]) {
                let embed = new Discord.RichEmbed();
                embed.setTitle("How to read Kana");
                embed.setDescription("Kana can be thought of as the Japanese alphabet. Each Kana represents a single syllable spoken in the Japanese language. Kana usually include one of 9 consonant sounds followed by one of 5 vowel sounds (with a few exceptions)");
                let chart1 = "V O W E L S\n_A　_I　_U　_E　_O\n------------------\nあ  い  う  え  お|__ C\nか  き  く  け  こ|K_ O\nさ  し  す  せ  そ|S_ N\nた  ち  つ  て  と|T_ S\nな  に  ぬ  ね  の|N_ O\nは  ひ  ふ  へ  ほ|H_ N\nま  み  む  め  も|M_ A\nや  　  ゆ  　  よ|Y_ N\nら  り  る  れ  ろ|R_ T\nわ  　  　  　  を|W_ S\nん  　  　  　  　|NN ";
                embed.addField("Hiragana Chart:", "```" + chart1 + "```");
                embed.addField("Exceptions", "し (shi)\nち (chi)\nつ (tsu)\nふ (fu)\nを (o)");
                embed.addField("The ん", "The ん is a rather special character, since it does not have a vowel sound. It can make both the sound of the letter 'n' and the letter 'm', depending on the character succeeding it. For characters with the consonants 'm', 'b', and 'p', it makes the 'm' sound, and it makes an 'n' sound for everything else. Common mistake in pronunciation is the word 先輩 (せんぱい), which is often pronounced as \"senpai\" by non-Japanese speakers when it should be pronounced \"sempai\".");
                embed.addField("\u200b", "After you've learned this, there are still some additional sounds to learn. Some Kana can make new sounds by adding either a *dakuten*, which kind of looks like double quatation marks, or a *handakuten*, which looks like a small circle. In Japanese, this is called \"muddying\" the consonant sound.");
                let chart2 = "_A　_I　_E　_O　_U\n------------------\nが  ぎ  ぐ  げ  ご|G_\nざ  じ  ず  ぜ  ぞ|Z_\nだ  ぢ  づ  で  ど|D_\nば  び  ぶ  べ  ぼ|B_\nぱ  ぴ  ぷ  ぺ  ぽ|P_";
                embed.addField("Dakuten and Handakuten Chart:", "```" + chart2 + "```");
                embed.addField("Exceptions", "じ (ji)\nぢ (ji)\nづ (dzu)");
                embed.addField("\u200b", "Now that you know all of the characters, it's time to start pushing some of them together. You can combine a consonant with a \"ya\", \"yu\", or \"yo\" sound by putting a small や, ゆ, or よ after the 'i' vowel character of each consonant.");
                let chart3 = "_YA　　_YU　　_YO\n------------------\nきゃ   きゅ   きょ|K__\nにゃ   にゅ   にょ|N__\nしゃ   しゅ   しょ|SH__\nちゃ   ちゅ   ちょ|CH__\nひゃ   ひゅ   ひょ|H__\nみゃ   みゅ   みょ|M__\nりゃ   りゅ   りょ|R__\nぎゃ   ぎゅ   ぎょ|G__\nじゃ   じゅ   じょ|J__\nびゃ   びゅ   びょ|B__\nぴゃ   ぴゅ   ぴょ|P__";
                embed.addField("Combinations Chart:", "```" + chart3 + "```");
                embed.addField("The small つ", "The small つ is often inserted between two characters. This takes the consonant sound of the second character and adds it to the end of the first. For example, if you put a small つ between び and く, you would get びっく, which is pronounced as \"bikku\", not \"biku\" or \"bitsuku\".");
                embed.addField("\u200b", "That's the basics of Hiragana! Hope this was helpful, I wrote all this shit myself!");
   
                embed.setFooter("Source: Tai Kim's Japanese Guide");
   
                return sendChat(embed);
            }
            else
            if (["charts", "chart"].includes(args[1])) {
                let embed = new Discord.RichEmbed();
            }
        }
    },
   
    "nekos": function(cmd, args, input, message, sendChat) {
        Nekos.getSFWNeko().then(neko => sendChat(new Discord.RichEmbed().setImage(neko.url).setDescription("Have a neko~!").setFooter("Powered by Nekos.Life").setColor(new Color().random())));
    },
   
    "cats": function(cmd, args, input, message, sendChat) {
        Nekos.getSFWCat().then(cat => sendChat(new Discord.RichEmbed().setImage(cat.url).setDescription("Have a neko~!").setFooter("Powered by Nekos.Life").setColor(new Color().random())));
    },

    "calc": function(cmd, args, input, message, sendChat) {
        if (!input) return sendChat(`**Syntax**: \`${a.prefix}calc\` \`[equation]\``);
        let equation = input;
        equation = equation.replace(/([0-9.])\(/g, "$1*(");
        equation = equation.replace(/\)([0-9.])/g, ")*$1");
        equation = equation.replace(/(pi|π)/g, 'Math.PI');
        equation = equation.replace(/\)\(/g, ")*(");
        equation = equation.replace(/\^/g, '**');
        if (/\|/.test(equation)) {
            a = equation.match(/\|/g);
            if (a.length % 2 == 1) return sendChat("`Unmatched |`");
            for (let i = 0; i < a.length; i++) {
                if (i % 2 == 0) equation = equation.replace('|', 'Math.abs(');
                else
                equation = equation.replace('|', ')');
            }
        }
   
        try {
            return sendChat("```Input: " + input + "``````Output: " + eval(equation) + "```");
        } catch (err) {
            return sendChat("```Input: " + input + "``````Output: " + err + "```");
        }
    },
   
    "graph": function(cmd, args, input, message, sendChat) {
        if (["info", "about", "history"].includes(args[0])) {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Brief History of the Xyvyrianethian Graphic Calculator");
            embed.setAuthor("By Xyvyrianeth");
            embed.setDescription("Okay, well, I made this simply because I had nothing better to do with my time. When I started, it was 100% text-drawn, "
                                +"and it was really cool because I could add a lot of features to it when it didn't have to be accurate. Then I moved to "
                                +"Node Canvas and had to start over. I'm still not anywhere near the level of Desmos, but I'm proud of myself with what "
                                +"I have.");
            embed.addField("Other Sub-Commands", "`x!" + cmd + "`  `syntax`");
        }
        else
        if (["help", "syntax"].includes(args[0])) {
            let embed = new Discord.RichEmbed();
            embed.setTitle("How to Graphic Calculator, Xyvybot Style");
            embed.setAuthor("by Xyvyrianeth");
            embed.setDescription("In order to have a more advanced calculator, there needs to be a more strict syntax. I had to change a lot of things in "
                                +"the old syntax just to enable something simple like square root, cube root, or n-root of x, and I'll have to change even "
                                +"more if I want to add something like Π and ∑.");
            embed.addField("Basic Arithmatic: + - * /", "");

        }
        else
        function equ(equation, xy, XY) {
            if (xy !== undefined && XY !== undefined) {
                if (XY == 'x') equation = equation.replace(/x/g, xy);
                else
                if (XY == 'y') equation = equation.replace(/y/g, xy);
                else
                if (XY == 'xy') {
                    equation = equation.replace(/x/g, xy[0]);
                    equation = equation.replace(/y/g, xy[1]);
                }
            }
            let terms = [ [
                    /(pi|π)/g,
                    "(Math.PI)"
                ], [
                    /(infinity|∞)/g,
                    "(Math.Infinity)"
                ], [
                    /([0-9\.])\(/g,
                    "$1*("
                ], [
                    /\)([0-9\.])/,
                    ")*$1"
                ], [
                    /([0-9\.])M/g,
                    "$1*M"
                ], [
                    /\)\(/g,
                    ")*("
            ] ];
            for (let i = 0; i < terms.length; i++) {
                equation = equation.replace(terms[i][0], terms[i][1]);
            }
            let methods = [ [
                    /(sin|cos|tan|csc|sec|cot|log)([0-9\.]{1,})/g,
                    "Math.$1($2)"
                ], [
                    /(?:a?(sin|cos|tan|csc|sec|cot)|(sin|cos|tan|csc|sec|cot)\^-1)(\-?[0-9\.]{1,})/g,
                    "Math.a$1$2($3)"
                ], [
                    /(?:\\sqrt|√)\[(\-?[0-9\.]{1,})\]\((\-?[0-9\.]{1,})\)/g,
                    "Math.pow($2,(1/$1))"
                ], [
                    /(?:\\sqrt|√)\((\-?[0-9\.]{1,})\)/g,
                    "Math.sqrt($1)"
                ], [
                    /((?:\(\-?[0-9.]{1,}\)|-?[0-9.]{1,}))\^((?:\(\-?[0-9.]{1,}\)|-?[0-9.]{1,}))/g,
                    "Math.pow($1,$2)"
                ],/*  [
                    /(?:\\sum|∑)\[n=([0-9\.]{1,})\]^\(([0-9\.]{1,})\)/g,
                    "Math.sum($1, 2)"
                ],[  // Soon^TM
                    /(?:\\prod|∏)\[n=([0-9\.]{1,})\]^\(([0-9\.]{1,})\)/g,
                    "Math.prod($1, 2)"
                ], */ [
                    /\|([0-9\.]{1,})\|/g,
                    "Math.abs($1)"
            ] ];
            for (let i = 0; i < 1; i++) {
                let lastEquation = equation;
                if (/\([0-9.+\-\/\*]{1,}\)/.test(equation)) {
                    equate = equation.match(/\([0-9.+\-\/\*]{1,}\)/g);
                    for (let i = 0; i < equate.length; i++) {
                        if (/\(/.test(equate[i]) && /\)/.test(equate[i]) && equate[i].match(/\(/g).length == equate[i].match(/\)/g).length) equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
                    }
                }
                if (/\([0-9.\(\)+\-\/\*]{1,}\)/.test(equation)) {
                    equate = equation.match(/\([0-9.\(\)+\-\/\*]{1,}\)/g);
                    for (let i = 0; i < equate.length; i++) {
                        if (/\(/.test(equate[i]) && /\)/.test(equate[i]) && equate[i].match(/\(/g).length == equate[i].match(/\)/g).length) equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
                    }
                }
                do {
                    equation = equation.replace(/\(\((\-?[0-9.]{1,})\)\)/, "($1)");
                } while (/\(\((\-?[0-9.]{1,})\)\)/.test(equation));
                for (let i = 0; i < methods.length; i++) {
                    equation = equation.replace(methods[i][0], methods[i][1]);
                }
                if (/Math\.(a?sin|a?cos|a?tan|a?csc|a?sec|a?cot|log|sqrt|pow|abs|sum|prod)\((\(\-?[0-9\.]{1,}\)|-?[0-9\.]{1,})(,(\(\-?[0-9\.]{1,}\)|\-?[0-9\.]{1,}))?\)/g.test(equation)) {
                    equate = equation.match(/Math\.(a?sin|a?cos|a?tan|a?csc|a?sec|a?cot|log|sqrt|pow|abs|sum|prod)\((\(\-?[0-9\.]{1,}\)|-?[0-9\.]{1,})(,(\(\-?[0-9\.]{1,}\)|\-?[0-9\.]{1,}))?\)/g);
                    for (let i = 0; i < equate.length; i++) {
                        equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
                    }
                }
                if (equation != lastEquation) i--;
            }
   
            try {
                return eval(equation);
            } catch (err) {
                console.log(err);
                console.log(equation);
                return sendChat('`' + err + '`');
            }
   
        }
   
        // Draw blank graph
        canvas = new Canvas(300, 300);
        ctx = canvas.getContext('2d');
        ctx.translate(150, 150);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-150, -150, 300, 300);
        ctx.strokeStyle = "#aaa";
        for (let i = 80; i--;) {
            ctx.moveTo(-150, i * 10 - 150);
            ctx.lineTo(150, i * 10 - 150);
        }
        for (let i = 80; i--;) {
            ctx.moveTo(i * 10 - 150, -150);
            ctx.lineTo(i * 10 - 150, 150);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.moveTo(0, -150);
        ctx.lineTo(0, 150);
        ctx.moveTo(-150, 0);
        ctx.lineTo(150, 0);
        ctx.stroke();
        e = input.toLowerCase().replace(/ /g, "").split('\n');
        input = input.split('\n');
        colors = ["#f00", "#f80", "#ff0", "#0f0", "#080", "#08f", "#00f", "#909", "#840", "#f8f"];
        if (/;$/.test(input)) e.pop();
        if (e.length > colors.length) return sendChat("`Too many equations!`");
        let display = [];

        for (let i = 0; i < e.length; i++) {

            // decide color
            let ic = e[i].split(';');
            let color = colors[i];
            let xy = ic[0];
            if (ic.length == 2) {
                if (/#([0-9a-f]{6,}|[0-9a-f]{3,})/.test(ic[0].toLowerCase())) {
                    color = ic[0].toLowerCase();
                    xy = ic[1];
                }
                if (/#([0-9a-f]{6,}|[0-9a-f]{3,})/.test(ic[1].toLowerCase())) {
                    color = ic[1].toLowerCase();
                    xy = ic[0];
                }
            }
            xy = xy.split('=');

            // start graphing
            let canEquate;
            let result;
            
            if (xy.length == 1) {
                if (xy[0].includes('x') && xy[0].includes('y')) {
                    canEquate = false;
                    result = "Equations cannot be graphed without **input** (*x*) or **output** (*y*) set equal to something.";
                }
                else
                if (xy[0].includes('x') && !xy[0].includes('y')) {
                    canEquate = true;
                    result = [];
                    for (let x = -150; x < 150; x++) {
                        let ans = equ(equation, x, 'x');
                        result.push([x, ans]);
                    }
                }
                else
                if (!xy[0].includes('x') && xy[0].includes('y')) {
                    canEquate = false;
                    result = "Cannot take **output** (*y*) to determine **input** (*x*) without setting it equal to something.";
                }
            }
            else
            if (xy.length == 2) {
                if ((xy[0].includes('x') && xy[1].includes('x')) || (xy[0].includes('y') && xy[1].includes('y'))) {
                    canEquate = false;
                    result = "Neither **input** (*x*) nor **output** (*y*) can be on both sides of an equation.";
                }
                else
                if ((xy[0].includes('x') && xy[1].includes('y')) || (xy[0].includes('y') && xy[1].includes('x'))) {
                    canEquate = true;
                    result = [];
                    if (xy[1].includes('x')) xy = [xy[1], xy[0]];
                    for (let x = -150; x < 150; x++) {
                        for (let y = -150; y < 150; y++) {
                            let X = equ(xy[0], x, 'x');
                            let Y = equ(xy[1], y, 'y');
                            if (Math.abs(X - Y) <= 0.5) result.push([x, y]);
                        }
                    }
                }
                else
                if (!xy[0].includes('x') && !xy[1].includes('x') && !xy[0].includes('y') && !xy[1].includes('y')) {
                    canEquate = false;
                    result = "Equations cannot be graphed without **input** (*x*) or **output** (*y*) set equal to something.";
                }
                else
                if (!xy[0].includes('x') && !xy[1].includes('x')) {
                    if (xy[0].includes('y')) {
                        canEquate = true;
                        result = [];
                        for (let y = -150; y < 150; y++) {
                            X = equ(xy[1]);
                            Y = equ(xy[0], y, 'y');
                            if (Math.abs(X - Y) <= 0.5) result.push([X, Y]);
                        }
                    }
                    else
                    {
                        canEquate = true;
                        result = [];
                        for (let y = -150; y < 150; y++) {
                            X = equ(xy[0]);
                            Y = equ(xy[1], y, 'y');
                            if (Math.abs(X - Y) <= 0.5) result.push([X, Y]);
                        }
                    }
                }
                else
                if (!xy[0].includes('y') && !xy[1].includes('y')) {
                    if (xy[0].includes('x')) {
                        canEquate = true;
                        result = [];
                        for (let x = -150; x < 150; x++) {
                            X = equ(xy[0], x, 'x');
                            Y = equ(xy[1]);
                            if (Math.abs(X - Y) <= 0.5) result.push([X, Y]);
                        }
                    }
                    else
                    {
                        canEquate = true;
                        result = [];
                        for (let x = -150; x < 150; x++) {
                            X = equ(xy[1], x, 'x');
                            Y = equ(xy[0]);
                            if (Math.abs(X - Y) <= 0.5) result.push([X, Y]);
                        }
                    }
                }
            }

            let result_;
            if (canEquate) {
                ctx.strokeStyle = color;
                for (let i = 0; i < result.length; i++) {
                    if (i == 0) ctx.moveTo(result[i][0], result[i][1]);
                    else
                    ctx.lineTo(result[i][0], result[i][1]);
                }
                ctx.stroke();
                result = new Color(color).getName();
            } else {
                result_ = result;
            }
            display.push(input[i] + " - " + result_);
        }
   
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeRect(-140, -140, 10, 10);
        ctx.font = "10px Calibri";
        ctx.fillStyle = "#000000"
        ctx.fillText("= 10 units\u00b2", -126, -131);
        sendChat("```Equation" + (display.length > 1 ? 's' : '') + ":\n" + display.join('\n') + "```", new Discord.Attachment(canvas.toBuffer()));
   
    },
   
    // NSFW
    "nsfw": function(cmd, args, input, message, sendChat) {
        let tags = Object.keys(Nekos).filter(x => x.startsWith("getNSFW")).join(' ').replace(/getNSFW/g, '').split(' ').sort();
        if (message.channel.type != "dm" && !message.channel.nsfw) return;
        if (!input) {
            let type = tags.random();
            let embed = new Discord.RichEmbed();
            embed.setDescription(`Have some random NSFW~\nTag: \`${type}\` | Do \`x!nsfw [tag]\` to see more like this\nDo \`x!nsfw tags\` to see all tags`);
            embed.setFooter("Powered by Nekos.Life");
            embed.setColor(new Color().random());
            return Nekos["getNSFW" + type]().then(nsfw => sendChat(embed.setImage(nsfw.url)));
        }
        if (["tags", "help"].includes(input)) {
            let embed = new Discord.RichEmbed();
            embed.setTitle("NSFW Tags");
            let joined = '';
            for (let i = 0; i < tags.length; i++) joined += tags[i] + ' '.repeat(16 - (tags[i].length % 16));
            embed.setDescription('```\n' + joined.trim() + '```\n**Usage**: `x!nsfw [tag]`');
            embed.setFooter("Powered by Nekos.Life");
            embed.setColor(new Color().random());
            return Nekos.getNSFWNeko().then(help => sendChat(embed.setImage(help.url)));
        }
        if (!tags.join(' ').toLowerCase().split(' ').includes(input.toLowerCase())) return sendChat("Sorry, I don't have that");
        
        let type = tags[tags.join(' ').toLowerCase().split(' ').indexOf(input.toLowerCase())];
        let embed = new Discord.RichEmbed();
        embed.setDescription(`Tag: \`${type}\``);
        embed.setFooter("Powered by Nekos.Life");
        embed.setColor(new Color().random())
        return Nekos["getNSFW" + type]().then(nsfw => sendChat(embed.setImage(nsfw.url)));
    },
   
    // Admin-only
    "js": function(cmd, args, input, message, sendChat) {
        if (!admins.includes(message.author.id)) return;
        if (input.startsWith("```js\n") && input.endsWith("```")) {
            let execute = input.substring(6, input.length - 3);
            try {
                sendChat("```js\n" + JSON.stringify(eval(execute)) + "```");
            } catch (err) {
                let stack = err.stack.split('\n');
                let a = stack.length;
                for (let i = 0; i < stack.length; i++) {
                    if (stack[i].includes("at emitOne")) {
                        a = i;
                        break;
                    }
                }
                let Err = [];
                let b = false;
                for (let i = 1; i < a; i++) {
                    Err.push(stack[i]);
                    if (/<anonymous>:[0-9]{1,}:[0-9]{1,}/.test(stack[i])) {
                        let c = stack[i].match(/<anonymous>:[0-9]{1,}:[0-9]{1,}/)[0].split(":");
                        b = [execute.split('\n')[Number(c[1]) - 1], Number(c[2]) - 1];
                    }
                }
                if (!b) sendChat("```" + err + "``````\n" + Err.join("\n") + "```");
                else
                return sendChat("```" + err + "``````" + b[0] + '\n' + ' '.repeat(b[1]) + "^```");
            }
        }
    },
   
    "pg": function(cmd, args, input, message, sendChat) {
        if (!admins.includes(message.author.id)) return;
        if (input.startsWith("```sql\n") && input.endsWith("```")) {
            return db.query(input.substring(7, input.length - 3), function(err, res) {
                if (err) return sendChat("```" + err + "```");
                return sendChat(table(res));
            });
        }
    },
   
};

Object.defineProperty(Array.prototype, 'clone', {
    value: function() {
        return JSON.parse(JSON.stringify(this));
    }
});
Object.defineProperty(Array.prototype, 'random', {
    value: function(a) {
        if (!a) return this[Math.random() * this.length | 0];
        else
        {
            let b = [];
            let c = [];
            if (this.length < a) a = this.length;
            for (let i = a; i--;) {
                let d = Math.random() * this.length | 0;
                if (c.includes(d)) i++;
                else
                c.push(d);
            }
            for (let i = a; i--;) b.push(this[c[i]]);
            return b;
        }
    }
});
Object.defineProperty(Array.prototype, 'shuffle', {
    value: function() {
        let a = JSON.parse(JSON.stringify(this));
        let b = [];
        for (let i = 0; i < this.length; i++) {
            let c = a[Math.random() * a.length | 0];
            b.push(c);
            a.splice(a.indexOf(c), 1);
        }
        return b;
    }
});
Math.sum = function(n, a, b) {
    n = Math.round(n);
    a = Math.round(a);
    c = 0;
    for (let i = n; i <= a; i++) c += b;
    return c;
}
Math.prod = function(n, a, b) {
    n = Math.round(n);
    a = Math.round(a);
    c = 0;
    for (let i = n; i <= a; i++) c *= b;
    return c;
}
   
exports.db = db;
exports.version = version;
exports.command = command;
exports.other = other;
exports.bot = bot;
