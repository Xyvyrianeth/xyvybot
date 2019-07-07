var version = "2.35.0.11";

const Discord = require("discord.js");
const Canvas = require("canvas");

var { client,config } = require("/app/Xyvy.js");
var Profile = require("/app/stuffs/profile.js");
var { Color } = require("/app/stuffs/color.js");
var titles = require("/app/stuffs/titles.json");
var images = require("/app/stuffs/images.json");
var { table } = require("/app/stuffs/table.js");

var admins = "357700219825160194".split(' ');

const pg = require("pg");
var db = new pg.Client(config.DATABASE_URL);
db.connect();
exports.db = db;
   
const jishoApi = require("unofficial-jisho-api");
const jisho = new jishoApi();
   
const nekos = require("nekos.life");
const Nekos = new nekos();

var bugTimers = {};
var bugTimer = setInterval(function() {
    for (let i in bugTimers)
    {
        bugTimers[i] -= 1;
        if (bugTimers[i] == 0)
        {
            delete bugTimers[i];
        }
    }
}, 10);

var requestTimers = {};
var requestTimer = setInterval(function() {
    for (let i in requestTimers)
    {
        requestTimers[i] -= 1;
        if (requestTimers[i] == 0)
        {
            delete requestTimers[i];
        }
    }
}, 10);
var games = {
    othello: require("/app/games/othello.js"),
    squares: require("/app/games/squares.js"),
    gomoku: require("/app/games/gomoku.js"),
    ttt3d: require("/app/games/3dttt.js"),
    connect4: require("/app/games/connect4.js"),
    games: require("/app/games/games.js").games
}

function botError(message, err) {
    return client.guilds.get("399327996076621825").channels.get("467902250128506880").send([
        `\`\`\`Server: ${message.channel.guild.name} (${message.channel.guild.id})`,
        `Channel: ${message.channel.name} (${message.channel.id})\`\`\``,
        `\`\`\`User errored on:\`\`\`<@${message.author.id}>\n`,
        `\`\`\``,
        `Message sent:\`\`\`\`\`\``,
        `${message.content.replace(/`/g, "\\\`")}\`\`\``,
        `\`\`\``,
        `${err.join("\n")}\`\`\``
    ].join('\n'));
}
function sqlError(message, err, res) {
    message.channel.send("```\nWhoops! It appears there was some sort of error with the database! Not sure if it's my fault or not, but Xyvy will look into it!```");
    let query = res.replace(/`/g, "\\`").length > 1500 ? "Check console" : res.replace(/`/g, "\\`");
    if (query == "Check console")
    {
        console.log(res);
        setTimeout(function() {
            console.log(res);
        }, 60000);
    }
    return client.guilds.get("399327996076621825").channels.get("478371618620571648").send([
        `\`\`\`Server: ${message.channel.guild.name} (${message.channel.guild.id})`,
        `Channel: ${message.channel.name} (${message.channel.id})\`\`\``,
        `\`\`\``,
        `Query:\`\`\`\`\`\`sql`,
        `${query}\`\`\``,
        `\`\`\``,
        `${err}\`\`\``
    ].join('\n'));
}

function command(message) {
    let a = message.channel.type == "dm" ? "user" : "guild";
    let args = message.content.split(/ {1,}/);
    let arg = args.shift().replace("x!", '').toLowerCase();
    let cmd = Object.keys(aliases[a]).filter(alias => aliases[a][alias].includes(arg))[0] || false;
    let input = args.join(' ');
    if (!cmd)
    {
        return;
    }
    let sendChat = function(content, options) {
        if (typeof content == "string")
        {
            content = content.replace(/\$user\$/g, `<@${message.author.id}>`);
        }
        if (options == undefined)
        {
            message.channel.send(content);
        }
        else
        {
            message.channel.send(content, options);
        }
    }

    try
    {
        return commands[cmd](arg, args, input, message, sendChat);
    }
    catch (error)
    {
        let errs = [];
        for (let i = 0; i < error.stack.split('\n').length; i++)
        {
            if (error.stack.split('\n')[i].includes("at Client.emit"))
            {
                break;
            }
            else
            {
                errs.push(error.stack.split('\n')[i]);
            }
        }
        message.channel.send("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~```");
        botError(message, errs);
    }
}
   
function other(message) {
    let sendChat = function(content, options) {
        if (typeof content == "string")
        {
            content = content.replace(/\$user\$/g, `<@${message.author.id}>`);
        }
        if (options == undefined)
        {
            message.channel.send(content);
        }
        else
        {
            message.channel.send(content, options);
        }
    }
    if (message.author.bot && message.author.id !== "561578790837289002")
    {
        return;
    }

    if (message.channel.type == "dm" && Array.from(message.attachments).length > 0)
    {
        images = Array.from(message.attachments).map(m => m[1].url);
        client.guilds.get("399327996076621825").channels.get("537098266685472788").send(`Images from user <@${message.author.id}>: \n${images.join('\n')}`);
    }
    if (games.games.filter(game => game.channels.hasOwnProperty(message.channel.id) && game.started).length == 1)
    {
        let game = games.games.filter(game => game.channels.hasOwnProperty(message.channel.id))[0];
        if (message.author.id == game.player && {
            "squares": /^([a-j] ?(?:10|[1-9])|(?:10|[1-9]) ?[a-j])$/i,
            "othello": /^([a-h][1-8]|[1-8][a-h])$/i,
            "gomoku": /^([a-s] ?1?[0-9]{1,}|1?[0-9]{1,} ?[a-s])$/i,
            "connect4": /^[1-7]$/,
            "3dttt": /^[1-4] ?([1-4] ?[a-d]|[a-d] ?[1-4])$/i
        }[game.game].test(message.content))
        {
            if (message.channel.type !== "dm")
            {
                setTimeout(function() {
                    message.delete();
                }, 5000);
            }
            try
            {
                games[game.game].takeTurn(message.channel.id, message.content);
            }
            catch (error)
            {
                games.games.forEach((game, index) => {
                    if (game.channels.hasOwnProperty(message.author.id))
                    {
                        for (let i = 0; i < game.channels.length; i++)
                        {
                            client.channels.get(game.channels[0]).send("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough~```");
                        }
                        delete game;
                        games.games.splice(index, 1);
                    }
                });
                let errs = [];
                for (let i = 0; i < error.stack.split('\n').length; i++)
                {
                    if (error.stack.split('\n')[i].includes("at Client.emit"))
                    {
                        break;
                    }
                    else
                    {
                        errs.push(error.stack.split('\n')[i]);
                    }
                }
                return client.guilds.get("399327996076621825").channels.get("467902250128506880").send(botError(message, errs));
            }
        }
        if (["board", "showboard"].includes(message.content))
        {
            sendChat(`It is <@${game.player}>'s turn.`, game.buffer);
        }
    }
}
   
