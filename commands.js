var version = "2.37.1.5";

const Discord = require("discord.js");
const Canvas = require("canvas");
const pg = require("pg");
const nekos = require("nekos.life");

var { client, config } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
var { table } = require("/app/assets/misc/table.js");
var Profile = require("/app/assets/profile/profile.js");
var titles = require("/app/assets/profile/titles.json");
var images = require("/app/assets/backgrounds/images.json");

const Nekos = new nekos();
const db = new pg.Client(config.DATABASE_URL);
db.connect();
exports.db = db;

var admins = ["357700219825160194"];

var timers = setInterval(function() {
    db.query("SELECT * FROM timers", function(err, res) {
        if (err)
        {
            return sqlError(
                "Internal (var timers @ line 23)",
                err,
                "SELECT * FROM timers"
            );
        }
        res.rows.forEach(row => {
            if (row.time > 0)
            {
                db.query(`UPDATE timers SET time = ${row.time - 1} WHERE id = '${row.id}'`, function(err) {
                    if (err)
                    {
                        sqlError(
                            "Internal (var timers @ line 23 | db.query @ line 36)",
                            err,
                            `UPDATE timers SET time = ${row.time - 1} WHERE id = '${row.id}'`
                        );
                    }
                });
            }
            else
            {
                db.query(`DELETE FROM timers WHERE id = '${row.id}'`, function(err) {
                    if (err)
                    {
                        sqlError(
                            "Internal (var timers @ line 23 | db.query @ line 53)",
                            err,
                            `DELETE FROM timers WHERE id = '${row.id}'`
                        );
                    }
                });
            }
        });
    });
}, 1000);