function bot(message) {
    if (message.attachments.array().length != 0)
    {
        let img = message.attachments.first().filename;
        if (/^(connect4|squares|othello|gomoku|ttt3d)_[0-2]_[0-9]{1,}(|vs[0-9]{1,})\.png$/.test(img))
        {
            let game = games.games.filter(game => game.channels.hasOwnProperty(message.channel.id))[0];
            let end = img.match(/_[0-2]_/)[0].substring(1, 2);
            if (end === '0')
            {
                return game.channels[message.channel.id].push(message.id);
            }
            let result = false;
            if (end === '1')
            {
                result = {
                    winner: game.players[game.winner],
                    loser: game.players[game.winner == 0 ? 1 : 0],
                    game: JSON.stringify(["othello", "squares", "gomoku", "ttt3d", "connect4"].indexOf(game.game) + 1),
                    score: game.score
                };
            }
            games.games.forEach((game, index) => {
                if (game.channels.hasOwnProperty(message.channel.id))
                {
                    for (let i = 0; i < game.channels.length; i++)
                    {
                        client.channels.get(game.channels[0]).send("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough~```");
                    }
                    delete game;
                    games.games.splice(index, 1);
                }
            });

            if (result)
            {
                db.query([
                    `SELECT *`,
                    `FROM profiles`,
                    `WHERE id = '${result.winner}' OR id = '${result.loser}'`
                ].join('\n'), function(err, res) {
                    if (err)
                    {
                        sqlError(message, err, [
                            `SELECT *`,
                            `FROM profiles`,
                            `WHERE id = '${result.winner}' OR id = '${result.loser}'`
                        ].join('\n'));
                    }
                    let wins;
                    let lose;
                    if (res.rows.length == 0)
                    {
                        wins = newUser(result.winner, message);
                        lose = newUser(result.loser, message);
                    }
                    else
                    if (res.rows.length == 2)
                    {
                        wins = res.rows[0].id == result.winner ? res.rows[0] : res.rows[1];
                        lose = res.rows[0].id == result.loser ? res.rows[0] : res.rows[1];
                    }
                    else
                    if (res.rows[0].id == result.winner)
                    {
                        lose = newUser(result.loser, message);
                        wins = res.rows[0];
                    }
                    else
                    if (res.rows[0].id == result.loser)
                    {
                        lose = res.rows[0];
                        wins = newUser(result.winner, message);
                    }
                    if (wins["win" + result.game] + wins["los" + result.game] == 0)
                    {
                        wins["elo" + result.game] = 1000;
                    }
                    if (lose["win" + result.game] + lose["los" + result.game] == 0)
                    {
                        lose["elo" + result.game] = 1000;
                    }
                    let booty = Math.ceil(lose["elo" + result.game] / 10);
                    let query = [
                        `UPDATE profiles`,
                        `SET elo${result.game} = ${wins["elo" + result.game] + booty}, win${result.game} = ${wins["win" + result.game] + 1}`,
                        `WHERE id = '${wins.id}';`,
                        ``,
                        `UPDATE profiles`,
                        `SET elo${result.game} = ${lose["elo" + result.game] - booty}, los${result.game} = ${lose["los" + result.game] + 1}`,
                        `WHERE id = '${lose.id}';`
                    ].join('\n');
                    return db.query(query, function(err) {
                        if (err)
                        {
                            return sqlError(message, err, query);
                        }
                    });
                });
            }
        }
    }
    else
    if (games.games.filter(game => game.channels.hasOwnProperty(message.channel.id)).length == 1)
    {
        let game = games.games.filter(game => game.channels.hasOwnProperty(message.channel.id));
        if (/<@[0-9]{1,}> is now requesting a new game of (Connect 4|Squares|Othello|Gomoku), say `x![3a-z]{1,} start` to play against them!/.test(message.content) || [
            "Column is full, please pick another.",
            "There's already a stone there, pick another spot!",
        ].includes(message.content))
        {
            game.lastDisplays[game.channels.indexOf(message.channel.id)] = message;
        }
    }
}
   
function newUser(id, message) {
    let image = images.ids.random();
    let query = [
        `INSERT INTO profiles (`,
        `    id,       color,   title,      titles,             background,  backgrounds,         lefty,  elo1,  elo2,  elo3,  elo4,  elo5,  elo6,  elo7,  win1,  win2,  win3,  win4,  win5,  win6,  win7,  los1,  los2,  los3,  los4,  los5,  los6,  los7`,
        `) VALUES (`,
        `    '${id}',  '#aaa',  'default',  ARRAY ['default'],  '${image}',  ARRAY ['${image}'],  true,   0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0`,
        `)`
    ].join('\n');
    db.query(query, function(err) {
        if (err)
        {
            return sqlError(message, err, query);
        }
    });
    return {
        id: id,
        color: "#aaa",
        title: "default",
        titles: ["default"],
        background: image,
        backgrounds: [image],
        lorr: "right",
        money: 0,
        elo1: 1000,
        elo2: 1000,
        elo3: 1000,
        elo4: 1000,
        elo5: 1000,
        elo6: 1000,
        elo7: 1000,
        win1: 0,
        win2: 0,
        win3: 0,
        win4: 0,
        win5: 0,
        win6: 0,
        win7: 0,
        los1: 0,
        los2: 0,
        los3: 0,
        los4: 0,
        los5: 0,
        los6: 0,
        los7: 0
    };
}