var games = {
    games: require("/app/games/games.js").games,
    othello: require("/app/games/othello.js"),
    squares: require("/app/games/squares.js"),
    rokumoku: require("/app/games/rokumoku.js"),
    ttt3d: require("/app/games/3dttt.js"),
    connect4: require("/app/games/connect4.js"),
    ordo: require("/app/games/ordo.js")
};

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
        message.channel.send("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now!```");
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
            "squares": /^([a-j] ?(10|[1-9])|(10|[1-9]) ?[a-j])$/i,
            "othello": /^([a-h][1-8]|[1-8][a-h])$/i,
            "rokumoku": /^([a-s] ?1?[0-9]{1,}|1?[0-9]{1,} ?[a-s])$/i,
            "connect4": /^[1-7]$/,
            "ttt3d": /^[1-4] ?([1-4] ?[a-d]|[a-d] ?[1-4])$/i,
            "ordo": /^(([a-j][1-8] [a-j][1-8]|[1-8][a-j] [1-8][a-j])|([a-j][1-8]-[a-j][1-8]|[1-8][a-j]-[1-8][a-j]) (up|right|down|left|[urdl]) [1-9])$/i
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
                    if (game.channels.hasOwnProperty(message.channel.id))
                    {
                        for (let i = 0; i < game.channels.length; i++)
                        {
                            client.channels.get(game.channels[0]).send("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now!\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough!```");
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
        if (/^(connect4|squares|othello|rokumoku|ttt3d|ordo)_[0-2]_[0-9]{1,}(|vs[0-9]{1,})\.png$/.test(img))
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
                    game: JSON.stringify(["othello", "squares", "rokumoku", "ttt3d", "connect4", "ordo"].indexOf(game.game) + 1),
                    score: game.score
                };
            }
            games.games.forEach((game, index) => {
                if (game.games.hasOwnProperty(message.channel.id))
                {
                    for (let i = 0; i < game.channels.length; i++)
                    {
                        client.channels.get(game.channels[0]).send("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now!\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough!```");
                    }
                    delete games.games[index];
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
                        wins = res.rows.find(x => x.id == result.winner);
                        lose = res.rows.find(x => x.id == result.loser);
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
                    if (lose["elo" + result.game] > wins["elo" + result.game])
                    {
                        lose.money += 100;
                        wins.money += 10;
                    }
                    if (lose["elo" + result.game] == wins["elo" + result.game])
                    {
                        lose.money += 50;
                        wins.money += 50;
                    }
                    if (lose["elo" + result.game] < wins["elo" + result.game])
                    {
                        lose.money += 25;
                        wins.money += 75;
                    }
                    let booty = Math.ceil(lose["elo" + result.game] / 10);
                    let query = [
                        `UPDATE profiles`,
                        `SET`,
                        `   elo${result.game} = ${wins["elo" + result.game] + booty},`,
                        `   win${result.game} = ${wins["win" + result.game] + 1},`,
                        `   money = ${wins.money}`,
                        `WHERE id = '${wins.id}';`,
                        ``,
                        `UPDATE profiles`,
                        `SET`,
                        `   elo${result.game} = ${lose["elo" + result.game] - booty},`,
                        `   los${result.game} = ${lose["los" + result.game] + 1},`,
                        `   money = ${lose.money}`,
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
        let game = games.games.filter(game => game.channels.hasOwnProperty(message.channel.id))[0];
        if (/<@[0-9]{1,}> is now requesting a new game of (Connect 4|Squares|Othello|Rokumoku|3D Tic Tac Toe|Ordo)!/.test(message.content) || [
            "This column is full, please pick another!",
            "Someone has aleady played there, pick another space!",
        ].includes(message.content))
        {
            game.channels[message.channel.id].push(message.id);
        }
    }
}
   
function newUser(id, message) {
    let image = images.ids.random();
    let query = [
        `INSERT INTO profiles (`,
        `    id,       color,   title,      titles,             background,  backgrounds,         lefty,  money,  elo1,  elo2,  elo3,  elo4,  elo5,  elo6,  elo7,  win1,  win2,  win3,  win4,  win5,  win6,  win7,  los1,  los2,  los3,  los4,  los5,  los6,  los7`,
        `) VALUES (`,
        `    '${id}',  '#aaa',  'default',  ARRAY ['default'],  '${image}',  ARRAY ['${image}'],  true,   500,    0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0`,
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
        money: 500,
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
        // Games
        "games": ["games"],
        "othello": ["othello", "reversi"],
        "squares": ["squares"],
        "rokumoku": ["rokumoku", "connect6", "connectsix"],
        "ttt3d": ["3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe"],
        "connect4": ["connectfour", "connect4", "cfour", "c4"],
        "ordo": ["ordo"],
        "profile": ["profile", "scorecard", "prof"],
       
        // Utility
        "about": ["about", "info", "bot"],
        "credits": ["credits", "acknowledgements"],
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
        "ai": ["ai", "aibot", "xyvyai"],
        "botsbyxyvy": ["botsbyxyvy", "xyvybots"],
        "minesweeper": ["minesweeper", "ms", "mines"],
       
        // NSFW
        "nsfw": ["nsfw", "hentai", "lewd", "porn"],
       
        // Admin-only
        "js": ["js"],
        "pg": ["pg"],
    },
    user: {
        // Games
        "games": ["games"],
        "othello": ["othello", "reversi"],
        "squares": ["squares"],
        "rokumoku": ["rokumoku", "gobang", "renju"],
        "ttt3d": ["3dttt", "3dtictactoe", "ttt3d", "tictactoe3d", "ttt", "tictactoe"],
        "connect4": ["connectfour", "connect4", "cfour", "c4"],
        "ordo": ["ordo"],
        "profile": ["profile", "scorecard", "prof"],
       
        // Utility
        "about": ["about", "info", "bot"],
        "credits": ["credits", "acknowledgements"],
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
        "ai": ["ai", "aibot", "xyvyai"],
        "botsbyxyvy": ["botsbyxyvy", "xyvybots"],
        "minesweeper": ["minesweeper", "ms", "mines"],
       
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
                "rokumoku": ["rokumoku", "gobang", "renju"],
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
            if (gms.rokumoku.includes(args[1]))
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
                        game = ["Othello", "Squares", "Rokumoku", "3D Tic Tac Toe", "Connect Four"][elos[3] - 1];
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
                "rokumoku": ["rokumoku", "gobang", "renju"],
                "ttt3d": ["ttt3d", "3dttt", "3dtictactoe", "tictactoe3d", "ttt", "tictactoe"],
                "connect4": ["connect4", "connectfour", "cfour", "c4"]
            };
            let Games = [].concat(gms.othello, gms.squares, gms.rokumoku, gms.ttt3d, gms.connect4);
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
                    embed.setTitle("User Statistics for " + (Gm == "all" ? "all games" : ["Othello", "Squares", "Rokumoku", "3D Tic Tac Toe", "Connect Four"][Gm - 1]));

                    if (Gm == "all")
                    {
                        let ok = [];
                        for (let i = 0; i < 5; i++)
                        {
                            let game = ["Othello", "Squares", "Rokumoku", "3D Tic Tac Toe", "Connect Four"][i];
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
                        embed.setDescription("**User**: <@" + id + ">\n**__Game__: " + ["Othello", "Squares", "Rokumoku", "3D Tic Tac Toe", "Connect Four"][Gm - 1] + "\n__Elo__: " + user["elo" + Gm] + "\n__W/L (%)__: " + user["win" + Gm] + "/" + user["los" + Gm] + " (" + (user["win" + Gm] + user["los" + Gm] > 0 ? Math.round(user["win" + Gm] / (user["win" + Gm] + user["los" + Gm]) * 10000) / 100 : "N/A") + "%)**");
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
            embed.setDescription("I currently have 4 games, and plan to add more.\n\n**Games**: Othello, Squares, 3D Tic-Tac-Toe, Connect Four\n**Planned**: Rokumoku\n\nI chose these games ~~mostly because they're very simple games with very simple rules and mechanics and they're easy to calculate who won and who lost and~~ because they're easy for people to learn, easy for people to get into, easy for people to get good at. I'm never going to add Chess or Go ~~because they're both complicated in terms of mechanics and win/lose/end-game criteria and~~ because they're not easy to learn, not easy to play, not easy to become skilled at. Plus, they take ***foreverrrrrr*** to play.\n\nBefore I decide the bot is \"complete,\" I want at least 10 games. However, deciding what games I want to add to the bot is not gonna be easy, so toss me some suggestions using x!request (make sure it's an [abstract strategy game](https://en.wikipedia.org/wiki/Abstract_strategy_game) before you suggest it my way).");
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

    "rokumoku": function(cmd, args, input, message, sendChat) {
        return commands.game("rokumoku", args, input, message, sendChat);
    },

    "ttt3d": function(cmd, args, input, message, sendChat) {
        return commands.game("ttt3d", args, input, message, sendChat);
    },

    "connect4": function(cmd, args, input, message, sendChat) {
        return commands.game("connect4", args, input, message, sendChat);
    },

    "ordo": function(cmd, args, input, message, sendChat) {
        return commands.game("ordo", args, input, message, sendChat);
    },

    "game": function(cmd, args, input, message, sendChat) {
        let gameName = cmd;
        let GameName = {
            "othello": "Othello",
            "squares": "Squares",
            "rokumoku": "Rokumoku",
            "ttt3d": "3D Tic Tac Toe",
            "connect4": "Connect Four",
            "ordo": "Ordo"
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
                "noGameHere": function(game) {
                    return game.game == gameName && !game.channels.hasOwnProperty(message.channel.id);
                },
                "gameHere": function(game) {
                    return game.game == gameName && !game.started && game.channels.hasOwnProperty(message.channel.id);
                },
                "gameThere": function(game) {
                    return game.game == gameName && !game.started && !game.channels.hasOwnProperty(message.channel.id) && !game.here;
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
                "nothingHere": function(game) {
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
            if (games.games.some(condition("alreadyQueued")))
            {
                return sendChat("You are already queued for that game somewhere else!");
            }
            if (games.games.some(condition("playingYourself")))
            {
                return sendChat("You cannot play a game against yourself!");
            }
            if (games.games.some(condition("somethingElseHere")))
            {
                return sendChat("You're already queued for a different game in this channel!");
            }
            if (games.games.some(condition("someoneElseHere")))
            {
                return sendChat("Someone is already queueing for a different game in this channel!");
            }
            if (games.games.some(condition("gameStarted")))
            {
                return sendChat("There is already an active game in this channel!");
            }

            if (["here"].includes(args[1]))
            {
                if (games.games.some(condition("gameHere")))
                {
                    let game = games.games.filter(condition("gameHere"))[0];
                    return games[gameName].startGame(Object.keys(game.channels)[0], message.channel.id, message.author.id);
                }
                if (games.games.some(condition("noGame")) || !games.games.some(condition("noGameHere")))
                {
                    return games[gameName].newGame(message.channel.id, message.author.id, true);
                }
            }
            else
            {
                if (games.games.some(condition("gameHere")))
                {
                    let game = games.games.filter(condition("gameHere"))[0];
                    return games[gameName].startGame(Object.keys(game.channels)[0], message.channel.id, message.author.id);
                }
                if (games.games.some(condition("gameThere")))
                {
                    let game = games.games.filter(condition("gameThere"))[0];
                    return games[gameName].startGame(Object.keys(game.channels)[0], message.channel.id, message.author.id);
                }
                if (!games.games.some(condition("noGame")))
                {
                    return games[gameName].newGame(message.channel.id, message.author.id, true);
                }
            }
        }
        if (["quit", "forfeit", "leave"].includes(input)) 
        {
            if (!games.games.some(condition("nothingHere")))
            {
                return sendChat("There is not a game in this channel for you to quit!");
            }
            else
            if (!games.games.some(condition("participant")))
            {
                return sendChat(`You are not a participant of this game!`);
            }
            else
            if (games.games.some(condition("dontStart")))
            {
                games.games.forEach((game, index) => {
                    if (game.channels.hasOwnProperty(message.channel.id) && game.players.includes(message.author.id) && !game.started)
                    {
                        sendChat(`Pending game canceled, <@${message.author.id}>.`);
                        delete games.games[index];
                        games.games.splice(index, 1);
                    }
                });
            }
            else
            if (!games.games.some(condition("quit")))
            {
                games.games.filter(game => game.channels.hasOwnProperty(message.channel.id))[0].forfeit = message.author.id;
            }

        }
        if (["help", "rules", "howtoplay"].includes(args[0])) /** @TODO Make example .gifs */
        {
            let wiki = {
                asg: "[Abstract Strategy Game](https://wikipedia.org/wiki/Abstract_strategy_game)",
                attt: "[Advanced Tic Tac Toe](https://wikipedia.org/wiki/M,n,k-game)"
            }
            let embed = new Discord.RichEmbed();
            embed.setTitle("How to play: " + GameName);
            switch (gameName)
            {
                case "othello":
                {
                    embed.setDescription(
                        `Othello, or Reversi, is an ${wiki.asg}. The game consists of stones of both black and white and is played on an 8x8 board. The game starts with 2 stones of each color placed in the middle of the board with stones of the same color diagonal to each other. Black goes first.\n` +
                        "Players take turns placing 1 stone in a manner that would \"capture\" lines of opponent's stones at either end, effectively changing the opponent's stones into the player's.\n" +
                        "The obective of the game is to have the most stones on the board before both player can no longer make a legal move."
                    );
                    embed.addField(
                        "Stone Placement",
                        "In order to place a stone in an empty space, that space must be at the end of a line of your opponent's stones with one of your own stones at the other end of it. For simplicity, legal spaces will be highlighted in blue for you.\n" +
                        "To place a stone on the board, simply say the row number and column letter of the empty space; for example, say \"4C\" to place a stone in Row 4–Column C.\n" +
                        "The stone placed on any given turn will be highlighted in yellow.\n" +
                        "[Example .gif of stone placements]()"
                    );
                    embed.addField(
                        "Capturing Stones",
                        "Once you place a stone, all lines of your opponent's stones that have the stone you just placed at one end with one of your other stones at the other end are \"captured\" and will immediately turn into your stones.\n" +
                        "Placing a stone can capture your opponent's stones in any diagonal and orthagonal direction. You can also capture in multiple directions at once.\n" +
                        "Stones that have been captured on any given turn will be highlighted in green.\n" +
                        "[Example .gif of capturing stones in multiple directions]()"
                    );
                    embed.addField(
                        "Endgame",
                        "The game officially ends when both players can no longer make a legal move to capture their opponent's stones.\n" +
                        "Once this happens, all stones on the board are counted that the player with the most stones is declared the winner.",
                        "[Example .gif of game ending]()"
                    );
                }
                case "squares":
                {
                    embed.setDescription(
                        `Squares is an ${wiki.asg} created by Xyvyrianeth originally for Xyvybot. The game consists of stones of both black and red and is played on a 10x10 board.\n` +
                        "Players take turns placing 2 stones on empty spaces, except for the first and final turns where the first player only places 1, until the board is completely full. Black goes first.\n" +
                        "The objective of the game is to arrange as many sets of 4 stones into perfect squares as possible, the winner being the player with the most squares at the end."
                    );
                    embed.addField(
                        "Stone Placement",
                        "To place a stone on the board, simply say the row number and column letter of the empty space; for example, say \"4C\" to place a stone in Row 4–Column C.\n" +
                        "The stones placed on any given turn will be highlighted in yellow.\n" +
                        "[Example .gif of stone placement]()"
                    );
                    embed.addField(
                        "Creating Squares",
                        "For every set of 4 stones of the same color that are arranged into a perfect square, the player of that color gets 1 point.\n" +
                        "When a player places a stone that completes a square, the other 3 stones of that square will be highlighted in green.\n" +
                        "A single stone can contribute to multiple squares.\n" +
                        "[Example .gif of square creation]()"
                    );
                    embed.addField(
                        "Endgame",
                        "The game officially ends when there are no longer any empty spaces on the board.\n" +
                        "Once this happens, all squares are counted and the player with the most squares is declared the winner.\n" +
                        "[Example .gif of game ending]()"
                    );
                }
                case "rokumoku":
                {
                    embed.setDescription(
                        `Rokumoku, or Connect Six (literally \"six eyes\" in Japanese) is an ${wiki.asg} and a type of ${wiki.attt}. The game consists of stones of both black and white and can be played on a board of any size, but for Xyvybot you'll use a static 12x12 board. Black goes first.\n` +
                        "Players take turns placing 2 stones on empty spaces, except for the first player's first turn, until either player has created a line of 6 of their own stones, or until the board is full. Black goes first.\n" +
                        "The rules for Rokumoku is very simple, as it's basically just large Tic Tac Toe."
                    );
                    embed.addField(
                        "Stone Placement",
                        "To place a stone on the board, simply say the row number and column letter of the empty space; for example, say \"4C\" to place a stone in Row 4–Column C.\n" +
                        "The stones placed on any given turn will be highlighted in yellow.\n" +
                        "[Example .gif of stone placement]()"
                    );
                    embed.addField(
                        "Endgame",
                        "The game officially ends when either player has created a line of 6 of their own stones, either diagonally or orthagonally.\n" +
                        "Once this happens, the 6 stones that constitute the winning line will be highlighted in green.",
                        "[Example .gif of game ending]()"
                    );
                }
                case "ttt3d":
                {
                    embed.setDescription(
                        `3D Tic Tac Toe is an ${wiki.asg} and, as the name suggests, a type of ${wiki.attt}. The game consists of stones, either X's or O's, and a 3-dimensional 4x4x4 playing area.\n` +
                        "Players take turns placing 1 stone in an emtpy space on the 3-dimensional playing area until either the playing area is full or a player has created a line of 4 of their own stones through any number of planes in the playing area. X goes first.\n" +
                        "The way the 3D Tic Tac Toe playing area is displayed might be confusing for some players. Traditionally, the 4 *y*-planes are displayed vertically, but to save space, the 2nd and 4th *y*-planes are to the right of the 1st and 3rd."
                    );
                    embed.addField(
                        "Stone Placement",
                        "To place a stone in the playing area, simply say which *y*-plane you wish to place in, followed by the row number and column letter of that *y*-plane; for example, say \"34C\" to place a stone in Row 4–Column C in the 3rd *y*-plane.\n" +
                        "The stone placed on any given turn will be highlighted in yellow.\n" +
                        "[Example .gif of stone placement]()"
                    );
                    embed.addField(
                        "Endgame",
                        "The game officially ends when either player has created a line of 4 of their own stones going across any number of planes.\n" +
                        "Once this happens, the 4 stones that constitute the winning line will be highlighted in green.",
                        "[Example .gif of game ending]()"
                    );
                }
                case "connect4":
                {
                    embed.setDescription(
                        `Connect Four is an ${wiki.asg} and a type of ${wiki.attt}. The game consists of stones of both black and red and is played on a 6x7 board. Blue goes first.\n` +
                        "Players take turns placing 1 stone in the lowest empty space of any column until either the board is full or a player has created a line of 4 of their own stones.\n" +
                        "This has been a very popular board game for many years, and if you've never heard of it until now, your childhood was clearly shit."
                    );
                    embed.addField(
                        "Stone Placement",
                        "To place a stone on the board, simply say the column number of the empty space you wish to play in; for example, say \"4\" to place a stone in Column 4.\n" +
                        "When placing a stone, it will automatically be placed in the lowest empty space of the column you placed it in.\n" +
                        "The stone placed on any given turn will be highlighted in yellow.\n" +
                        "[Example .gif of stone placement]()"
                    );
                    embed.addField(
                        "Endgame",
                        "The game officially ends when either player has create a line of 4 of their own stones, either diagonally or orthagonally.\n" +
                        "Once this happens, the 4 stones that constitute the winning line will be highlighted in green.\n" +
                        "[Example .gif of game ending]()"
                    );
                }
                case "ordo":
                {
                    embed.setDescription(
                        `Ordo is an ${wiki.asg} that has rules and gameplay reminiscent of Checkers. The game consists of stones of both blue and white and is played on an 8x10 board. The game starts with all stones on the board in a set pattern. Blue goes first.\n` +
                        "Players take turns moving 1 stone around the board in diagonal or orthagonal directions (or multiple stones, but only orthagonally), making sure that all of their stones are connected in the same group."
                    );
                    embed.addField(
                        "Singleton Moves",
                        "Singleton moves consist of one stone being moved in any direction, either diagonally or orthagonally, any number of spaces. These moves can end in either an empty space or on a space occupied by one of your opponent's stones (which effectively \"captures\" and removes that stone from the game).\n" +
                        "You make a singleton move by saying the row number and column letter of the stone you want to move followed by the row number and column letter of the space you wish to move it to; for example, say \"4C 7F\" to move a stone from Row 4–Column C to Row 7–Column F.\n" +
                        "Stones that have been moved will be highlighted in yellow with the space they were moved from being highlighted in red.\n" +
                        "[Example .gif of a singleton move]()"
                    );
                    embed.addField(
                        "Ordo Moves",
                        "Ordo moves consist of multiple stones that are adjacent orthagonally from each other being moved in either perpendicular direction (if the stones being moved are aligned vertically, they can only be moved horizontally, and vice versa).\n" +
                        "You make an ordo move by saying the row number and column letter of the stones located at the ends of the line of stones you wish to move, separated by a hyphen, followed by which direction you wish to move it in (up, down, left, or right), followed by how many spaces you wish to move it in that direction; for example, say \"5A-7A left 4\" to move 3 stones aligned vertically in Column A to the left 4 spaces each.\n" +
                        "These moves cannot capture enemy stones.\n" +
                        "[Example .gif of an ordo move]()"
                    );
                    embed.addField(
                        "Groups",
                        "At the end of either player's turn, all of their stones must be connected into a single group where all stones are adjacent to at least one other, either diagonally or orthagonally. If a move is attempted and the moved stone(s) is not connected to the primary group, it is not a legal move.\n" +
                        "If a player were to make a move that would separate their opponent's stones into two or more groups, their opponent must immediately make a move that would reconnect their stones into a single group again.\n" +
                        "If a player's stones were to be split into two or more groups and that player cannot reconnect them into a single group again on their next turn, the game immediately ends.\n" +
                        "[Example .gif of a group being separated and then reconnected]()"
                    );
                    embed.addField(
                        "Endgame",
                        "There are 3 conditions for ending the game:\n" +
                        " -A player moves a stone into any space in their opponent's \"home row\" (for blue it's row 8, and for white it's row 1). This player is the winner. Both home rows have been highlighted in the color of which stone needs to be placed in it to end the game.\n" +
                        " -All of a player's stones have been captured and removed from the game. This player is the loser.\n" +
                        " -A player's stones are split into two or more groups and cannot be reconnected into a single group on their next turn. This player is the loser.\n" +
                        "[Example .gif of all 3 scenarios]()"
                    );
                }
            }
            embed.setColor(new Color().random());
            message.author.send({embed});
            return sendChat("The rules for " + GameName + " have been sent to you via DMs!");
        }
        if (["tourney", "tournament"].includes(args[0]))
        {
            if (message.channel.guild.members.get(message.author.id).roles.some(x => x.id == "597901572843896841"))
            {
                let player1 = args[1].match(/[0-9]{1,}/)[0];
                let player2 = args[2].match(/[0-9]{1,}/)[0];
                games[gameName].newTourney(message.channel.id, player1, player2);
            }
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
                return sendChat("Cannot display other users' profiles in DMs, yet, sorry!");
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

                Canvas.loadImage(member.avatar ? `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.${member.avatar.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/embed/avatars/0.png").then(image1 => {
                    Canvas.loadImage('/app/assets/backgrounds/' + profile.background.substring(0, 7) + (profile.background.substring(7) == 'p' ? ".png" : ".jpg")).then(image2 => {
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
                        return sendChat("This is your current background, $user$!\nTo get more backgrounds, do `x!profile background purchase` to get a new one!\n**Note**: buying a new background will give you a random one, but you will be able to keep it along with any previously owned backgrounds, such as the one you were given when you first created a profile. All backgrounds cost 500 money.", new Discord.Attachment("https://i.imgur.com/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == 'j' ? ".jpg" : ".png")));
                    }

                    return sendChat("This is your current background, $user$! New backgrounds cost 500 money.\nDo `x!profile backgrounds` to view the other backgrounds you own.", new Discord.Attachment("https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/backgrounds/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == 'j' ? ".jpg" : ".png")));
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
                    return sendChat(`\`\`\`md\n# All Backgrounds owned by user ${res.rows[0].id}:\n\n  [Background Title](background ID)\n\n  ${b2.join("\n  ")}\n\nIf you wish to equip any of these, do \`x!profile background [title ID]\` (capitals are important!)\`\`\``);
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
                        return sendChat("There are no more backgrounds for you to purchase, because you've got them all already! When new ones are added, you'll be able to buy more, ok?");
                    }
                    if (res.rows[0].money < 500)
                    {
                        return sendChat("You do not have enough money to buy another background! Backgrounds cost 500 money each! Get more money by playing games (and winning)!");
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
                        `SET backgrounds = ARRAY ${JSON.stringify(res.rows[0].backgrounds).replace(/"/g, "'")}, money = '${res.rows[0].money - 500}'`,
                        `WHERE id = '${message.author.id}'`
                    ].join('\n'), function(err) {
                        if (err)
                        {
                            sqlError(message, err, [
                                `UPDATE profiles`,
                                `SET backgrounds = ARRAY ${JSON.stringify(res.rows[0].backgrounds).replace(/"/g, "''")}, money = '${res.rows[0].money - 500}'`,
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
                    `FROM profiles`,
                    `WHERE id = '${message.author.id}'`
                ].join('\n'), function(err, res) {
                    if (err)
                    {
                        return sqlError(message, err, [
                            `SELECT *`,
                            `FROM profiles`,
                            `WHERE id = '${message.author.id}'`
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
        if (["righty", "lefty", "sidedisplay", "displayside", "displaylorr", "leftorright", "rightorleft", "changeside", "sidechange", "side"].includes(args[0]))
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
                        `WHERE id = '${message.author.id}'`
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
                            `WHERE id = '${message.author.id}'`
                        ].join('\n'));
                    }
                    if (res.rows.length == 0)
                    {
                        return sendChat("You have not yet created a profile, so you do not yet have any titles. If you want to change that fact, do `x!profile` right now!");
                    }
                    if (res.rows[0].titles.length == 1)
                    {
                        return sendChat("The only title you own is the title you currently have equipped. Get some more and then check back with me, ok?");
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
                        `WHERE id = '${message.author.id}'`
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
                        `WHERE id = '${message.author.id}'`
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
            let embed = new Discord.RichEmbed();
            embed.setTitle("Available subcommands for x!profile");
            embed.setDescription(
                "x!profile `subcommand`\n" +
                "\n" +
                "**backgrounds** - Opens the background menu for changing your profile's background.\n" +
                "**displayside** - Allows you to change which side all the text n stuff is displayed on in your profile.\n" +
                "**title** - Displays your currently equipped title, your currently owned titles, or allows you to change your currently equipped title (if you know the ID for it).\n" +
                "**color** - Allows you to change the color your profile uses to display information."
            );
            embed.setColor(new Color().random());
            return sendChat({embed});
        }

        else
        {
            return sendChat("Invalid syntax. Try `x!profile help` for more information on how to use this.");
        }
    },

    // Utility
    "help": function(cmd, args, input, message, sendChat) {
        if (!input)
        {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Help");
            embed.setDescription("A list of all commands supported by Xyvybot\n" + (message.channel.type == "dm" ? "Some of these commands are not supported in servers" : "Some of these commands are not supported in DMs") + "\nFor more help about any specific command, do \"`x![command]` `help`\"");
            let helps;
            helps = [
                    "`othello`  `squares`  `3dtictactoe`  `connect4`  `rokumoku`  `ordo`\n***Related Commands***:\n`games`  `profile`\n***Unimplemented***:\n`ninemen`  `gonnect`",
                    "`help`  `about`  `avatar`  `aliases`  `bugreport`  `request`",
                    "`nekos`  `calculate`  `graph`  `ai`  `botsbyxyvy`  `minesweeper`"
            ];
            if (message.channel.type == "dm")
            {
                helps[1] += "  `bugreport`  `request`";
            }
            else
            {
                helps[1] += "  `kick`  `ban`";
            }
            embed.addField("Games", helps[0]);
            embed.addField("Utility", helps[1]);
            embed.addField("Miscellaneous", helps[2]);
            if (message.channel.type == "dm" || message.channel.nsfw)
            {
                embed.addField("NSFW", `NSFW command only available in DMs or NSFW-marked channels (if you're seeing this, then you can use it here). Say \`x!nsfw help\` for a list of all the lewds I'm capable of.`);
            }
            embed.setColor(new Color().random());
            embed.setFooter("Xyvybot version " + version);
            return sendChat({embed});
        }
        else
        if (["games", "minigames", "utility", "miscellaneous", "misc", "nsfw"].includes(input))
        {
            let embed = new Discord.RichEmbed();
            embed.setTitle(input.toUpperCase());
            embed.setDescription({
                "games": "`othello`  `squares`  `3dtictactoe`  `connect4`  `rokumoku`\n__Related Commands__:\n`games`  `profile`\n__Unimplemented__:\n`ordo`  `ninemen`  `gonnect`",
                "utility": "`help`  `about`  `avatar`  `aliases`  `bugreport`  `request`" + (message.channel.type == "dm" ? "  `bugreport`  `request`" : "  `kick`  `ban`"),
                "misc": "`nekos`  `calculate`  `graph`  `ai`  `botsbyxyvy`  `minesweeper`",
                "nsfw": "`nsfw`\nThat's the only one. No need for multiple commands that do the same thing."
            }[input]);
            embed.setColor(new Color().random());
            embed.setFooter("Xyvybot version " + version);
            return sendChat({embed});
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
                        ["x!rokumoku [start|rules]", "Rokumoku is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!rokumoku start"],
                        ["x!ttt3d [start|rules]", "3D Tic Tac Toe is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!ttt3d start"],
                        ["x!connect4 [start|rules]", "Connect Four, or Vertical Checkers, is an [abstract strategy game](https://wikipedia.org/wiki/abstract_strategy_game) that can be played with my bot against other people.", "x!connect4 start"],
                        ["x!profile (user)", "Show of your own profile card that shows your game stats and rank. It has a customizable background and overlay color.", "x!profile 357700219825160194"],
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
                        ["x!ai", "Gives you a link to invite Xyvybot - AI to your server.", "x!ai"],
                        ["x!botsbyxyvy", "Gives you a link to the site where you request a commission for a custom-made Discord bot by Xyvyrianeth.", "x!botsbyxyvy"],
                        ["x!minesweeper (width) (height) (difficulty)", "A classic game of Minesweeper right here on Discord. Wouldn't be possible without the ||spoiler|| feature.", "x!minesweeper 10 15 20%"],
                        ["x!nsfw (tag)", "Get a naughty hentai image. This command can only be used in channels marked as NSFW or in direct messages.", "x!nsfw gif"]
                    ][index];
                    let embed = new Discord.RichEmbed();
                    embed.setTitle("Help!");
                    embed.setAuthor("Command: " + Object.keys(aliases.guild)[index]);
                    embed.setDescription("__**Usage**__:\n`" + help[0] + "`\n\n" + help[1] + "\n\n__**Example**__:\n" + help[2]);
                    embed.setColor(new Color().random());
                    embed.setFooter("Xyvybot version " + version);
                    sendChat({embed});
                }
                else
                if (index == Object.keys(aliases[message.channel.type == "dm" ? "user" : "guild"]).length)
                {
                    sendChat("That command does not exist.");
                }
            });
        }
    },

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

    "about": function(cmd, args, input, message, sendChat) {
        let embed = new Discord.RichEmbed();
        embed.setTitle(
            "About me",
            Images.avatar
        );
        embed.setDescription(
            "Let's start off by saying that the only reason this bot exists is because someone else told me I should make it. Not for any reason in particular, they were just testing me to see if I could do it.\n" +
            "Well, I did it, and then I found I enjoyed making it, so I kept building on it. It's still kinda rough on the edges, but it works, and that's all that matters, right?\n" +
            "\n" +
            "Fast-forward 2 years and I find myself interested in [abstract strategy games](https://en.wikipedia.org/wiki/Abstract_strategy_game), like Go and Othello. It's not easy using a completely different application or software to play simple games with my friends on Discord, so I made this bot able to do what those other apps did, and we had fun.\n" +
            "*Then*, someone suggested I make this bot go public so *other people* won't have the same problem. Thank that person (I forgot who, honestly) for telling me to solve that problem for you if you had it as well.\n" +
            "\n" +
            "Currently, I'm building up to starting a community centered around abstract strategy games. I plan to run tournaments where people play these games and win prizes, like money and Steam codes and more.\n" +
            "Once I feel the bot is in a state of relative completeness, the server this would all happen in will go public. Please look forward to it."
        );
        embed.setColor(new Color().random());
        sendChat({embed});
    },

    "credits": function(cmd, args, input, message, sendChat) {
        let embed = new Discord.RichEmbed();
        embed.setTitle(
            "Credits",
            Images.avatar
        );
        embed.addField(
            "Created, Authored, and Primarily Tested by",
            "Xyvyrianeth"
        );
        embed.addField(
            "Code Dependencies",
            "[Heroku](https://heroku.com/), [Node.js](https://nodejs.org/en/), and the following NPM libraries:\n" +
            " -[Discord.js](https://npm.js/package/discord.js)\n" +
            " -[PostgreSQL](https://npm.js/package/pg)\n" +
            " -[Nekos.Life](https://npm.js/package/nekos.life)\n" +
            " -[Canvas](https://npm.js/package/canvas)\n" +
            "[Multiplayer Piano](https://multiplayerpiano.com) for all functions relating to [color hexadecimals](https://multiplayerpiano.com/Color.js)."
        );
        embed.addField(
            "Images",
            "All profile backgrounds found on [Imgur](https://imgur.com/) and posted by user [u/Kizenkis](https://imgur.com/user/Kizenkis) throughout various posts.\n" +
            `All images from x!nekos${message.channel.nsfw ? " and x!nsfw " : " "}come directly from the [Nekos.Life](https://nekos.life/) API.\n` +
            "All other assets made by Xyvyrianeth."
        );
        embed.addField(
            "Special Thanks",
            "to various users from [The Officially Unofficial Server to the Unofficially Official Dan-Ball Community](https://discord.gg/gYVMUrM) for both support and player testing."
        );
        embed.setColor(new Color().random());
        sendChat({embed});
    },

    "aliases": function(cmd, args, input, message, sendChat) {
        if (!input)
        {
            return sendChat("To view all the aliases for a command, do x!aliases `[command name]`");
        }
        else
        if (input.startsWith('['))
        {
            return sendChat("With***out*** the brackets.");
        }
        for (let i in aliases.guild)
        {
            if (aliases.guild[i].includes(input))
            {
                let embed = new Discord.RichEmbed();
                embed.setTitle("Aliases for " + i);
                embed.setDescription('`' + aliases.guild.join("`  `") + '`');
                embed.setColor(new Color().random());
                return sendChat({embed});
            }
        }
    },

    "bug": function(cmd, args, input, message, sendChat) {
        return db.query(`SELECT bug FROM bans`, function(err, res) {
            if (err)
            {
                return sendChat("```" + err + "```");
            }
            if (!res.rows[0].bug.includes(message.author.id))
            {
                if (!input)
                {
                    return sendChat("Here is how to format a bug report:\n\n```\nx!reportbug [command that's bugged]\n[description of bug (less than 1000 characters, please)]```\nPlease take note that if you submit a fake bug report, your user ID will be blacklisted and you will no longer be able to use this command. Don't be a dick.");
                }
                db.query(`SELECT * FROM timers WHERE id = '${message.author.id}`, function(err, res) {
                    if (res.rows.length == 1 && res.rows[0].bug > 0)
                    {
                        return sendChat("You can submit 1 bug every 2 hours. Xyvy doesn't like being spammed, you know.");
                    }
                    let com = input.split("\n")[0];
                    let desc = input.substring(com.length).trim();
                    let aliases = message.channel.type == "dm" ? aliases.user : aliases.guild;
                    let a = false;
                    for (let i in aliases)
                    {
                        if (aliases[i].includes(com))
                        {
                            a = true;
                            break;
                    }   }
                    if (!a)
                    {
                        return sendChat("That command does not exist!");
                    }

                    let embed = new Discord.RichEmbed();
                    embed.setTitle("Bug Report");
                    embed.setAuthor(
                        message.author.username + '#' + message.author.discriminator + " (" + message.author.id + ')',
                        `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.${message.author.avatar.startsWith("a_") ? "gif" : "png"}?size=2048`
                    );
                    embed.setDescription("**Command**: " + com + "\n\n" + desc);
                    embed.setColor(new Color().random());
                    client.guilds.get("399327996076621825").channels.get("467853697528102912").send({embed});
                    sendChat("Bug report sent! Thanks for helping out!");
                    if (res.rows.length == 0)
                    {
                        db.query(`INSERT INTO timers (id, bug, req) VALUES (${message.author.id}, 7200, 0);`);
                    }
                    else
                    {
                        db.query(`UPDATE timers SET bug = 7200 WHERE id = '${message.author.id}'`);
                    }
                });
            }
            else
            {
                sendChat("You are not allowed to use this command, since you thought you were funny and tried to spam it at some point. Way to go, you're a dick. You should feel proud.");
            }
        });
    },

    "request": function(cmd, args, input, message, sendChat) {
        return db.query(`SELECT req FROM bans`, function(err, res) {
            if (err)
            {
                return sendChat("```" + err + "```");
            }
            if (!res.rows[0].req.includes(message.author.id))
            {
                if (!input)
                {
                    return sendChat("Here is how to format a request:\n\n```\nx!request [description of suggestion]```\nPlease take note that if you submit a fake request, your user ID will be blacklisted and you will no longer be able to use this command. Don't be a dick.");
                }
                db.query(`SELECT * FROM timers WHERE id = '${message.author.id}`, function(err, res) {
                    if (res.rows.length == 1 && res.rows[0].req > 0)
                    {
                        return sendChat("You can submit 1 request every 2 hours. Xyvy doesn't like being spammed, you know.");
                    }

                    let embed = new Discord.RichEmbed();
                    embed.setTitle("User Request");
                    embed.setAuthor(
                        message.author.username + '#' + message.author.discriminator + " (" + message.author.id + ')',
                        `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.${message.author.avatar.startsWith("a_") ? "gif" : "png"}?size=2048`
                    );
                    embed.setDescription("**Suggestion**:\n" + input);
                    embed.setColor(new Color().random());
                    client.guilds.get("399327996076621825").channels.get("468245442388295691").send({embed});
                    sendChat("Request sent! Thanks for the suggestion!");
                    if (res.rows.length == 0)
                    {
                        db.query(`INSERT INTO timers (id, bug, req) VALUES (${message.author.id}, 0, 7200);`);
                    }
                    else
                    {
                        db.query(`UPDATE timers SET req = 7200 WHERE id = '${message.author.id}'`);
                    }
                });
            }
            else
            {
                sendChat("You are not allowed to use this command, since you thought you were funny and tried to spam it at some point. Way to go, you're a dick. You should feel proud.");
            }
        });
    },
   
    "guild": function(cmd, args, input, message, sendChat) {
        if (!input)
        {
            let guild = message.channel.guild;
            embed = new Discord.RichEmbed();
            embed.setTitle("Guild ID: " + guild.id);
            embed.setAuthor(guild.name);
            embed.setColor(new Color().random());
            if (guild.icon != null)
            {
                embed.setThumbnail(guild.iconURL);
            }
            owner = guild.members.get(guild.ownerID).user;
            embed.addField("Owner", `<@${owner.id}>`, true);
            embed.addField("Region", guild.region, true);
            embed.addField("Verification Level", [
                "None\nNo restrictions", 
                "Low\nAccount must be verified by email", 
                "Medium\nAccount must be verified by email and be older than 5 minutes", 
                "(╯°□°）╯︵ ┻━┻\nAccount must be verified by email, older than 5 minutes, and be a member of the server for at least 10 minutes", 
                "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻\nAccount must have a verified phone on it"
            ][guild.verificationLevel]);
            let text = guild.channels.filterArray(channel => channel.type == "text").length;
            let voice = guild.channels.filterArray(channel => channel.type == "voice").length;
            let categories = guild.channels.filterArray(channel => channel.type == "category").length;
            embed.addField(`Channels (${text + voice})`, `${text} Text | ${voice} Voice\nSplit into ${categories} categories`, true);
            let members = guild.memberCount;
            let bots = guild.members.filterArray(member => member.user.bot).length;
            embed.addField(`Members (${members})`, `${members - bots} Humans | ${bots} Bots`, true);
            embed.addField("Roles", guild.roles.array().length, true);
            embed.addField("Emotes", guild.emojis.array().length, true);
            return sendChat({embed});
        }
    },

    "kick": function(cmd, args, input, message, sendChat) {
        let user = message.channel.guild.members.get(message.author.id);
        if (!user.hasPermission("KICK_MEMBERS"))
        {
            return;
        }
        if (!input)
        {
            return sendChat("**Proper Usage**: `x!kick <@user>`");
        }
        if (!/^<@[0-9]{1,}>$/.test(args[0]) || !/^[0-9]{1,}$/.test(args[0]))
        {
            return sendChat("Invalid user mention, try again.");
        }
        else
        {
            message.channel.guild.members.get(args[0].match(/[0-9]{1,}/)[0]).kick(args[1] ? input.substring(args[0].lenght + 1) : "Probably for something annoying.").then(() => sendChat("kicked user <@" + args[0].match(/[0-9]{1,}/)[0] + '>')).catch((err) => sendChat("Failed to kick user <@" + args[0].match(/[0-9]{1,}/)[0] + ">```\n" + err + "```"));
        }

    },

    "ban": function(cmd, args, input, message, sendChat) {
        let user = message.channel.guild.members.get(message.author.id);
        if (user.hasPermission("BAN_MEMBERS"))
        {
            return;
        }
        if (!input)
        {
            return sendChat("**Proper Usage**: `x!ban <@user>`");
        }
        if (!/^<@[0-9]{1,}>$/.test(args[0]) || !/^[0-9]{1,}$/.test(args[0]))
        {
            return sendChat("Invalid user mention, try again.");
        }
        else
        {
            message.channel.guild.members.get(args[0].match(/[0-9]{1,}/)[0]).ban({ days: 1, reason: args[1] ? input.substring(args[0].length + 1) : "Probably for something annoying." }).then(() => sendChat("baned user <@" + args[0].match(/[0-9]{1,}/)[0] + '>')).catch((err) => sendChat("Failed to ban user <@" + args[0].match(/[0-9]{1,}/)[0] + ">```\n" + err + "```"));
        }

    },
   
    // Misc
    "nekos": function(cmd, args, input, message, sendChat) {
        Nekos.sfw.neko().then(neko => {
            let embed = new Discord.RichEmbed();
            embed.setAuthor(
                "x!nsfw",
                Images.nekosLife
            );
            embed.setImage(neko.url);
            embed.setDescription("Have a neko!");
            embed.setFooter("Powered by Nekos.Life");
            embed.setColor(new Color().random());
            return sendChat({embed});
        });
    },

    "calc": function(cmd, args, input, message, sendChat) {
        if (!input)
        {
            return sendChat(`**Syntax**: \`x!calc\` \`[equation]\``);
        }

        let answer = equ(input);
   
        if (answer[0] == "equated")
        {
            return sendChat("```Input: " + input + "``````Output: " + answer[1] + "```");
        }
        else
        {
            return sendChat("```Input: " + input + "``````Output: " + answer[1] + "```");
        }
    },
   
    "graph": function(cmd, args, input, message, sendChat) {
        if (["info", "about", "history"].includes(args[0])) {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Brief History of the Xyvyrianethian Graphic Calculator");
            embed.setAuthor("By Xyvyrianeth", exports.Images.avatar);
            embed.setDescription([
                "Okay, well, I made this simply because I had nothing better to do with my time. When I started, it was 100% text-drawn, ",
                "and it was really cool because I could add a lot of features to it when it didn't have to be accurate. Then I moved to ",
                "Node Canvas and had to start over. I'm still not anywhere near the level of Desmos, but I'm proud of myself with what ",
                "I have.\n",
                "\n",
                "In order to have a more advanced calculator, there needs to be a more strict syntax. I had to change a lot of things in ",
                "the old syntax just to enable something simple like square root, cube root, or n-root of x, and I'll have to change even ",
                "more if I want to add something like Π and ∑. I also had to change the method it uses to calculate almost entirely: instead ",
                "of it trying to do everything at once, it has to solve it step by step. It has its own order of operation it has to follow.\n",
                "\n",
                "I'm constantly refining it little by little, and soon it'll be something. Maybe not great, but something."].join(''));
            embed.addField("Other Sub-Commands", "`x!" + cmd + "`  `syntax`");
        }
        else
        if (["help", "syntax", "rules"].includes(args[0]) || !args[0])
        {
            let embed = new Discord.RichEmbed();
            embed.setTitle("How to Graphic Calculator, Xyvybot Style");
            embed.setAuthor("By Xyvyrianeth", exports.Images.avatar);
            embed.setDescription("[Click this link, it totally isn't spoopy](https://github.com/Xyvyrianeth/xyvybot/wiki/x!graph)");

        }
        else
        {
   
            // Draw blank graph
            canvas = new Canvas.createCanvas(301, 301);
            ctx = canvas.getContext('2d');
            ctx.drawImage(Images.graph, 0, 0);
            ctx.translate(150.5, 150.5);
            e = input.toLowerCase().replace(/ /g, "").split('\n').filter(x => x != '');
            input = input.split('\n');
            colors = ["#ff0000", "#ff7f00", "#fefe33", "#00ff00", "#008800", "#0d98ba", "#0000ff", "#a020f0", "#964b00", "#ffc0cb"];
            if (/;$/.test(input))
            {
                e.pop();
            }
            if (e.length > colors.length)
            {
                console.log("`Too many equations!`");
            }
            let display = [];

            for (let i = 0; i < e.length; i++)
            {
                // decide color
                let ic = e[i].split(';');
                let color = colors[i];
                let y = ic[0];
                if (ic.length == 2)
                {
                    if (/#([0-9a-f]{6,}|[0-9a-f]{3,})/.test(ic[1].toLowerCase()))
                    {
                        color = ic[1].toLowerCase();
                    }
                    if (/^(red|orange|yellow|(?:light||blue)green|blue|purple|brown|pink)$/i.test(ic[1]))
                    {
                        color = {
                            "red": "#ff0000",
                            "orange": "#ff7F00",
                            "yellow": "#fefe33",
                            "lightgreen": "00ff00",
                            "green": "#008000",
                            "bluegreen": "#0d98ba",
                            "blue": "#0000ff",
                            "purple": "#a020f0",
                            "brown": "#964b00",
                            "pink": "#ffc0cb"
                        }[ic[1].toLowerCase()];
                    }
                }
                Y = y.match(/^y(=|(>=?|≥)|(<=?|≤))/);
                if (Y != null)
                {
                    y = y.replace(/^y(=|(>=?|≥)|(<=?|≤))/, '');
                    egl = Y[0].substring(1);
                    if (egl == '≤')
                    {
                        egl = "<=";
                    }
                    if (egl == '≥')
                    {
                        egl = ">=";
                    }
                }
                else
                {
                    egl = '=';
                }

                // start graphing
                let canEquate = true;
                let result;

                if (y.includes('y') && !y.includes("infinity")) 
                {
                    canEquate = false;
                    result = "Output (*y*) must remain isolated in all equations.";
                }
                else
                {
                    result = [];
                    for (let x = -150; x < 151; x++)
                    {
                        let ans1 = equ(y, x - 0.5);
                        let ans2 = equ(y, x + 0.5);
                        let ans3 = equ(y, x);
                        if (ans1[0] == "error")
                        {
                            result = ans1[1];
                            canEquate = false;
                            break;
                        }
                        if (ans2[0] == "error")
                        {
                            result = ans2[1];
                            canEquate = false;
                            break;
                        }
                        if (ans3[0] == "error")
                        {
                            result = ans3[1];
                            canEquate = false;
                            break;
                        }
                        if ([isNaN(ans1[1]), isNaN(ans2[1]), isNaN(ans3[1])].filter(x => x).length < 2)
                        {
                            if (isNaN(ans1[1]) && !isNaN(ans2[1]))
                            {
                                result.push([egl, x, -ans3[1], -ans2[1], 0]);
                            }
                            else
                            if (!isNaN(ans1[1]) && isNaN(ans2[1]))
                            {
                                result.push([egl, x, -ans1[1], -ans3[1], 1]);
                            }
                            else
                            {
                                result.push([egl, x, -ans1[1], -ans2[1], 2]);
                            }
                        }
                        else
                        {
                            result.push([false]);
                        }
                    }
                }

                let result_;
                if (canEquate)
                {
                    ctx.strokeStyle = color;
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    for (let i = 0; i < result.length; i++)
                    {
                        //display.push(result[i]);
                        if (result[i][0])
                        {
                            if (result[i][0] == '=')
                            {
                                ctx.beginPath();
                                ctx.moveTo(result[i][1] + [0, -0.5, -0.5][result[i][4]], result[i][2]);
                                ctx.lineTo(result[i][1] + [0.5, 0, 0.5][result[i][4]], result[i][3]);
                                ctx.stroke();
                            }
                            else
                            {
                                console.log(result[i]);
                            }
                            if (result[i][0].startsWith('>'))
                            {
                                let c = new Color(color);
                                ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.4)`;
                                ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
                                ctx.beginPath();
                                ctx.moveTo(result[i][1] + [0, -0.5, -0.5][result[i][4]], -151);
                                ctx.lineTo(result[i][1] + [0, -0.5, -0.5][result[i][4]], result[i][2]);
                                ctx.lineTo(result[i][1] + [0.5, 0, 0.5][result[i][4]], result[i][3]);
                                ctx.lineTo(result[i][1] + [0.5, 0, 0.5][result[i][4]], -151);
                                ctx.fill();
                                
                                if (result[i][0].endsWith('='))
                                {
                                    ctx.strokeStyle = color;
                                    ctx.beginPath();
                                    ctx.moveTo(result[i][1] + [0, -0.5, -0.5][result[i][4]], result[i][2]);
                                    ctx.lineTo(result[i][1] + [0.5, 0, 0.5][result[i][4]], result[i][3]);
                                    ctx.stroke();
                                }
                            }
                            else
                            if (result[i][0].startsWith('<'))
                            {
                                let c = new Color(color);
                                ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.4)`;
                                ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
                                ctx.beginPath();
                                ctx.moveTo(result[i][1] + [0, -0.5, -0.5][result[i][4]], 151);
                                ctx.lineTo(result[i][1] + [0, -0.5, -0.5][result[i][4]], result[i][2]);
                                ctx.lineTo(result[i][1] + [0.5, 0, 0.5][result[i][4]], result[i][3]);
                                ctx.lineTo(result[i][1] + [0.5, 0, 0.5][result[i][4]], 151);
                                ctx.fill();
                                
                                if (result[i][0].endsWith('='))
                                {
                                    ctx.strokeStyle = color;
                                    ctx.beginPath();
                                    ctx.moveTo(result[i][1] + [0, -0.5, -0.5][result[i][4]], result[i][2]);
                                    ctx.lineTo(result[i][1] + [0.5, 0, 0.5][result[i][4]], result[i][3]);
                                    ctx.stroke();
                                }
                            }
                        }
                    }
                    result_ = new Color(color).getName();
                }
                else
                {
                    result_ = result;
                }
                display.push(input[i].split(';')[0] + " - " + result_);
            }
            let text = "Equation" + (display.length > 1 ? 's' : '') + ":\n" + display.join('\n');
            sendChat("```\n" + text + "```", new Discord.Attachment(canvas.toBuffer()));
        }
    },

    "ai": function(cmd, args, input, message, sendChat) {
        let embed = new Discord.RichEmbed();
        embed.setDescription("One day I needed to test a change I made to Squares, but I had nobody to test it with, so I created another bot to play the game with me and holy shit it kicks ass.\n\nI decided to make this new bot as public as Xyvybot so that other people can play against it, too! [Click here to invite it to your server](https://discordapp.com/oauth2/authorize?client_id=561578790837289002&scope=bot&permissions=3072)! Once you have it, just request a game with Xyvybot and then ping it!\nNote that this bot is completely useless if your server does not also have Xyvybot in it.\nAlso, the only game it can play right now is Squares. I haven't gotten around to letting it play other games, yet.");
        embed.setAuthor(
            "Xyvybot - AI",
            Images.AIvatar
        );
        embed.setColor(new Color().random());
        return sendChat({embed});
    },

    "botsbyxyvy": function(cmd, args, input, message, sendChat) {
        let embed = new Discord.RichEmbed();
        embed.setTitle("Bots by Xyvy");
        embed.setDescription("Are you tired of sorting through countless Discord bot listings trying to find one that does exactly what you need one to do? Well, stop doing that. Sometimes, a bot that does what you need it to do just doesn't exist. But it *can*, and that's where I come in! If you have money and a lack of programming knowledge and really need a bot that doesn't exist, I'll make it for you! Just click [this link](https://sites.google.com/site/botsbyxyvy/), read the information, and submit a commission request so we can get to work!");
        embed.setColor(new Color().random());
        return sendChat({embed});
    },

    "minesweeper": function(cmd, args, input, message, sendChat) {
        let w, h, d;
        if (["help"].includes(input))
        {
            let embed = new Discord.RichEmbed();
            embed.setAuthor(
                "MineSweeper",
                Images.minesweeper
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
                Images.minesweeper
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
                Images.minesweeper
            );
            embed.setDescription("||" + a.join("||\n||") + "||");
            embed.setFooter("Height: " + h + " | Width: " + w + " | Bombs: " + d);
            embed.setColor(new Color().random());
            sendChat({embed});
        }
    },
   
    // NSFW
    "nsfw": function(cmd, args, input, message, sendChat) {
        let tags = Object.keys(Nekos.nsfw).sort();

        if (message.channel.type != "dm" && !message.channel.nsfw)
        {
            return;
        }
        else
        if (!input)
        {
            let type = tags.random();
            let embed = new Discord.RichEmbed();
            embed.setAuthor(
                "x!nsfw",
                Images.nekosLife
            );
            embed.setDescription(`Tag: \`${type}\` | Do \`x!nsfw ${type}\` to see more like this\nDo \`x!nsfw tags\` to see all tags`);
            embed.setFooter("Powered by Nekos.Life");
            embed.setColor(new Color().random());
            return Nekos.nsfw[type]().then(nsfw => sendChat(embed.setImage(nsfw.url)));
        }
        else
        if (input.startsWith('['))
        {
            return sendChat("With***out*** the brackets. How is that ***not*** obvious? You're probably too young to look at porn, go play violent video games, instead.");
        }
        else
        if (["tags", "help"].includes(input))
        {
            let embed = new Discord.RichEmbed();
            embed.setAuthor(
                "x!nsfw",
                Images.nekosLife
            );
            embed.setTitle("NSFW Tags");
            let joined = '';
            for (let i = 0; i < tags.length; i++)
            {
                joined += tags[i] + ' '.repeat(16 - (tags[i].length % 16));
            }
            embed.setDescription('```\n' + joined.trim() + '```\n**Usage**: `x!nsfw [tag]`');
            embed.setFooter("Powered by Nekos.Life");
            embed.setColor(new Color().random());
            return Nekos.nsfw.eroNeko().then(help => sendChat(embed.setImage(help.url)));
        }
        else
        if (["random"].includes(args[0]))
        {
            let types = [];
            let nopes = [];
            let type;
            if (!args[1])
            {
                type = tags.random();
            }
            else
            {
                for (let i = 1; i < args.length; i++)
                {
                    let tag = tags.filter(tag => {
                        if (!types.includes(tag) && (tag.toLowerCase() == args[i].toLowerCase() || tag.toLowerCase().includes(args[i].toLowerCase())))
                        {
                            return true;
                        }
                    });
                    if (tag.length == 0)
                    {
                        nopes.push(args[i]);
                    }
                    else
                    {
                        types = types.concat(tag);
                    }
                }
                if (types.length + nopes.length > tags.length)
                {
                    return sendChat("There's not even that many tags, try again.");
                }
                else
                if (types.length > 0)
                {
                    type = types.random();
                }
                else
                {
                    return sendChat("None of those tags exist.");
                }
            }
        
            let embed = new Discord.RichEmbed();
            embed.setAuthor(
                "x!nsfw",
                Images.nekosLife
            );
            embed.setDescription(`Tag: \`${type}\`\nSelected randomly from: [\`${types.join('`, `')}\`]${nopes.length > 0 ? `\nQueried tags that don't exist: [\`${nopes.join('`, `')}\`]` : ''}`);
            embed.setFooter("Powered by Nekos.Life");
            embed.setColor(new Color().random())
            return Nekos.nsfw[type]().then(nsfw => sendChat(embed.setImage(nsfw.url)));
        }
        else
        if (["exclude"].includes(args[0]))
        {
            let types = [];
            let nopes = [];
            if (!args[1])
            {
                type = tags.random();
            }
            else
            {
                for (let i = 1; i < args.length; i++)
                {
                    let tag = tags.filter(tag => {
                        if (!types.includes(tag) && (tag.toLowerCase() == args[i].toLowerCase() || tag.toLowerCase().includes(args[i].toLowerCase())))
                        {
                            return true;
                        }
                    });
                    if (tag.length == 0)
                    {
                        nopes.push(args[i]);
                    }
                    else
                    {
                        types = types.concat(tag); 
                    }
                }

                if (types.length + nopes.length > tags.length)
                {
                    return sendChat("There's not even that many tags, try again.");
                }
                else
                if (types.length == tags.length)
                {
                    return sendChat("That removes literally every tag, try again.");
                }
                if (types.length > 0)
                {
                    let Types = [];
                    for (let i = 0; i < tags.length; i++)
                    {
                        if (!types.includes(tags[i]))
                        {
                            Types.push(tags[i]);
                        }
                    }
                    type = Types.random();
                }
                else
                {
                    return sendChat("None of those tags exist.");
                }
            }
            let embed = new Discord.RichEmbed();
            embed.setAuthor(
                "x!nsfw",
                Images.nekosLife
            );
            embed.setDescription(`Tag: \`${type}\`\nTags excluded: [\`${types.join('`, `')}\`]${nopes.length > 0 ? `\nQueried tags that don't exist: [\`${nopes.join('`, `')}\`]` : ''}`);
            embed.setFooter("Powered by Nekos.Life");
            embed.setColor(new Color().random())
            return Nekos.nsfw[type]().then(nsfw => sendChat(embed.setImage(nsfw.url)));
        }
        else
        if (args.length > 1)
        {
            let types = [];
            let nopes = [];
            for (let i = 0; i < args.length; i++)
            {
                let tag = tags.filter(tag => {
                    if (!types.includes(tag) && (tag.toLowerCase() == args[i].toLowerCase() || tag.toLowerCase().includes(args[i].toLowerCase())))
                    {
                        return true;
                    }
                });
                if (tag.length == 0)
                {
                    nopes = nopes.push(args[i]);
                }
                else
                {
                    types = types.concat(tag);
                }
            }
            if (types.length == 0)
            {
                return sendChat("Query matched no tags, try again.");
            }
            let queue = [];
            if (types.length <= 5)
            {
                queue = queue.concat(types);
            }
            if (types.length > 5)
            {
                for (let i = 0; i < 5; i++)
                {
                    queue.push(types[i]);
                }
            }
            let Types = [];
            for (let i = 0; i < queue.length; i++)
            {
                Nekos.nsfw[queue[i]]().then(nsfw => {
                    Types.push(nsfw.url);
                    if (Types.length == queue.length)
                    {
                        let Tags = [];
                        for (let x = 0; x < Types.length; x++)
                        {
                            Tags.push(`[${types[x]}](${Types[x]})`);
                        }
                        let embed = new Discord.RichEmbed();
                        embed.setAuthor(
                            "x!nsfw",
                            Images.nekosLife
                        );
                        embed.setDescription(`Tags: [\`${queue.join('`, `')}\`]${types.length > 5 ? `\nMaximum of 5 tags allowed` : ''}\n\n[${Tags.join(']\n\n[')}]`);
                        embed.setFooter("Powered by Nekos.Life");
                        embed.setColor(new Color().random());
                        embed.setImage(queue[0]);
                        return sendChat({embed});
                    }
                });
            }
        }
        else
        {
            let tag = tags.filter(tag => {
                if (tag.toLowerCase() == args[0].toLowerCase() ||tag.toLowerCase().includes(args[0].toLowerCase()))
                {
                    return true;
                }
            });
            if (tag.length == 0)
            {
                return sendChat("Sorry, I don't have that");
            }
            else
            {
                type = tag.random();
            }
        
            let embed = new Discord.RichEmbed();
            embed.setAuthor(
                "x!nsfw",
                Images.nekosLife
            );
            embed.setDescription(`Tag: \`${type}\``);
            embed.setFooter("Powered by Nekos.Life");
            embed.setColor(new Color().random())
            return Nekos.nsfw[type]().then(nsfw => sendChat(embed.setImage(nsfw.url)));
        }
    },
   
    // Admin-only
    "js": function(cmd, args, input, message, sendChat) {
        if (!admins.includes(message.author.id))
        {
            return;
        }
        if (!message.content.startsWith("x!js"))
        {
            return;
        }
        if (input.startsWith("```js\n") && input.endsWith("```"))
        {
            let execute = input.substring(6, input.length - 3);
            let embed = new Discord.RichEmbed();
            embed.setTitle("x!js");
            embed.setColor(new Color().random());
            embed.setTimestamp();
            try
            {
                embed.setDescription("```js\n" + JSON.stringify(eval(execute)) + "```");
                sendChat({embed});
            }
            catch (err)
            {
                let stack = err.stack.split('\n');
                let a = stack.length;
                for (let i = 0; i < stack.length; i++)
                {
                    if (stack[i].includes("at Client.emit"))
                    {
                        a = i;
                        break;
                    }
                }
                let Err = [];
                let b = false;
                for (let i = 1; i < a; i++)
                {
                    Err.push(stack[i]);
                    if (/<anonymous>:[0-9]{1,}:[0-9]{1,}/.test(stack[i]))
                    {
                        let c = stack[i].match(/<anonymous>:[0-9]{1,}:[0-9]{1,}/)[0].split(':');
                        b = [execute.split('\n')[Number(c[1]) - 1], Number(c[2]) - 1];
                    }
                }
                if (!b)
                {
                    embed.setDescription("```" + err + "``````\n" + Err.join("\n") + "```");
                }
                else
                {
                    embed.setDescription("```" + err + "``````" + b[0] + '\n' + ' '.repeat(b[1]) + "^```");
                }
                sendChat({embed});
            }
        }
    },
   
    "pg": function(cmd, args, input, message, sendChat) {
        if (!admins.includes(message.author.id))
        {
            return;
        }
        if (input.startsWith("```sql\n") && input.endsWith("```"))
        {
            return db.query(input.substring(7, input.length - 3), function(err, res) {
                let embed = new Discord.RichEmbed();
                embed.setTitle("x!pg");
                embed.setColor(new Color().random());
                embed.setTimestamp();
                if (err)
                {
                    embed.setDescription("```" + err + "```");
                    return sendChat({embed});
                }
                embed.setDescription(table(res));
                return sendChat({embed});
            });
        }
    },
   
};

exports.Images = {
    graph: null,
    avatar: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/avatar.png",
    AIvatar: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/AI.png",
    minesweeper: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/minesweeper.png",
    nekosLife: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot/master/assets/misc/nekos_life.png"
};
Canvas.loadImage("/app/assets/misc/graph.png").then(image => {
    exports.Images.graph = image;
});

Object.defineProperty(Array.prototype, 'clone', {
    value: function() {
        return JSON.parse(JSON.stringify(this));
    }
});
Object.defineProperty(Array.prototype, 'random', {
    value: function(a) {
        if (!a)
        {
            return this[Math.random() * this.length | 0];
        }
        else
        {
            let b = [];
            let c = [];
            if (this.length < a)
            {
                a = this.length;
            }
            for (let i = a; i--;)
            {
                let d = Math.random() * this.length | 0;
                if (c.includes(d))
                {
                    i++;
                }
                else
                {
                    c.push(d);
                }
            }
            for (let i = a; i--;)
            {
                b.push(this[c[i]]);
            }
            return b;
        }
    }
});
Object.defineProperty(Array.prototype, 'shuffle', {
    value: function() {
        let a = JSON.parse(JSON.stringify(this));
        let b = [];
        for (let i = 0; i < this.length; i++)
        {
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
    for (let i = n; i <= a; i++)
    {
        c += b;
    }
    return c;
}
Math.prod = function(n, a, b) {
    n = Math.round(n);
    a = Math.round(a);
    c = 0;
    for (let i = n; i <= a; i++)
    {
        c *= b;
    }
    return c;
}
function equ(equation, x) {
    if (x !== undefined)
    {
        equation = equation.replace(/x/g, '(' + x + ')');
    }
    let terms = [ [
            /(pi|π)/g,
            "(Math.PI)"
        ], [
            /(infinity|∞)/g,
            "(Math.Infinity)"
        ]
    ];
    for (let i = 0; i < terms.length; i++)
    {
        equation = equation.replace(terms[i][0], terms[i][1]);
    }
    let methods = [
        [// Sin, Cos, Tan, or Log of a number (went ahead and fit Log into here because it uses similar syntax)
            // \sin(5)
            /\\(sin|cos|tan|log)(-?[0-9.]{1,}|\(-?[0-9.]{1,}\))/g,
            "Math.$1($2)"

        ], [// Asin, Acos, or Atan of a number
            // \asin(5)
            /\\a(sin|cos|tan)(-?[0-9.]{1,}|\(-?[0-9.]{1,}\))/g,
            "Math.a$1($2)"

        ], [// Sinh, Cosh, or Tanh of a number
            // \sinh(5)
            /\\(sin|cos|tan)h(-?[0-9.]{1,}|\(-?[0-9.]{1,}\))/g,
            "Math.$1h($2)"

        ], [// Asinh, Acosh, or Atanh of a number
            // \asinh(5)
            /\\a(sin|cos|tan)h(-?[0-9.]{1,}|\(-?[0-9.]{1,}\))/g,
            "Math.a$1h($2)"

        ], [// Root of a number, if the radicand is a real number and the radical is 2
            // \sqrt(5)
            /(?:\\(?:sq|)rt|√)(-?[0-9\.]{1,}|\(-?[0-9.]{1,}\))/g,
            "Math.sqrt($1)"

        ], [// If the radicand is positive
            // \rt[2](5)
            /(?:\\rt|√)\[(-?[0-9]{1,})\](\([0-9.]{1,}\)|[0-9.]{1,})/g,
            "Math.pow($2,(1/Math.round($1)))"

        ], [// If the radicand is negative and the radical is odd
            // \rt[3](-5)
            /(?:\\rt|√)\[(\-?[0-9]{0,}[13579]{1})\](?:\(-([0-9.]{1,})\)|-([0-9.]{1,}))/g,
            "-Math.pow($2$3,(1/Math.round($1)))"

        ], [// If the radicand is negative and the radical is even
            // \rt[2](-5)
            /(?:\\rt|√)\[-?[0-9]{0,}[02468]{1}\](?:\(-[0-9.]{1,}\)|-[0-9.]{1,})/g,
            "NaN"

        ], [// A number number to the power of another number
            // 5^7
            /(\(-?[0-9.]{1,}\)|(?![0-9)]-)[0-9.]{1,})(?!sin|cos|tan)\^(?!-1)(\(-?[0-9]{1,}\)|-?[0-9]{1,})/g,
            "(Math.pow($1,Math.round($2)))"

        ], [// Summation function
            // \sum[n=0](5)5
            /(?:\\sum|∑)\[n=([0-9]{1,})\]\(([0-9]{1,})\)(-?[0-9.]{1,}|\(\-?[0-9.]{1,}\))/g,
            "Math.sum($1, $2, $3)"

        ], [// Product function
            // \prod[n=0](5)5
            /(?:\\prod|∏)\[n=([0-9]{1,})\]\(([0-9]{1,})\)(-?[0-9.]{1,}|\(-?[0-9.]{1,}\))/g,
            "Math.prod($1, $2, $3)"

        ], [// The absolute value of a number
            // |-5|
            /\|(-?[0-9.+\-/*()]{1,})\|/g,
            "Math.abs($1)"

        ], [// A number against a parentheses sequence
            // 5(7)
            /([0-9.])\(/g,
            "$1*("

        ], [// Same but reversed
            // (7)5
            /\)([0-9.])/,
            ")*$1"

        ], [// A number against a Javascript Math function
            // 5Math.sin(7)
            /([0-9.])M/g,
            "$1*M"

        ], [// Parentheses sequence against parentheses sequence
            // (5)(7)
            /\)\(/g,
            ")*("
        ]
    ];
    let lastEquation;
    for (let i = 0; i < 1; i++)
    {
        lastEquation = equation;
        if (/\(Math.(PI|Infinity)\)/g.test(equation))
        {
            equation = equation.replace(/\(Math.PI\)/g, Math.PI);
            equation = equation.replace(/\(Math.Infinity\)/g, Math.Infinity);
        }
        if (/(?![0-9)])-\(-[0-9.]{1,}\)/g.test(equation))
        {
            equation = equation.replace(/(?![0-9)])-\(-([0-9.]{1,})\)/g, "$1");
        }
        if (/([0-9)])-\(-[0-9.]{1,}\)/g.test(equation))
        {
            equation = equation.replace(/([0-9)])-\(-([0-9.]{1,})\)/g, "$1+$2");
        }
        if (/\([0-9.+\-/*]{1,}\)/.test(equation))
        {
            equate = equation.match(/\([0-9.+\-/*]{1,}\)/g);
            for (let i = 0; i < equate.length; i++)
            {
                if (/\(/.test(equate[i]) && /\)/.test(equate[i]) && equate[i].match(/\(/g).length == equate[i].match(/\)/g).length)
                {
                    equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
                }
            }
        }
        if (/\([0-9.()+\-/*]{1,}\)/.test(equation))
        {
            equate = equation.match(/\([0-9.()+\-/*]{1,}\)/g);
            for (let i = 0; i < equate.length; i++)
            {
                if (/\(/.test(equate[i]) && /\)/.test(equate[i]) && equate[i].match(/\(/g).length == equate[i].match(/\)/g).length)
                {
                    equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
                }
            }
        }
        for (let i = 0; i < methods.length; i++)
        {
            equation = equation.replace(methods[i][0], methods[i][1]);
        }
        if (/Math\.(a?sinh?|a?cosh?|a?tanh?|log|sqrt|pow|abs|sum|prod|round)\((\(\-?[0-9.]{1,}\)|-?[0-9.]{1,})(,(\(\-?[0-9.]{1,}\)|\-?[0-9.]{1,}))?\)/g.test(equation))
        {
            equate = equation.match(/Math\.(a?sinh?|a?cosh?|a?tanh?|log|sqrt|pow|abs|sum|prod|round)\((\(\-?[0-9.]{1,}\)|-?[0-9.]{1,})(,(\(\-?[0-9.]{1,}\)|\-?[0-9.]{1,}))?\)/g);
            for (let i = 0; i < equate.length; i++)
            {
                equation = equation.replace(equate[i], '(' + eval(equate[i]) + ')');
            }
        }
        if (/(?:[\+\-\*\/\(,]\(-?[0-9.]{1,}\)|\(-?[0-9.]{1,}\)[\+\-\*\/\),])/.test(equation)) {
            equation = equation.replace(/([\+\-\*\/\(,])\((-?[0-9.]{1,})\)/, "$1$2");
            equation = equation.replace(/\((-?[0-9.]{1,})\)([\+\-\*\/\),])/, "$1$2");
        }
        if (/\(-?[0-9.]{1,}\)/g.test(equation))
        {
            equation = equation.replace(/\((-?[0-9.]{1,})\)/g, "$1");
        }
        if (equation != lastEquation)
        {
            i--;
        }
    }
    try
    {
        return ["equated", eval(equation)];
    }
    catch (err)
    {
        return ["error", err];
    }
}

exports.version = version;
exports.command = command;
exports.other = other;
exports.bot = bot;