var aliases = {
    guild: {
        // Competitive Games
        "games": ["games"],
        "othello": ["othello", "reversi"],
        "squares": ["squares"],
        "gomoku": ["gomoku", "gobang", "renju"],
        "ttt3d": ["3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe"],
        "connect4": ["connectfour", "connect4", "cfour", "c4"],
        "profile": ["profile", "scorecard", "prof"],

        // Small Games
        "hangman": ["hangman", "hm"],
        "math": ["math", "quickmath", "quickmaffs", "maffs"],
        "iq": ["iq", "fakeiqtest", "fakeiqquiz", "fakeiq"],
        "sequence": ["sequence", "pattern"],
        "shuffle": ["shuffle", "scramble"],
        "minesweeper": ["minesweeper", "ms", "mines"],
       
        // Utility
        "about": ["about", "info", "bot"],
        "help": ["help", "hlep", "je;[", "geko", "helo", "halp", "hlp", "hekp", "he;p", "commands"],
        "avatar": ["avatar", "pfp"],
        "aliases": ["aliases"],
        "guild": ["guild", "server"],
        "kick": ["kick"],
        "ban": ["ban"],
        "bug": [],
        "request": [],
       
        // Miscellaneous
        "nekos": ["nekos", "neko", "nya", "catgirl", "catgirls", "nekomimi"],
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
        "games": ["games"],
        "game": ["game", "othello", "reversi", "squares", "gomoku", "gobang", "renju", "3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe", "connectfour", "connect4", "cfour", "c4"],
        "profile": ["profile", "scorecard", "prof"],
    
        // Small Games
        "hangman": [],
        "math": [],
        "iq": [],
        "sequence": [],
        "shuffle": [],
        "minesweeper": ["minesweeper", "ms", "mines"],
       
        // Utility
        "about": ["about", "info", "bot"],
        "help": ["help", "hlep", "je;[", "geko", "helo", "halp", "hlp", "hekp", "he;p", "commands"],
        "avatar": ["avatar", "pfp"],
        "aliases": ["aliases"],
        "guild": [],
        "kick": [],
        "ban": [],
        "bug": ["reportbug", "bugreport", "bug", "report"],
        "request": ["request", "suggest", "suggestion", "requestion"],
       
        // Miscellaneous
        "nekos": ["nekos", "neko", "nya", "catgirl", "catgirls", "nekomimi"],
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
        if (!args[0])
        {
            let embed = new Discord.RichEmbed();
            embed.setDescription("Input tree for command x!games\n`x!games [input]`");
            embed.addField("leaderboard", "View the players with the 10 highest Elos for every game or the players with the 10 highest combined Elos.\n`x!games leaderboard [game]`\nLeave `[game]` blank for general top 10 players.");
            embed.addField("stats", "View either your stats or another player's stats.");
            embed.addField("info", "A detailed information about how the Elo system works and the entire ranking system in general.");
            embed.addField("games", "A list of all the games that are a part of the ranking system and a few details about them.");
            embed.setColor(new Color().random());
            sendChat({embed});
        }
        if (["leaderboard", "top"].includes(args[0]))
        {
            let elos = false;
            let gms = {
                "othello": ["othello", "reversi"],
                "squares": ["squares"],
                "gomoku": ["gomoku", "gobang", "renju"],
                "ttt3d": ["ttt3d", "3dttt", "3dtictactoe", "tictactoe3d", "ttt", "tictactoe"],
                "connect4": ["connect4", "connectfour", "cfour", "c4"]
            };
            if (!args[1])
            {
                elos = "elo1 + elo2 + elo3 + elo4 + elo5";
            }
            if (gms.othello.includes(args[1]))
            {
                elos = "elo1";
            }
            if (gms.squares.includes(args[1]))
            {
                elos = "elo2";
            }
            if (gms.gomoku.includes(args[1]))
            {
                elos = "elo3";
            }
            if (gms.ttt3d.includes(args[1]))
            {
                elos = "elo4";
            }
            if (gms.connect4.includes(args[1]))
            {
                elos = "elo5";
            }
            if (!elos)
            {
                return sendChat("Unknown game.");
            }
            
            let wins = elos.replace(/elo/g, "win");
            let loss = elos.replace(/elo/g, "los");
            if (!args[1])
            {
                elos = "round((" + elos + ") / 5)";
            }
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
                if (err)
                {
                    return sqlError(message, err, query);
                }
                if (!res || res.length !== 3)
                {
                    return sqlError(message, "No res", query);
                }
                if (res[0].rows.length > 0)
                {
                    let top = [];
                    for (let i = 0; i < res[0].rows.length; i++)
                    {
                        top.push(res[0].rows[i]);
                    }
                    let game;
                    if (!args[1])
                    {
                        game = "All Games"
                    }
                    else
                    {
                        game = ["Othello", "Squares", "Gomoku", "3D Tic Tac Toe", "Connect Four"][elos[3] - 1];
                    }

                    let users = [];
                    for (let i = 0; i < top.length; i++) {
                        if (i == 0)
                        {
                            top[i].place = i + 1;
                        }
                        else
                        if (top[i].elo == top[i - 1].elo && top[i].ci_lower_bound == top[i - 1].ci_lower_bound)
                        {
                            top[i].place = top[i - 1].place;
                        }
                        else
                        {
                            top[i].place = i + 1;
                        }

                        let place = top[i].place;
                        let id = top[i].id;
                        let elo = top[i].elo;
                        let win = top[i].win;
                        let los = top[i].los;
                        let w_l = win + los > 0 ? (win / (win + los) * 100).toFixed(2) + '%' : "\u034f \u034f N/A \u034f \u034f";

                        users.push('`' + '\u034f '.repeat(5 - String(place).length) + place + ')` | `' + '\u034f '.repeat(5 - String(elo).length) + elo + "` | `" + '\u034f '.repeat(3 - String(win).length) + win + "` / `" + los + ' \u034f'.repeat(3 - String(los).length) + "` (`" + '\u034f '.repeat(w_l !== "\u034f \u034f N/A \u034f \u034f" ? 7 - w_l.length : 0) + w_l + "`) | <@" + id + '>');
                    }
                    if (res[1].rows.length != 0)
                    {
                        users.push('');
                        users.push("Your rank:")
                        let user = res[1].rows[0];
                        let place = res[2].rows[0].place;
                        let id = user.id;
                        let elo = user.elo;
                        let win = user.win;
                        let los = user.los;
                        let w_l = win + los > 0 ? (win / (win + los) * 100).toFixed(2) + '%' : "\u034f \u034f N/A \u034f \u034f";

                        users.push('`' + '\u034f '.repeat(5 - String(place).length) + place + ')` | `' + '\u034f '.repeat(5 - String(elo).length) + elo + "` | `" + '\u034f '.repeat(3 - String(win).length) + win + "` / `" + los + ' \u034f'.repeat(3 - String(los).length) + "` (`" + '\u034f '.repeat(w_l !== "\u034f \u034f N/A \u034f \u034f" ? 7 - w_l.length : 0) + w_l + "`) | <@" + id + '>');
                    }
                    let embed = new Discord.RichEmbed();
                    embed.setTitle("Leaderboard for " + game);
                    embed.setDescription("__`\u034f RANK \u034f` | `\u034f Elo \u034f` | `\u034f W \u034f` / `\u034f L \u034f` (`WINRATE`) | <@USER>__\n" + users.join('\n'));
                    embed.setColor(new Color().random());
                    sendChat({embed});
                }
                else
                {
                    if (!args[1])
                    {
                        return sendChat("There are no scores. Nobody has played any game, yet.");
                    }
                    else
                    {
                        return sendChat("There are no scores for htis game. Nobody has played it, yet."); 
                    }
                }
            });
        }
        if (["stats", "statistics"].includes(args[0])) {
            let id = message.author.id;
            let gm = "all";
            let gms = {
                "othello": ["othello", "reversi"],
                "squares": ["squares"],
                "gomoku": ["gomoku", "gobang", "renju"],
                "ttt3d": ["ttt3d", "3dttt", "3dtictactoe", "tictactoe3d", "ttt", "tictactoe"],
                "connect4": ["connect4", "connectfour", "cfour", "c4"]
            };
            let Games = [].concat(gms.othello, gms.squares, gms.gomoku, gms.ttt3d, gms.connect4);
            if (args.length == 2)
            {
                if (/^[0-9]{1,}$/.test(args[1]) || /^<@[0-9]{1,}>$/.test(args[1]))
                {
                    id = args[1];
                }
                else
                if (Games.includes(args[1]))
                {
                    gm = args[1];
                }
                else
                {
                    return sendChat("I can't do that.");
                }
            }
            else
            if (args.length == 3)
            {
                if ((/^[0-9]{1,}$/.test(args[1]) || /^<@[0-9]{1,}>$/.test(args[1])) && Games.includes(args[2]))
                {
                    id = args[1];
                    gm = args[2]
                }
                else
                if ((/^[0-9]{1,}$/.test(args[2]) || /^<@[0-9]{1,}>$/.test(args[2])) && Games.includes(args[1]))
                {
                    id = args[2];
                    gm = args[1];
                }
                else
                {
                    return sendChat("I can't do that.");
                }
            }
            else
            {
                return sendChat("I can't do that.");
            }

            let Gm = false;

            if (gm == "all")
            {
                Gm = "all";
            }
            else
            {
                Gm = Object.keys(gms).indexOf(Object.keys(gms).filter(x => gms[x].includes(gm))[0]) + 1;
            }
            if (Gm)
            {
                let query = [
                    `SELECT *`,
                    `FROM profiles`,
                    `WHERE id = '${id}';`
                ].join('\n');
                return db.query(query, function(err, res) {
                    if (err)
                    {
                        sqlError(message, err, query);
                    }
                    let user;
                    if (res.rows.length == 0)
                    {
                        user = newUser(message.author.id, message);
                    }
                    else
                    {
                        user = res.rows[0];
                    }

                    let embed = new Discord.RichEmbed();
                    embed.setTitle("User Statistics for " + (Gm == "all" ? "all games" : ["Othello", "Squares", "Gomoku", "3D Tic Tac Toe", "Connect Four"][Gm - 1]));

                    if (Gm == "all")
                    {
                        let ok = [];
                        for (let i = 0; i < 5; i++)
                        {
                            let game = ["Othello", "Squares", "Gomoku", "3D Tic Tac Toe", "Connect Four"][i];
                            let elo = user["elo" + (i + 1)];
                            let win = user["win" + (i + 1)];
                            let los = user["los" + (i + 1)];
                            let w_l = win + los > 0 ? (win / (win + los) * 100).toFixed(2) + '%' : "\u034f \u034f N/A \u034f \u034f";
                            ok.push('`' + game + ' \u034f'.repeat(17 - game.length) + '` | `' + '\u034f '.repeat(5 - String(elo).length) + elo + "` | `" + '\u034f '.repeat(3 - String(win).length) + win + "` / `" + los + ' \u034f'.repeat(3 - String(los).length) + "` (`" + '\u034f '.repeat(w_l !== "\u034f \u034f N/A \u034f \u034f" ? 7 - w_l.length : 0) + w_l + "`)");
                        }
                        embed.setDescription("**User**: <@" + id + ">\n__`\u034f \u034f \u034f \u034f Game Name \u034f \u034f \u034f \u034f`__ | __`\u034f Elo \u034f`__ | __`\u034f W \u034f`__ / __`\u034f L \u034f`__ (__`\u034f WIN % \u034f`__)\n" + ok.join("\n"));
                    }
                    else
                    {
                        embed.setDescription("**User**: <@" + id + ">\n**__Game__: " + ["Othello", "Squares", "Gomoku", "3D Tic Tac Toe", "Connect Four"][Gm - 1] + "\n__Elo__: " + user["elo" + Gm] + "\n__W/L (%)__: " + user["win" + Gm] + "/" + user["los" + Gm] + " (" + (user["win" + Gm] + user["los" + Gm] > 0 ? Math.round(user["win" + Gm] / (user["win" + Gm] + user["los" + Gm]) * 10000) / 100 : "N/A") + "%)**");
                    }

                    embed.setColor(new Color().random());
                    return sendChat({embed});
                });
            }
            else
            {
                botError(message, "`Gm` was not set to something despite being logically able to reach that point. This error should not ever appear for any reason other than JavaScript itself has broke.");
                return sendChat("Unknown error. Seriously, somebody help me, this should not be JavaScriptily possible.");
            }
        }
        else
        if (["info", "about"].includes(args[0]))
        {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Information");
            embed.setDescription("I, Xyvyrianeth (I'm speaking through this bot), am a big fan of [abstract strategy games](https://en.wikipedia.org/wiki/Abstract_strategy_game). I like them so much I tried to create my own competetive social network in Discord that revolves around a select few of these types of games. Whether or not that dream will come true is yet to be seen, but I still have hope and am still pushing towards that goal.");
            embed.addField("\u034f", "Like every network of competition, there needs to be a way to evaluate who's better than who. Most PvP games, like League of Legends, have a score called attached to each player called Elo. Elo is most likely a number of some sort, and the method in which players can gain or lose Elo differs for each game. In some games, you gain Elo exclusively by winning and lose it exclusively from losing. In other games, Elo gained or lossed is based on the player's personal evaluation in a given match, and winning or losing only somewhat or doesn't affect it.");
            embed.addField("\u034f", "For my bot, I used a system I heard from a friend (I don't know if he made it up or heard it from somewhere else or not, but credit goes to you, WholeWheatThins). Basically, everyone starts out with an Elo of 1000. After a game ends, the loser loses 10% of their Elo (rounded up) and it goes to the winner.\nIf the loser of a game had 1000 Elo, they lose 100, which goes to the winner.\nIf the loser had 1500 Elo, they lose 150.\nIf 5 Elo, they lose 1 (10% of 5 rounded up is 1. You stop losing Elo from losing when you have no Elo left to lose).\nWith this system, you better benefit winning against people who are supposedly better than you are. You don't gain much from beating people who aren't very good, and that applies to both Elo and your own skill of the game you suck at because you only play against other people who suck, so git gud.");
            embed.addField("\u034f", "Elos can be sorted either by game or totally, which is average Elo for all games (some people might only care about Othello). Everyone has their own Elo, but those numbers can sometimes end up being the same for multiple users, so instead of sorting by alphabetical order next, we'll use the [Lower bound of Wilson score confidence interval for a Bernoulli parameter](https://www.evanmiller.org/how-not-to-sort-by-average-rating.html): A user with 500 wins and 500 losses will score above someone with 5 wins and 1 loss, and the user with 5 wins and 1 loss will score above someone with 500 wins and 1000 losses. It's the perfect balance between net positive results (`wins - losses`) and average results (`wins / (wins + losses)`).\nIf two users have the same Elo *and* the same number of wins and losses, *then* we'll sort them by ID, I guess.");
            embed.addField("\u034f", "For now, these scores and such won't mean anything other than a way to sort out the best. Until I think enough people are playing games on my bot, I won't be forming any sort of tournaments, and Elos will never be reset. Get more people using this bot and I might change that.");
            embed.setColor(new Color().random());
            return sendChat({embed});
        }
        else
        if (["games"].includes(args[0]))
        {
            let embed = new Discord.RichEmbed();
            embed.setDescription("I currently have 4 games, and plan to add more.\n\n**Games**: Othello, Squares, 3D Tic-Tac-Toe, Connect Four\n**Planned**: Gomoku\n\nI chose these games ~~mostly because they're very simple games with very simple rules and mechanics and they're easy to calculate who won and who lost and~~ because they're easy for people to learn, easy for people to get into, easy for people to get good at. I'm never going to add Chess or Go ~~because they're both complicated in terms of mechanics and win/lose/end-game criteria and~~ because they're not easy to learn, not easy to play, not easy to become skilled at. Plus, they take ***foreverrrrrr*** to play.\n\nBefore I decide the bot is \"complete,\" I want at least 10 games. However, deciding what games I want to add to the bot is not gonna be easy, so toss me some suggestions using x!request (make sure it's an [abstract strategy game](https://en.wikipedia.org/wiki/Abstract_strategy_game) before you suggest it my way).");
            embed.setColor(new Color().random());
            sendChat({embed});
        }
    },

    "othello": function(cmd, args, input, message, sendChat) {
        return commands.game("othello", args, input, message, sendChat);
    },

    "squares": function(cmd, args, input, message, sendChat) {
        return commands.game("squares", args, input, message, sendChat);
    },

    "gomoku": function(cmd, args, input, message, sendChat) {
        return commands.game("gomoku", args, input, message, sendChat);
    },

    "ttt3d": function(cmd, args, input, message, sendChat) {
        return commands.game("ttt3d", args, input, message, sendChat);
    },

    "connect4": function(cmd, args, input, message, sendChat) {
        return commands.game("connect4", args, input, message, sendChat);
    },

    "game": function(cmd, args, input, message, sendChat) {
        let gameName = cmd;
        let GameName = {
            "othello": "Othello",
            "squares": "Squares",
            "gomoku": "Gomoku",
            "ttt3d": "3D Tic Tac Toe",
            "connect4": "Connect Four"
        }[gameName];
        if (!input)
        {
            return sendChat(`__**${GameName}**__\nTo start a game, type \`x!${cmd} start\`!`);
        }
        function condition(condition) {
            return {
                "noGame": function(game) {
                    return game.game == gameName
                },
                "waiting": function(game) {
                    return game.game == gameName && !game.started;
                },
                "playingYourself": function(game) {
                    return game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.game == gameName && !game.started;
                },
                "somethingElseHere": function(game) {
                    return game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.game !== gameName && !game.started;
                },
                "someoneElseHere": function(game) {
                    return game.channels.hasOwnProperty(message.channel.id) && game.game !== gameName && !game.started;
                },
                "gameStarted": function(game) {
                    return game.channels.hasOwnProperty(message.channel.id) && game.started;
                },
                "alreadyQueued": function(game) {
                    return !game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.game == gameName;
                },
                "noGameHere": function(game) {
                    return game.channels.hasOwnProperty(message.channel.id);
                },
                "participant": function(game) {
                    return game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id);
                },
                "dontStart": function(game) {
                    return game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && !game.started;
                },
                "quit": function(game) {
                    return game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && game.started;
                }
            }[condition];
        }
        if (["start"].includes(args[0]))
        {
            if (games.games.filter(condition("alreadyQueued")).length != 0)
            {
                return sendChat("You are already queued for that game somewhere else!");
            }
            if (games.games.filter(condition("playingYourself")).length != 0)
            {
                return sendChat("You cannot play a game against yourself!");
            }
            if (games.games.filter(condition("somethingElseHere")).length != 0)
            {
                return sendChat("You're already queued for a different game in this channel!");
            }
            if (games.games.filter(condition("someoneElseHere")).length != 0)
            {
                return sendChat("Someone is already queueing for a game in this channel! Go to another one!");
            }
            if (games.games.filter(condition("gameStarted")).length != 0)
            {
                return sendChat("Someone is already playing a game in this channel!");
            }
            if (games.games.filter(condition("noGame")).length == 0)
            {
                games[gameName].newGame(message.channel.id, message.author.id);
            }
            else
            if (games.games.filter(condition("waiting")).length == 1)
            {
                let game = games.games.filter(condition("waiting"))[0];
                games[gameName].startGame(Object.keys(game.channels)[0], message.channel.id, message.author.id);
            }
        }
        else
        if (["quit", "forfeit", "leave"].includes(input))
        {
            if (games.games.filter(condition("noGameHere")).length == 0)
            {
                return sendChat("There is not a game in this channel for you to quit!");
            }
            else
            if (games.games.filter(condition("participant")).length == 0)
            {
                return sendChat(`You are not a participant of that game, <@${message.author.id}>!`);
            }
            else
            if (games.games.filter(condition("dontStart")).length == 1)
            {
                games.games.forEach((game, index) => {
                    if (game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && !game.started)
                    {
                        sendChat(`Pending game canceled, <@${message.author.id}>.`);
                        delete games[index];
                        games.games.splice(index, 1);
                    }
                });
            }
            else
            if (games.games.filter(condition("quit")).length == 1)
            {
                games.games.filter(game => game.channels.hasOwnProperty(message.channel.id))[0].forfeit = message.author.id;
            }

        }
        else
        if (["rules", "howtoplay"].includes(args[0]))
        {
            new Discord.RichEmbed();
            embed.setDescription({
                "connect4": "If you don't know how to play this game, you must have had a shitty childhood. You drop pieces into each row and try to get a row of 4 before your opponent, very simple.",
                "squares": "This game was created by Xyvy himself because he was bored and didn't want to work on Gomoku win logic one night. It's played almost exactly like Gomoku, except for the objective of the game and the limitless board size. The board size is always 10x10, and the object of the game is to have created more squares than your opponent before the end. You make a square by placing 4 of your stones in a square pattern. Stones can be a part of multiple squares, and squares can range in size from 2x2 to 10x10 (if you put a stone in all 4 corners of the map, that's a point to you!).\n\nTaking turns is the same as in Gomoku: 2 stones per turn, but whoever goes first only places 1 stone on their very first turn. This eliminates \"first player advantage\" where player 1 is the only one that will ever have more stones on the board than their opponent.\n\nThe game ends when there are no more empty spaces on the board. After that, the squares are counted for each player and the player with more squares is declared the winner.",
                "othello": "[Click here to learn how to play Othello!](https://www.wikipedia.org/wiki/Reversi#Rules)\nI don't really know how to explain it without pictures.",
                "gomoku": "Gomoku, also called Go Bang or Renju, in the simplest terms, is a very large game of Tic Tac Toe. The board is 19x19 instead of 3x3, and instead of a 3-in-a-row, you want a 5-in-a-row.\n\nTaking turns differs from traditional 1v1 board games like checkers in that each player does not get 1 move per turn. In Gomoku, both players get 2 moves per turn, but player 1 only gets one move on their very first turn. This removes what's known as \"player 1 advantage,\" which is very prevalent in Tic Tac Toe, where player 1 is able to have more pieces on the board than player 2, but player 2 can never have more pieces on the board than player 1.\n\nTo win, you must have 5 of your stones in a line. No more, no less. That's right: if you have 6 or more in a line, you do not win.",
                "ttt3d": "This game plays exactly like the game Tic Tac Toe: get 3 in a row, but instead of 3 you want 4 in a row. Also, you have another dimension to work with."
            }[gameName]);
            embed.setColor(new Color().random());
            return sendChat({embed});
        }
    },

    "profile": function(cmd, args, input, message, sendChat) {
        if (!input || /^<@[0-9]{1,}>$/.test(input) || /^[0-9]{1,}$/.test(input))
        {
            let member;
            if (!input)
            {
                member = message.channel.guild.members.get(message.author.id);
            }
            else
            if (message.channel.type !== "dm")
            {
                member = message.channel.guild.members.get(input.match(/[0-9]{1,}/)[0]);
            }
            else
            {
                return sendChat("Cannot display other users' profiles in DMs, yet, sorry~");
            }
  
            if (member == null)
            {
                return sendChat("User not found.");
            }
            else
            {
                member = member.user;
            }
   
            return db.query(`SELECT * FROM profiles WHERE id = '${member.id}'`, function(err, res) {
                if (err)
                {
                    return sqlError(message, err, `SELECT * FROM profiles WHERE id = '${member.id}'`);
                }
  
                let profile;
                if (res.rows.length == 0 && !input)
                {
                    profile = newUser(message.author.id, message);
                }
                else
                if (res.rows.length == 0)
                {
                    return sendChat("No user with that ID currently has a profile.");
                }
                else
                {
                    profile = res.rows[0];
                }

                Canvas.loadImage(member.avatar ? `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png").then(image1 => {
                    Canvas.loadImage('/app/img/backgrounds/' + profile.background.substring(0, 7) + (profile.background.substring(7) == 'p' ? ".png" : ".jpg")).then(image2 => {
                        return sendChat(`Profile for **${member.username}**:`, new Discord.Attachment(Profile["draw" + (profile.lefty ? "Left" : "Right")](member, profile, image1, image2), "profile.png"));
                    });
                }).catch(err => sendChat("```" + err + "```"));
            });
        }
        
        else
        if (input.startsWith('['))
        {
            return sendChat("With***out*** the brackets, you twit.");
        }
        else
        if (["background", "backgrounds", "bg", "bgs"].includes(args[0]))
        {
            if (!args[1] && !["backgrounds", "bgs"].includes(args[0]))
            {
                return db.query([
                    `SELECT *`,
                    `FROM profiles`,
                    `WHERE id = '${message.author.id}'`
                ].join('\n'), function(err, res) {
                    if (err)
                    {
                        return sendChat("```" + err + "```");
                    }
                    if (res.rows.length == 0)
                    {
                        return sendChat("You have not yet created a profile, so you do not yet have a background. If you want to change that fact, do `x!profile` right now!");
                    }
                    if (res.rows[0].backgrounds.length == 1)
                    {
                        return sendChat("This is your current background, $user$!\nTo get more backgrounds, do `x!profile background purchase` to get a new one!\n**Note**: buying a new background will give you a random one, but you will be able to keep it along with any previously owned backgrounds, such as the one you were given when you first created a profile. All backgrounds cost 20 Xuvys.", new Discord.Attachment("https://i.imgur.com/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == 'j' ? ".jpg" : ".png")));
                    }

                    return sendChat("This is your current background, $user$! New backgrounds are still 20 Xuvys.\nDo `x!profile backgrounds` to view the other backgrounds you own.", new Discord.Attachment("https://i.imgur.com/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == 'j' ? ".jpg" : ".png")));
                });
            }
            else
            if (["owned"].includes(args[1]) || (!args[1] && ["backgrounds", "bgs"].includes(args[0])))
            {
                return db.query([`SELECT *`,
                    `FROM profiles`,
                    `WHERE id = '${message.author.id}'`
                ].join('\n'), function(err, res) {
                    if (err)
                    {
                        return sqlError(message, err, [
                            `SELECT *`,
                            `FROM profiles`,
                            `WHERE id = '${member.id}'`
                        ].join('\n'));
                    }
                    if (res.rows.length == 0)
                    {
                        return sendChat("You have not yet created a profile, so you cannot view the backgrounds you own. If you want to change that fact, do `x!profile` right now!");
                    }
                    if (res.rows[0].backgrounds.length == 1)
                    {
                        return sendChat("You only have 1 background, and it's the one you have equipped.");
                    }
                    let b1 = res.rows[0].backgrounds;
                    let b2 = [];
                    for (let i = 0; i < res.rows[0].backgrounds.length; i++) {
                        if (b1[i] !== res.rows[0].background)
                        {
                            b2.push('[' + images.titles[b1[i]] + "](" + b1[i] + ')');
                        }
                        else
                        {
                            b2.push('[' + images.titles[b1[i]] + "](" + b1[i] + ') (Equipped)');
                        }
                    }
                    return sendChat(`\`\`\`md\n# All Backgrounds owned by user ${res.rows[0].id}:\n\n  [Background Title](background ID)\n\n  ${b2.join("\n  ")}\n\nIf you wish to equip any of these, do \`x!profiles background [title ID]\` (capitals are important!)\`\`\``);
                });
            }
            else
            if (["buy", "purchase"].includes(args[1]))
            {
                return db.query([
                    `SELECT *`,
                    `FROM profiles`,
                    `WHERE id = '${message.author.id}'`
                ].join('\n'), function(err, res) {
                    if (err)
                    {
                        return sqlError(message, err, [
                            `SELECT *`,
                            `FROM profiles`,
                            `WHERE id = '${member.id}'`
                        ].join('\n'));
                    }
                    if (res.rows.length == 0)
                    {
                        return sendChat("You have not yet created a profile, so you cannot yet purchase a new background. If you want to change that fact, do `x!profile` right now!");
                    }
                    if (res.rows[0].backgrounds.length == images.ids.length)
                    {
                        return sendChat("There are no more backgrounds for you to purchase, because you've got them all already! When new ones are added, you'll be able to buy more, okay~?");
                    }
                    if (res.rows[0].money < 20)
                    {
                        return sendChat("You do not have enough money to buy another background! Get more money by playing games (and winning)!");
                    }
  
                    newbg = images.ids.random();
                    do
                    {
                        newbg = images.ids.random();
                    }
                    while (res.rows[0].backgrounds.includes(newbg));
                    res.rows[0].backgrounds.push(newbg);
                    return db.query([
                        `UPDATE profiles`,
                        `SET backgrounds = ARRAY ${JSON.stringify(res.rows[0].backgrounds).replace(/"/g, "'")}, money = '${res.rows[0].money - 20}'`,
                        `WHERE id = '${message.author.id}'`
                    ].join('\n'), function(err) {
                        if (err)
                        {
                            sqlError(message, err, [
                                `UPDATE profiles`,
                                `SET backgrounds = ARRAY ${JSON.stringify(res.rows[0].backgrounds).replace(/"/g, "''")}, money = '${res.rows[0].money - 20}'`,
                                `WHERE id = '${message.author.id}'`
                            ].join('\n'));
                        }
                        else
                        {
                            return sendChat("Successfully purchased a new background! To equip it, do `x!profile background [background ID]`. New background ID: `" + newbg + '`', new Discord.Attachment("./img/backgrounds/" + newbg.substring(0, 7) + (newbg.substring(7) == 'j' ? ".jpg" : ".png")));
                        }
                    });
                });
            }
            else
            if (/^[a-zA-Z0-9]{7}[jp]$/.test(args[1]))
            {
                if (!images.ids.includes(args[1]))
                {
                    return sendChat("That image ID does not exist. Did you make sure you capitalized the correct letters? That's important, you know.");
                }
                return db.query([
                    `SELECT *`,
                    `FROM profile`,
                    `WHERE id = '${message.author.id}'`
                ].join('\n'), function(err, res) {
                    if (err)
                    {
                        return sqlError(message, err, [
                            `SELECT *`,
                            `FROM profile`,
                            `WHERE id = '${member.id}'`
                        ].join('\n'));
                    }
                    if (res.rows.length == 0)
                    {
                        return sendChat("You have not yet created a profile, so you cannot yet equip a new background. If you want to change that fact, do `x!profile` right now!");
                    }
                    if (!res.rows[0].backgrounds.includes(args[1]))
                    {
                        return sendChat("You do not own that background!");
                    }
                    return db.query([
                        `UPDATE profiles`,
                        `SET background = '${args[1]}'`,
                        `WHERE id = '${message.author.id}'`
                    ].join('\n'), function(err) {
                        if (err)
                        {
                            sqlError(message, err, [
                                `UPDATE profiles`,
                                `SET background = '${args[1]}'`,
                                `WHERE id = '${message.author.id}'`
                            ].join('\n'));
                        }
                        else
                        {
                            return sendChat("Successfully equipped the background `" + args[1] + "`!");
                        }
                    });
                });
            }
            else
            if (args[1].startsWith('['))
            {
                return sendChat("With***out*** the brackets, you twit.");
            }
            else
            {
                return sendChat("Unknown request.");
            }
        }
        else
        if (["lefty", "sidedisplay", "displayside", "displaylorr", "leftorright", "rightorleft"].includes(args[0]))
        {
            return db.query([
                `SELECT *`,
                `FROM profiles`,
                `WHERE id = '${message.author.id}'`
            ].join('\n'), function(err, res) {
                if (err)
                {
                    return sqlError(message, err, [
                        `SELECT *`,
                        `FROM profiles`,
                        `WHERE id = '${member.id}'`
                    ].join('\n'));
                }
                if (res.rows.length == 0)
                {
                    return sendChat("You have not yet created a profile, so your information is displayed on neither the left nor the right. If you want to change that fact, do `x!profile` right now!");
                }
                return db.query([
                    `UPDATE profiles`,
                    `SET lefty = '${res.rows[0].lorr == true ? false : true}'`,
                    `WHERE id = '${message.author.id}'`
                ].join('\n'), function(err) {
                    if (err)
                    {
                        sqlError(message, err, [
                            `UPDATE profiles`,
                            `SET lefty = '${res.rows[0].lorr == true ? false : true}'`,
                            `WHERE id = '${message.author.id}'`
                        ].join('\n'));
                    }
                    else
                    {
                        return sendChat("Successfully updated your information display to the " + (res.rows[0].lorr == "left" ? "right" : "left") + " side!");
                    }
                });
            });
        }
        else
        if (["title", "titles"].includes(args[0]))
        {
            if (!args[1])
            {
                return db.query([
                    `SELECT *`,
                    `FROM profiles`,
                    `WHERE id = '${message.author.id}'`
                ].join('\n'), function(err, res) {
                    if (err)
                    {
                        return sqlError(message, err, [
                            `SELECT *`,
                            `FROM profiles`,
                            `WHERE id = '${member.id}'`
                        ].join('\n'));
                    }
                    if (res.rows.length == 0)
                    {
                        return sendChat("You have not yet created a profile, so you do not yet have any titles. If you want to change that fact, do `x!profile` right now!");
                    }
                    if (res.rows[0].titles.length == 1)
                    {
                        return sendChat("The only title you own is the title you currently have equipped. Get some more and then check back with me, okay~?");
                    }
                    let t1 = res.rows[0].titles;
                    let t2 = [];
                    for (let i = 0; i < res.rows[0].titles.length; i++)
                    {
                        if (t1[i] !== res.rows[0].title)
                        {
                            t2.push('[' + titles[t1[i]] + "](" + t1[i] + ')');
                        }
                        else
                        {
                            t2.push('[' + titles[t1[i]] + "](" + t1[i] + ') (Equipped)');
                        }
                    }
                    return sendChat("```md\n# All Titles owned by user:" + res.rows[0].id + ":\n\n  [Title Text](titleID)\n\n  " + t2.join("\n  ") + "\n\nIf you wish to equip any of these, do `x!profile title [titleID]` (capitals are important!)!```");
                });
            }
            if (args[1].startsWith('['))
            {
                return sendChat("With***out*** the brackets, you twit.");
            }
            if (!Object.keys(titles).includes(args[1]))
            {
                return sendChat("That title ID does not exist. Try again.");
            }
            return db.query([
                `SELECT *`,
                `FROM profiles`,
                `WHERE id = '${message.author.id}'`
            ].join('\n'), function(err, res) {
                if (err)
                {
                    return sqlError(message, err, [
                        `SELECT *`,
                        `FROM profiles`,
                        `WHERE id = '${member.id}'`
                    ].join('\n'));
                }
                if (res.rows.length == 0)
                {
                    return sendChat("You have not yet created a profile, so you do not yet have the ability to change your title. If you want to change that fact, do `x!profile` right now!");
                }
                return db.query([
                    `UPDATE profiles`,
                    `SET title = '${args[1]}'`,
                    `WHERE id = '${message.author.id}'`
                ].join('\n'), function(err) {
                    if (err)
                    {
                        return sqlError(message, err, [
                            `UPDATE profiles`,
                            `SET title = '${args[1]}'`,
                            `WHERE id = '${message.author.id}'`
                        ].join('\n'));
                    }
                    return sendChat("Successfully updated your title to `" + titles[args[1]] + "`!");
                });
            });
        }
        else
        if (["color", "colors"].includes(args[0]))
        {
            if (!args[1])
            {
                return sendChat("Please include the color you wish to set your profile color to, and please make it a hexidecimal value ('#' followed by 3 or 6 digits and/or letters).");
            }
            else
            if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(args[1]))
            {
                return sendChat("That is not a color hexidecimal. Try again.");
            }
            return db.query([
                `SELECT *`,
                `FROM profiles`,
                `WHERE id = '${message.author.id}'`
            ].join('\n'), function(err, res) {
                if (err)
                {
                    return sqlError(message, err, [
                        `SELECT *`,
                        `FROM profiles`,
                        `WHERE id = '${member.id}'`
                    ].join('\n'));
                }
                if (res.rows.length == 0)
                {
                    return sendChat("You have not yet created a profile, so you do not yet have the ability to change your profile's color. If you want to change that fact, do `x!profile` right now!");
                }
                return db.query([
                    `UPDATE profiles`,
                    `SET color = '${(args[1].startsWith('#') ? '' : '#') + args[1]}'`,
                    `WHERE id = '${message.author.id}'`
                ].join('\n'), function(err) {
                    if (err)
                    {
                        return sqlError(message, err, [
                            `UPDATE profiles`,
                            `SET color = '${(args[1].startsWith('#') ? '' : '#') + args[1]}'`,
                            `WHERE id = '${message.author.id}'`
                        ].join('\n'));
                    }
                    let canvas = new Canvas.createCanvas(100, 40);
                    let ctx = canvas.getContext('2d');
                    ctx.fillStyle = (args[1].startsWith('#') ? '' : '#') + args[1];
                    ctx.fillRect(0, 0, 100, 40);
                    return sendChat("Successfully updated your color to `" + (args[1].startsWith('#') ? '' : '#') + args[1] + "`!", new Discord.Attachment(canvas.toBuffer()));
                });
            });
        }
        else
        if (["help"].includes(input))
        {
            return sendChat("**Available sub-commands for `x!profile`** (do `x!profile [subcommand]`):\n\n**backgrounds** - opens the background menu for changing your profile's background\n**displaylorr** - allows you to change which side all the text n stuff is displayed on in your profile\n**title** - can display your currently equipped title, your currently owned titles, or allows you to change your currently equipped title (if you know the ID for it)\n**color** - allows you to change the color your profile uses to display text");
        }
        else
        {
            return sendChat("Invalid syntax. Try `x!profile help` for more information on how to use this.");
        }
    },
   
    // Smaller Games

    "hangman": function(cmd, args, input, message, sendChat) {
        return sendChat("This game has not yet been implemented to this bot. Please be patient, it will be added eventually.");
    },

    "minesweeper": function(cmd, args, input, message, sendChat) {
        let w, h, d;
        if (["help"].includes(input))
        {
            let embed = new Discord.RichEmbed();
            embed.setAuthor(
                "MineSweeper",
                "https://cdn.discordapp.com/attachments/434783815047577610/543961408442990592/2000px-Minesweeper_flag.png"
            );
            embed.setDescription([
                "You can control 3 aspects of a game: height, width, and the number of bombs. Here are the 3 possible syntaxes:",
                "```md",
                "x!minesweeper [width] [height] [bombs]",
                "x!minesweeper [width] [height]",
                "x!minesweeper [bombs]",
                "```",
                "The maximum height you can set a game to is 20.",
                "The maximum width you can set a game to is 16, but may have to be lower depending on the height (max number of total tiles is 198).",
                "The maximum number of bombs depends on the number of tiles total (height * width). You can also set the number of bombs with a % instead of an exact number, OR you can use a preset difficulty (type `x!ms diff` to get a list)."].join('\n')
            );
            embed.addField(
                "Examples", [
                "```js",
                "`x!minesweeper 11 18 50`",
                "   // 11x18 board with 50 bombs",
                "`x!minesweeper 30`",
                "   // 10x10 board with 30 bombs",
                "`x!minesweeper 12 12`",
                "   // 12x12 board with 14 bombs",
                "`x!minesweeper 10 15 30%`",
                "   // 10x15 board with 45 bombs",
                "`x!minesweeper 14 14 hard`",
                "   // 14x14 board with 39 bombs",
                "```"].join('\n')
            );
            embed.setTitle("Help");
            embed.setColor(new Color().random());
            sendChat({embed});
        }
        else
        if (["diff", "difficulty", "difficulties"].includes(input))
        {
            let embed = new Discord.RichEmbed();
            embed.setAuthor(
                "MineSweeper",
                "https://cdn.discordapp.com/attachments/434783815047577610/543961408442990592/2000px-Minesweeper_flag.png"
            );
            embed.addField("5%", "`novice`\n`beginner`");
            embed.addField("10%", "`easy`\n`apprentice`");
            embed.addField("15%", "`medium`\n`normal`\n`adept`");
            embed.addField("20%", "`hard`\n`expert`");
            embed.addField("25%", "`legendary`\n`master`");
            embed.setTitle("Difficulties");
            embed.setColor(new Color().random());
            sendChat({embed});
        }
        else
        {
            h = !input || args.length == 1 || args.length > 3 ?
                    10 :
                !/^[1-9][0-9]{0,}$/.test(args[1]) ?
                    10 :
                Number(args[1]) > 20 ?
                    20 :
                Number(args[1]);
            w = !input || args.length == 1 || args.length > 3 ?
                    10 :
                !/^[1-9][0-9]{0,}$/.test(args[0]) ?
                    10 :
                Number(args[0]) * h > 198 ?
                    Math.floor(198 / h) > 16 ?
                        16 :
                    Math.floor(198 / h) :
                Number(args[0]) > 16 ?
                    16 :
                Number(args[0]);
            wh = w * h;
            D = args.length == 1 || args.length > 3 ?
                    args[1] :
                args.length == 3 ?
                    args[2] :
                "easy";
            d = !input ?
                    10 :
                args.length == 2 ?
                    Math.round(wh * 0.1) :
                /^[1-9][0-9]{0,}%?$/.test(D) ?
                    /%/.test(D) ?
                        Number(D.substring(0, D.length - 1)) > 100 ?
                            wh :
                        Math.round(wh * (Number(D.substring(0, D.length - 1)) / 100)) :
                    Number(D) > wh ?
                        wh :
                    Number(D) :
                "novice beginner easy apprentice medium normal adept hard expert legendary master".split(' ').includes(D) ?
                    Math.round(wh * {
                        "novice": 0.05,
                        "beginner": 0.05,
                        "easy": 0.1,
                        "apprentice": 0.1,
                        "medium": 0.15,
                        "normal": 0.15,
                        "adept": 0.15,
                        "hard": 0.2,
                        "expert": 0.2,
                        "legendary": 0.25,
                        "master": 0.25
                    }[D]) :
                Math.round(wh * 0.1);
            a = [];
            for (let y = h; y--;)
            {
                let b = [];
                for (let x = w; x--;)
                {
                    b.push(0);
                }
                a.push(b);
            }
            k = [];
            do
            {
                let x = Math.random() * w | 0;
                let y = Math.random() * h | 0;
                if (typeof a[y][x] == "number")
                {
                    a[y][x] = "☠";
                    k.push([y, x]);
                }
            }
            while (k.length < d);
            for (let b = d; b--;)
            {
                y = k[b][0];
                x = k[b][1];
                z = [true, true, true, true, true, true, true, true];
                if (y == 0)
                {
                    z[0] = z[1] = z[2] = false;
                }
                if (y == h - 1)
                {
                    z[4] = z[5] = z[6] = false;
                }
                if (x == 0)
                {
                    z[0] = z[7] = z[6] = false;
                }
                if (x == w - 1)
                {
                    z[2] = z[3] = z[4] = false;
                }
                for (let xy = 8; xy--;)
                {
                    if (z[xy])
                    {
                        Y = y + [-1, -1, -1, 0, 1, 1,  1,  0][xy];
                        X = x + [-1,  0,  1, 1, 1, 0, -1, -1][xy];
                        if (typeof a[Y][X] == "number")
                        {
                            a[Y][X] += 1;
                        }
                    }
                }
            }
            for (let y = h; y--;)
            {
                for (let x = w; x--;)
                {
                    if (typeof a[y][x] == "number")
                    {
                        a[y][x] = "0⃣ 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣".split(' ')[a[y][x]];
                    }
                }
            }
            for (let y = h; y--;)
            {
                a[y] = a[y].join("||||");
            }
            let embed = new Discord.RichEmbed();
            embed.setAuthor(
                "MineSweeper",
                "https://cdn.discordapp.com/attachments/434783815047577610/543961408442990592/2000px-Minesweeper_flag.png"
            );
            embed.setDescription("||" + a.join("||\n||") + "||");
            embed.setFooter("Height: " + h + " | Width: " + w + " | Bombs: " + d);
            embed.setColor(new Color().random());
            sendChat({embed});
        }
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
        if (!input || /^<@[0-9]{1,}>$/.test(input) || /^[0-9]{1,}$/.test(input))
        {
            let user;
            if (!input)
            {
                user = client.users.get(message.author.id);
            }
            else
            {
                user = client.users.get(input.match(/[0-9]{1,}/)[0]);
            }
  
            if (user == null)
            {
                return sendChat("User not found.");
            }

            let embed = new Discord.RichEmbed();
            embed.setTitle("User Avatar");
            embed.setDescription(`Avatar for <@${user.id}>`);
            embed.setImage(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=2048`);
            embed.setColor(new Color().random());
            return sendChat({embed});
        }
        else
        {
            return sendChat("Unknown request.");
        }
    },

    "help": function(cmd, args, input, message, sendChat) {
        if (!input)
        {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Help");
            embed.setDescription("A list of all commands supported by Bakeneko~\n" + (message.channel.type == "dm" ? "Some of these commands are not supported in servers" : "Some of these commands are not supported in DMs") + "`\nFor more help about any specific command, do \"`x![command]` `help`\"");
            let helps;
            helps = [
                    "`othello`  `squares`  `3dtictactoe`  `connect4`\n__Related Commands__:\n`games`  `profile`\n__Unimplemented__:\n`gomoku`  `ordo`  `ninemen`  `gonnect`",
                    "`minesweeper`\nUnimplemented:\n`hangman`  `quickmaffs`  `iq`  `sequence`  `shuffle`",
                    "`help`  `about`  `avatar`  `aliases`  `bugreport`  `request`",
                    "`nekos`  `calculate`  `graph`"
            ];
            if (message.channel.type == "dm")
            {
                helps[2] = helps[2].concat(["`bugreport", "`request"]);
            }
            embed.addField("Games", helps[0]);
            embed.addField("Smaller Games", helps[1]);
            embed.addField("Utility", helps[2]);
            embed.addField("Miscellaneous", helps[3]);
            if (message.channel.type == "dm" || message.channel.nsfw)
            {
                embed.addField("NSFW", `NSFW command only available in DMs or NSFW-marked channels (if you're seeing this, then you can use it here). Say \`x!nsfw help\` for a list of all the lewds I'm capable of.`);
            }
            embed.setColor(new Color().random());
            embed.setFooter("Xyvybot version " + version);
            return sendChat({embed});
        }
        else
        if (["games", "utility", "miscellaneous", "misc", "nsfw"].includes(input))
        {
            let embed = new Discord.RichEmbed();
            embed.setTitle(input.toUpperCase());
            embed.setDescription({
                "games": "Just a few board games, specifically [Abstract Strategy Games](https://en.wikipedia.org/wiki/Abstract_strategy_game). I'm not gonna add chess. No.",
                "utility": "Random stuffs that relate to the bot or users or servers.",
                "miscellaneous": "Other stuffs. Things that don't fit well in other categories.",
                "misc": "Other stuffs. Things that don't fit well in other categories.",
                "nsfw": "Lewd stuffs. Not available in server channels that aren't marked NSFW. It's stupid that some bots have created their own permission system to enable NSFW stuff in specific channels, like, just check if the channel is marked NSFW and you're good to go. It's 354% easier for the server owners than your stupid \"Sorry, NSFW commands are disabled here. Do `/bot commands enable nsfw` to enable them here!\" shit. Learn what's easy."
            }[input]);
        }
        else
        {
            Object.values(aliases[message.channel.type == "dm" ? "user" : "guild"]).forEach((alias, index) => {
                if (alias.includes(input))
                {
                    let help = [
                        ["x!games [leaderboard|statistics] (game name|user ID)", "The umbrella command for checking out all game statistics for any user in Discord.", "x!games statistics 357700219825160194"],
                        ["x!othello [start|rules]", "Othello, or Reversi, is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!othello start"],
                        ["x!squares [start|rules]", "Squares is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that I created that can be played with my bot against other people.", "x!squares start"],
                        ["x!gomoku [start|rules]", "Gomoku, or Go Bang, is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!gomoku start"],
                        ["x!ttt3d [start|rules]", "3D Tic Tac Toe is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!ttt3d start"],
                        ["x!connect4 [start|rules]", "Connect Four, or Vertical Checkers, is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!connect4 start"],
                        ["x!profile (user)", "Show of your own profile card that shows your game stats and rank. It has a customizable background and overlay color.", "x!profile 357700219825160194"],
                        ["x!hangman", "Play a quick game of hangman either by yourself or with your friends!", "x!hangman"],
                        ["x!math", "Returns a random math function and the first to solve it wins!", "x!math"],
                        ["x!iq", "Returns a simple puzzle, similar to one that might be found on an IQ test, and the first to solve it wins!", "x!iq"],
                        ["x!sequence", "Returns a series of numbers that have a pattern in their order, and the first to guess the next in the sequence wins!", "x!sequence"],
                        ["x!shuffle", "Returns a word that's had its letters all jumbled up, and the first to put the word back into the correct order wins!", "x!shuffle"],
                        ["x!minesweeper (width) (height) (difficulty)", "A classic game of Minesweeper right here on Discord. Wouldn't be possible without the ||spoiler|| feature.", "x!minesweeper 10 15 20%"],
                        ["x!about", "Just a bit of information about what this bot does and some history about it.", "x!about"],
                        ["x!help [command]", "Generates a list of commands, or gives a short description about a specific command.", "x!help help"],
                        ["x!avatar (user)", "Get a large version of a user's profile picture.", "x!avatar 357700219825160194"],
                        ["x!aliases [command]", "Get a list of all available keywords you can use to trigger a command.", "x!aliases help"],
                        ["x!guild", "Get all the basic information about this server, like member count or how old it is.", "x!guild"],
                        ["x!kick [user] (reason)", "Removes a user from the server without preventing them from being able to come back.", "x!kick 357700219825160194 Mic spamming in voice chat"],
                        ["x!ban [user] (reason)", "Removes a user from the server with the guarantee that they will never come back. This will also delete all messages sent by that user in the last 2 days.", "x!ban 357700219825160194 Spam and harassment"],
                        ["x!bug [command]\n[description]", "If you find a feature that you don't think should be a feature, use this command so that the dev will know about it. Be sure to be descriptive! Can only be used in direct messages. Can be used once per user every 2 hours.", "x!bug minesweeper\nDimensions don't match what's requested."],
                        ["x!request [description]", "If there's a feature the bot does not yet support and you want to see supported, use this command so the dev will know about it. Be sure to be descriptive! Can only be used in direct messages. Can be used once per user every 2 hours.", "x!request Add more profile backgrounds"],
                        ["x!neko", "Get a picture of a cute anime girl with cat ears.", "x!neko"],
                        ["x!calc [equation]", "Solves a simple equation for you like a calculator.", "x!calc 2 + 2"],
                        ["x!graph [equation]", "Draws out an equation on a coordinate grid. You can graph up to 10 equations at once.", "x!graph 2x + 7"],
                        ["x!nsfw (tag)", "Get a naughty hentai image. This command can only be used in channels marked as NSFW or in direct messages.", "x!nsfw gif"]
                    ][index];
                    let embed = new Discord.RichEmbed();
                    embed.setTitle("Help!");
                    embed.setAuthor("Command: " + Object.keys(aliases.guild)[index]);
                    embed.setDescription("__**Usage**__:\n`" + help[0] + "`\n\n" + help[1] + 
