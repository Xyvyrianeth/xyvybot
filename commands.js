var version = "2.24.0.0";

const Discord = require("discord.js");
const Canvas = require("canvas");
const Jimp = require("jimp");
const GIFEncoder = require("gifencoder");
const streamBuffers = require('stream-buffers');

var client = require("./Xyvy.js").client;
var config = require("./Xyvy.js").config;
var Profile = require('./profile.js');
var Color = require('./color.js').rgb;
var titles = require("./stuffs/titles.json");
var backgrounds = require("./stuffs/images.json");

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

const paladinsAPI = require("paladins-api");
const paladins = new paladinsAPI(config.HIREZ_API[0], config.HIREZ_API[1]);
var palID;
paladins.connect("PC", (err, res) => {
    if (err) return console.log(err);
    palID = res;
});

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
    connect4: require("./games/connect4.js"),
    squares: require("./games/squares.js"),
    othello: require("./games/othello.js"),
    gomoku: require("./games/gomoku.js")
}

function command(message) {
  
    let a = message.channel.type == "dm" ? "user" : "guild";
    let args = message.content.split(/ {1,}/);
    let cmd = args.shift().replace("x!", '').toLowerCase();
    let input = args.join(' ');
    let user = a == "user" ? message.channel.recipient : message.channel.guild.members.get(message.author.id);
    let sendChat = function(content, options) {
        if (typeof content == "string") content = content.replace(/\$user\$/g, `<@${message.author.id}>`);
        if (options == undefined) message.channel.send(content);
        else message.channel.send(content, options);
    }
   
    for (let i in aliases[a])
        if (aliases[a][i].includes(cmd))
            try {
                return commands[i](cmd, args, input, message, sendChat, user, a);
            } catch (error) {
                sendChat("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~```");
                let errs = [];
                for (let i = 0; i < error.stack.split('\n').length; i++) {
                    if (error.stack.split('\n')[i].includes("at emitOne")) break
                    else errs.push(error.stack.split('\n')[i]);
                }
                client.guilds.get("399327996076621825").channels.get("467902250128506880").send(newError(message, cmd, errs));
            }
   
}
   
function other(message) {
    let sendChat = function(content, options) {
        if (typeof content == "string") content = content.replace(/\$user\$/g, `<@${message.author.id}>`);
        if (options == undefined) message.channel.send(content);
        else message.channel.send(content, options);
    }
    if (message.channel.type == "dm" || message.author.bot) return;

    for (let i in games) {
        if (games[i].channels[message.channel.id] && games[i].channels[message.channel.id].started && message.author.id == games[i].channels[message.channel.id].player && games[i].channels[message.channel.id].RE.test(message.content)) {
            message.delete();
            try {
                return sendChat(games[i].takeTurn(message.channel, message.content));
            } catch (error) {
                delete games.connect4.channels[message.channel.id];
                sendChat("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough~```");
                let a = [];
                for (let i = 0; i < error.stack.split('\n').length; i++) {
                    if (error.stack.split('\n')[i].includes("at emitOne")) break
                    else a.push(error.stack.split('\n')[i]);
                }
                return client.guilds.get("399327996076621825").channels.get("467902250128506880").send(newError(message, cmd, a)); 
            }
        }
    }
}
   
function bot(message) {
    if (message.attachments.array().length != 0) {
        let ids;
        if (games.othello.channels[message.channel.id]) ids = games.othello.channels[message.channel.id].players;
        else if (games.squares.channels[message.channel.id]) ids = games.squares.channels[message.channel.id].players;
        else if (games.connect4.channels[message.channel.id]) ids = games.connect4.channels[message.channel.id].players;
        else return;
        db.query(`SELECT * FROM profiles WHERE id = '${ids[0]}' OR id = '${ids[1]}'`, function(err, res) {
            if (err) return message.channel.send("```" + err + "```");
            let result = false;
            if (games.connect4.channels[message.channel.id]) {
                if (/connect4_0_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].filename)) return games.connect4.channels[message.channel.id].lastDisplay = message;
                if (/connect4_1_[0-9]{1,}\.png/.test(message.attachments.array()[0].filename)) {
                    game = games.connect4.channels[message.channel.id];
                    result.winner = game.players[game.winner];
                    result.loser = game.players[game.winner == 0 ? 1 : 0];
                    result.game = "1";
                    delete games.connect4.channels[message.channel.id];
                }
                if (/connect4_2_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].filename)) return delete games.connect4.channels[message.channel.id];
            } else if (games.squares.channels[message.channel.id]) {
                if (/squares_0_1?[0-9]_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].filename)) return games.squares.channels[message.channel.id].lastDisplay = message;
                if (/squares_1_1?[0-9]_[0-9]{1,}\.png/.test(message.attachments.array()[0].filename)) {
                    game = games.squares.channels[message.channel.id];
                    result.winner = game.players[game.winner];
                    result.loser = game.players[game.winner == 0 ? 1 : 0];
                    result.game = "2";
                    delete games.squares.channels[message.channel.id];
                }
                if (/squares_2_1?[0-9]_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].filename)) return delete games.squares.channels[message.channel.id];
            } else if (games.othello.channels[message.channel.id]) {
                if (/othello_0_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].filename)) return games.othello.channels[message.channel.id].lastDisplay = message;
                if (/othello_1_[0-9]{1,}\.png/.test(message.attachments.array()[0].filename)) {
                    game = games.othello.channels[message.channel.id];
                    result.winner = game.players[game.winner];
                    result.loser = game.players[game.winner == 0 ? 1 : 0];
                    result.game = "3";
                    result.score = game.score;
                    delete games.othello.channels[message.channel.id];
                }
                if (/othello_2_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].filename)) return delete games.othello.channels[message.channel.id];
            }
            if (result) {
                let wins = false;
                let lose = false;
                if (res.rows.length == 0) return;
                if (res.rows.length == 1) {
                    wins = res.rows[0].id == result.winner ? res.rows[0] : res.rows[1];
                } else {
                    wins = res.rows[0].id == result.winner ? res.rows[0] : res.rows[1];
                    lose = res.rows[0].id == result.loser ? res.rows[0] : res.rows[1];
                }
                if (wins) {
                    if (result.game == '1' && result.loser.id == "238916443402534914") {
                        wins.titles.push("beatRDB");
                        message.channel.send("<@" + wins.id + "> has obtained the title \"" + titles["beatRDB"] + "\" (`beatRDB`).");
                    }
                    if (result.game == '1' && (result.turn == 7 || result.turn == 8)) {
                        wins.titles.push("winsIn4");
                        message.channel.send("<@" + wins.id + "> has obtained the title \"" + titles["winsIn4"] + "\" (`winsIn4`).");
                    }
                    if (result.game == '3' && (result.score[0] == 0 || result.score[1] == 0)) {
                        wins.titles.push("allBorW");
                        message.channel.send("<@" + wins.id + "> has obtained the title \"" + titles["allBorW"] + "\" (`allBorW`).");
                    }
                    if (result.game == '2' && (result.score[0] >= 100 || result.score[1] >= 100)) {
                        wins.titles.push("100sqrs");
                        message.channel.send("<@" + wins.id + "> has obtained the title \"" + titles["100sqrs"] + "\" (`100sqrs`).");
                    }
                    numbers = [5, 10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
                    number2 = "5__wins 10_wins 25_wins 50_wins 100wins 200wins 300wins 400wins 500wins 600wins 700wins 800wins 900wins 1K_wins".split(' ');
                    for (let i = 0; i < numbers.length; i++) {
                        if (wins.wins1 + wins.wins2 + wins.win3 + wins.wins4 + wins.wins5 == numbers[i]) {
                            if (!wins.titles.includes(number2[i])) wins.titles.push(number2[i]);
                            message.channel.send("<@" + wins.id + "> has obtained the title \"" + titles[number2[i]] + "\" (`" + number2[i] + "`).");
                        }
                    }
                    if (wins.wins1 + wins.wins2 + wins.win3 + wins.wins4 + wins.wins5 + wins.lose1 + wins.lose2 + wins.lose3 + wins.lose4 + wins.lose5 == 1000) {
                        wins.titles.push("1K_play");
                        message.channel.send("<@" + wins.id + "> has obtained the title \"" + titles["1K_play"] + "\" (`1K_play`).");
                    }
                    if (wins.money + 5 == 10**5 && !wins.titles.includes("million")) {
                        wins.titles.push("million");
                        message.channel.send("<@" + wins.id + "> has obtained the title \"" + titles["million"] + "\" (`million`).");
                    }
                    db.query(`UPDATE profiles
                              SET titles = ARRAY ${JSON.stringify(wins.titles).replace(/"/g, "'")}, wins${result.game} = ${wins["wins" + result.game] + 1}, money = "${wins.money + 5}
                              WHERE id = '${wins.id}'`, function(err) {
                        if (err) return message.channel.send("```" + err + "```");
                    });
                }
                if (lose) {
                    numbers = [5, 10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
                    number2 = "5__lose 10_lose 25_lose 50_lose 100lose 200lose 300lose 400lose 500lose 600lose 700lose 800lose 900lose 1K_lose".split(' ');
                    for (let i = 0; i < numbers.length; i++) {
                        if (lose.lose1 + lose.lose2 + lose.win3 + lose.lose4 + lose.lose5 == numbers[i]) {
                            if (!lose.titles.includes(number2[i])) lose.titles.push(number2[i]);
                            message.channel.send("<@" + lose.id + "> has obtained the title \"" + titles[number2[i]] + "\" (`" + number2[i] + "`).");
                        }
                    }
                    if (lose.wins1 + lose.wins2 + lose.win3 + lose.wins4 + lose.wins5 + lose.lose1 + lose.lose2 + lose.lose3 + lose.lose4 + lose.lose5 == 1000) {
                        lose.titles.push("1K_play");
                        message.channel.send("<@" + lose.id + "> has obtained the title \"" + titles["1K_play"] + "\" (`1K_play`).");
                    }
                    db.query(`UPDATE profiles
                              SET titles = ARRAY ${JSON.stringify(lose.titles).replace(/"/g, "'")}, lose${result.game} = ${lose["lose" + result.game] + 1}
                              WHERE id = '${lose.id}'`, function(err) {
                        if (err) return message.channel.send("```" + err + "```");
                    });
                }
            }
        });
    } else {
        if (message.content.includes("is now requesting a new game of Connect Four")) return games.connect4.channels[message.channel.id].lastDisplay = message;
        if (message.content.includes("is now requesting a new game of Squares")) return games.squares.channels[message.channel.id].lastDisplay = message;
        if (message.content.includes("is now requesting a new game of Othello")) return games.othello.channels[message.channel.id].lastDisplay = message;
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

function newError(message, cmd, a) {
    return `\`\`\`\nError with command x!${cmd}\`\`\`\`\`\`Server: ${message.channel.guild.name} (${message.channel.guild.id})\n`
         + `Channel: ${message.channel.name} (${message.channel.id})\`\`\`\n`
         + `\`\`\`User errored on:\`\`\`<@${message.author.id}>\n\n`
         + `\`\`\`\n`
         + `Message sent:\`\`\`\`\`\`\n`
         + `${message.content.replace(/`/g, "\\\`")}\`\`\`\n`
         + `\`\`\`\n`
         + `${a.join("\n")}\`\`\``
}
   
function newUser(id, channel) {
    let image = backgrounds.ids.random();
    db.query(`INSERT INTO profiles (
        id,       color,   title,      titles,             background,  backgrounds,         lorr,     money,  wins1,  lose1,  wins2,  lose2,  wins3,  lose3,  wins4,  lose4,  wins5,  lose5
    ) VALUES (
        '${id}',  '#aaa',  'default',  ARRAY ['default'],  '${image}',  ARRAY ['${image}'],  'right',  0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0
    )`, function(err) {
        if (err) return channel.send("```" + err + "```");
    });
    return { id: id, color: "#aaa", title: "default", titles: ["default"], background: image, backgrounds: [image], lorr: "right", money: 0, wins1: 0,  lose1: 0,  wins2: 0,  lose2: 0,  wins3: 0,  lose3: 0,  wins4: 0,  lose4: 0,  wins5: 0,  lose5: 0 };
}

var aliases = {
    guild: {
        // Games
        "connect4": ["connectfour", "connect4", "cfour", "c4"],
        "squares": ["squares"],
        "othello": ["othello"],
        "profile": ["profile", "scorecard", "prof"],
       
        // Utility
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
        "calc": ["calc"],
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
    "connect4": function(cmd, args, input, message, sendChat, user) {
        if (message.channel.type == "dm") return sendChat("This command is not available through DMs!");
        if (!input) return sendChat(`__**Connect Four**__\nTo start a game, type \`x!${cmd} start\`!`);
        if (["start"].includes(input)) {
            if (!games.connect4.channels[message.channel.id]) return sendChat(games.connect4.newGame(message.channel, message.author.id, cmd));
            if (!games.connect4.channels[message.channel.id].started) {
                if (message.author.id != games.connect4.channels[message.channel.id].players[0] || message.author.id == "357700219825160194") {
                    k = games.connect4.startGame(message.channel, message.author.id);
                    return sendChat(k[0], k[1]);
                } else return sendChat("You cannot play yourself!");
            }
            if (games.connect4.channels[message.channel.id].started) {
                return sendChat("Game has already started, you cannot join it now.");
            }
        } else if (["board", "showboard"].includes(input)) {
            if (!games.connect4.channels[message.channel.id]) return sendChat("There is no active Connect Four game in this channel, $user$!");
            if (!games.connect4.channels[message.channel.id].started) return sendChat("The game has not yet started, $user$!");
            return sendChat(new Discord.Attachment(games.connect4.drawBoard(games.connect4.channels[message.channel.id], 0)))
        } else if (["quit", "forfeit", "leave"].includes(input)) {
            if (!games.connect4.channels[message.channel.id]) return sendChat("There is not a game in this channel for you to quit!");
            if (message.author.id != games.connect4.channels[message.channel.id].players[0] && message.author.id != games.connect4.channels[message.channel.id].players[1]) return sendChat("You are not a participant of this game, $user$!");
            if (!games.connect4.channels[message.channel.id].started) sendChat("$user$ has cancelled the pending game.");
            else sendChat("$user$ has forfeit the game.");
            delete games.connect4.channels[message.channel.id];
        } else if (["rules", "howtoplay"].includes(args[0])) {
               
        }
    },
   
    "squares": function(cmd, args, input, message, sendChat, user) {
        if (message.channel.type == "dm") return sendChat("This command is not available through DMs!");
        if (!input) return sendChat(`__**Squares**__\nTo start a game, type \`x!${cmd} start\`!`);
        if (["start"].includes(args[0])) {
            if (!games.squares.channels[message.channel.id]) {
                if (!args[1]) size = 10;
                else if (!isNaN(args[1])) return sendChat("Invalid board size.");
                else if (args[1] > 15) return sendChat("Board size cannot be bigger than 15x15");
                else if (args[1] < 8) return sendChat("Board size cannot be smaller than 8x8");
                return sendChat(games.squares.newGame(message.channel, message.author.id, cmd, size, true));
            }
            if (!games.squares.channels[message.channel.id].started) {
                if (message.author.id != games.squares.channels[message.channel.id].players[0] || message.author.id == "357700219825160194") {
                    k = games.squares.startGame(message.channel, message.author.id);
                    return sendChat(k[0], k[1]);
                } else return sendChat("You cannot play yourself!");
            }
            if (games.squares.channels[message.channel.id].started) {
                return sendChat("Game has already started, you cannot join it now.");
            }
        } else if (["board", "showboard"].includes(input)) {
            if (!games.squares.channels[message.channel.id]) return sendChat("There is no active squares game in this channel, $user$!");
            if (!games.squares.channels[message.channel.id].started) return sendChat("The game has not yet started, $user$!");
            return sendChat(new Discord.Attachment(games.squares.drawBoard(games.squares.channels[message.channel.id], 0)))
        } else if (["quit", "forfeit", "leave"].includes(input)) {
            if (!games.squares.channels[message.channel.id]) return sendChat("There is not a game in this channel for you to quit!");
            if (message.author.id != games.squares.channels[message.channel.id].players[0] && message.author.id != games.squares.channels[message.channel.id].players[1]) return sendChat("You are not a participant of this game, $user$!");
            if (!games.squares.channels[message.channel.id].started) sendChat("$user$ has cancelled the pending game.");
            else sendChat("$user$ has forfeit the game.");
            delete games.squares.channels[message.channel.id];
        } else if (["rules", "howtoplay"].includes(args[0])) {
               
        }
    },
   
    "othello": function(cmd, args, input, message, sendChat, user) {
        if (message.channel.type == "dm") return sendChat("This command is not available through DMs!");
        if (!input) return sendChat(`__**Othello**__\nTo start a game, type \`x!${cmd} start\`!`);
        if (["start"].includes(input)) {
            message.delete();
            if (!games.othello.channels[message.channel.id]) return sendChat(games.othello.newGame(message.channel, message.author.id, cmd));
            if (!games.othello.channels[message.channel.id].started) {
                if (message.author.id != games.othello.channels[message.channel.id].players[0] || message.author.id == "357700219825160194") {
                    k = games.othello.startGame(message.channel, message.author.id);
                    return sendChat(k[0], k[1]);
                } else return sendChat("You cannot play yourself!");
            }
            if (games.othello.channels[message.channel.id].started) {
                return sendChat("Game has already started, you cannot join it now.");
            }
        } else if (["board", "showboard"].includes(input)) {
            if (!games.othello.channels[message.channel.id]) return sendChat("There is no active Othello game in this channel, $user$!");
            if (!games.othello.channels[message.channel.id].started) return sendChat("The game has not yet started, $user$!");
            return sendChat(new Discord.Attachment(games.othello.drawBoard(games.othello.channels[message.channel.id], 0)));
        } else if (["quit", "forfeit", "leave"].includes(input)) {
            if (!games.othello.channels[message.channel.id]) return sendChat("There is not a game in this channel for you to quit!");
            if (message.author.id != games.othello.channels[message.channel.id].players[0] && message.author.id != games.othello.channels[message.channel.id].players[1]) return sendChat("You are not a participant of this game, $user$!");
            if (!games.othello.channels[message.channel.id].started) sendChat("$user$ has cancelled the pending game.");
            else sendChat("$user$ has forfeit the game.");
            delete games.othello.channels[message.channel.id];
        } else if (["rules", "howtoplay"].includes(args[0])) {
               
        }
    },

    "profile": function(cmd, args, input, message, sendChat, user) {
        if (!input || RE.ping.test(input) || RE.id2.test(input)) {
            let member;
            if (!input) member = message.channel.guild.members.get(message.author.id);
            else if (message.channel.type !== "dm") member = message.channel.guild.members.get(input.match(RE.id1)[0]);
            else return sendChat("Cannot display other users' profiles in DMs, yet, sorry~");
  
            if (member == null) return sendChat("User not found.");
            else member = member.user;
   
            db.query(`SELECT * FROM profiles WHERE id = '${member.id}'`, function(err, res) {
                if (err) return sendChat("```" + err + "```");
  
                let profile;
                if (res.rows.length == 0 && !input) profile = newUser(message.author.id, message.channel);
                else if (res.rows.length == 0) return sendChat("No user with that ID currently has a profile.");
                else profile = res.rows[0];
  
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
        
        else if (input.startsWith('[')) return sendChat("With***out*** the brackets, you twit.");
        
        else if (["background", "backgrounds", "bg", "bgs"].includes(args[0])) {
            if (!args[1] && !["backgrounds", "bgs"].includes(args[0])) {
                return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sendChat("```" + err + "```");
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you do not yet have a background. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].backgrounds.length == 1) return sendChat("This is your current background, $user$!\nTo get more backgrounds, do `x!profile background purchase` to get a new one!\n**Note**: buying a new background will give you a random one, but you will be able to keep it along with any previously owned backgrounds, such as the one you were given when you first created a profile. All backgrounds cost 20 Xuvys.", new Discord.Attachment("https://i.imgur.com/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == "j" ? ".jpg" : ".png")));
                    return sendChat("This is your current background, $user$! New backgrounds are still 20 Xuvys.\nDo `x!profile backgrounds` to view the other backgrounds you own.", new Discord.Attachment("https://i.imgur.com/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == "j" ? ".jpg" : ".png")));
                });
            } else if (["owned"].includes(args[1]) || (!args[1] && ["backgrounds", "bgs"].includes(args[0]))) {
                db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) sendChat("```" + err + "```");
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you cannot view the backgrounds you own. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].backgrounds.length == 1) return sendChat("You only have 1 background, and it's the one you have equipped.");
                    let b1 = res.rows[0].backgrounds;
                    let b2 = [];
                    for (let i = 0; i < res.rows[0].backgrounds.length; i++) {
                        if (b1[i] !== res.rows[0].background) b2.push('[' + backgrounds.titles[b1[i]] + "](" + b1[i] + ')');
                        else b2.push('[' + backgrounds.titles[b1[i]] + "](" + b1[i] + ') (Equipped)');
                    }
                    return sendChat(`\`\`\`md\n# All Backgrounds owned by user ${res.rows[0].id}:\n\n  [Background Title](background ID)\n\n  ${b2.join("\n  ")}\n\nIf you wish to equip any of these, do \`x!profiles background [title ID]\` (capitals are important!)\`\`\``);
                });
            } else if (["buy", "purchase"].includes(args[1])) {
                db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sendChat("```" + err + "```");
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you cannot yet purchase a new background. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].backgrounds.length == backgrounds.ids.length) return sendChat("There are no more backgrounds for you to purchase, because you've got them all already! When new ones are added, you'll be able to buy more, okay~?");
                    if (res.rows[0].money < 20) return sendChat("You do not have enough money to buy another background! Get more money by playing games (and winning)!");
  
                    newbg = backgrounds.ids.random();
                    do {
                        newbg = backgrounds.ids.random();
                    } while (res.rows[0].backgrounds.includes(newbg));
                    res.rows[0].backgrounds.push(newbg);
                    db.query(`UPDATE profiles
                                SET backgrounds = ARRAY ${JSON.stringify(res.rows[0].backgrounds).replace(/"/g, "'")}, money = '${res.rows[0].money - 20}'
                                WHERE id = '${message.author.id}'`, function(err) {
                        if (err) sendChat("```" + err + "```");
                        else return sendChat("Successfully purchased a new background! To equip it, do `x!profile background [background ID]`. New background ID: `" + newbg + '`', new Discord.Attachment("./img/backgrounds/" + newbg.substring(0, 7) + (newbg.substring(7) == "j" ? ".jpg" : ".png")));
                    });
                });
            } else if (/^[a-zA-Z0-9]{7}[jp]$/.test(args[1])) {
                if (!backgrounds.ids.includes(args[1])) return sendChat("That image ID does not exist. Did you make sure you capitalized the correct letters? That's important, you know.");
                db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sendChat("```" + err + "```");
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you cannot yet equip a new background. If you want to change that fact, do `x!profile` right now!");
                    if (!res.rows[0].backgrounds.includes(args[1])) return sendChat("You do not own that background!");
                    return db.query(`UPDATE profiles
                                     SET background = '${args[1]}'
                                     WHERE id = '${message.author.id}'`, function(err) {
                        if (err) sendChat("```" + err + "```");
                        else return sendChat("Successfully equipped the background `" + args[1] + "`!");
                    });
                });
            } else if (args[1].startsWith('[')) return sendChat("With***out*** the brackets, you twit.");
            else return sendChat("Unknown request.");
        } else if (["lorr", "sidedisplay", "displayside", "displaylorr", "leftorright", "rightorleft"].includes(args[0])) {
            if (!args[1]) return sendChat("Left or right? Which side is all your information displayed on in that profile thing I create for you?");
            else if (!['left', 'l', 'right', 'r'].includes(args[1])) return sendChat("I don't know what that means. Nothing you put after \"" + args[0] + "\" means either left or right to me.");
            else {
                if (args[1] == 'l') args[1] = "left";
                if (args[1] == 'r') args[1] = "right";
                db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sendChat("```" + err + "```");
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so your information is displayed on neither the left nor the right. If you want to change that fact, do `x!profile` right now!");
                    db.query(`UPDATE profiles
                              SET lorr = '${args[1]}'
                              WHERE id = '${message.author.id}'`, function(err) {
                        if (err) sendChat("```" + err + "```");
                        else return sendChat("Successfully updated your information display to the " + args[1] + " side!");
                    });
                });
            }
        } else if (["title", "titles"].includes(args[0])) {
            if (!args[1]) {
                return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sendChat("```" + err + "```");
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you do not yet have any titles. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].titles.length == 1) return sendChat("The only title you own is the title you currently have equipped. Get some more and then check back with me, okay~?");
                    let t1 = res.rows[0].titles;
                    let t2 = [];
                    for (let i = 0; i < res.rows[0].titles.length; i++) {
                        if (t1[i] !== res.rows[0].title) t2.push('[' + titles[t1[i]] + "](" + t1[i] + ')');
                        else t2.push('[' + titles[t1[i]] + "](" + t1[i] + ') (Equipped)');
                    }
                    return sendChat("```md\n# All Titles owned by user:" + res.rows[0].id + ":\n\n  [Title Text](titleID)\n\n  " + t2.join("\n  ") + "\n\nIf you wish to equip any of these, do `x!profile title [titleID]` (capitals are important!)!```");
                });
            }
            if (args[1].startsWith('[')) return sendChat("With***out*** the brackets, you twit.");
            if (!Object.keys(titles).includes(args[1])) return sendChat("That title ID does not exist. Try again.");
            return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                if (err) return sendChat("```" + err + "```");
                if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you do not yet have the ability to change your title. If you want to change that fact, do `x!profile` right now!");
                return db.query(`UPDATE profiles
                                 SET title = '${args[1]}'
                                 WHERE id = '${message.author.id}'`, function(err) {
                    if (err) return sendChat("```" + err + "```");
                    return sendChat("Successfully updated your title to `" + titles[args[1]] + "`!");
                });
            });
        } else if (["color", "colors"].includes(args[0])) {
            if (!args[1]) return sendChat("Please include the color you wish to set your profile color to, and please make it a hexidecimal value ('#' followed by 3 or 6 digits and/or letters).");
            else if (!RE.color.test(args[1])) return sendChat("That is not a color hexidecimal. Try again.");
            db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                if (err) return sendChat("```" + err + "```");
                if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you do not yet have the ability to change your profile's color. If you want to change that fact, do `x!profile` right now!");
                return db.query(`UPDATE profiles
                            SET color = '${(args[1].startsWith('#') ? '' : '#') + args[1]}'
                            WHERE id = '${message.author.id}'`, function(err) {
                    if (err) return sendChat("```" + err + "```");
                    let canvas = new Canvas(100, 40);
                    let ctx = canvas.getContext('2d');
                    ctx.fillStyle = (args[1].startsWith('#') ? '' : '#') + args[1];
                    ctx.fillRect(0, 0, 100, 40);
                    return sendChat("Successfully updated your color to `" + (args[1].startsWith('#') ? '' : '#') + args[1] + "`!", new Discord.Attachment(canvas.toBuffer()));
                });
            });
        } else if (["help"].includes(input)) return sendChat("**Available sub-commands for `x!profile`** (do `x!profile [subcommand]`):\n\n**backgrounds** - opens the background menu for changing your profile's background\n**displaylorr** - allows you to change which side all the text n stuff is displayed on in your profile\n**title** - can display your currently equipped title, your currently owned titles, or allows you to change your currently equipped title (if you know the ID for it)\n**color** - allows you to change the color your profile uses to display text");
        else return sendChat("Invalid syntax. Try `x!profile help` for more information on how to use this.");
    },
   
    // Smaller Games

    // Utility
    "avatar": function(cmd, args, input, message, sendChat, user) {
        if (!input || RE.ping.test(input) || RE.id2.test(input)) {
            let member;
            if (!input) member = message.channel.guild.members.get(message.author.id);
            else if (message.channel.type !== "dm") member = message.channel.guild.members.get(input.match(RE.id1)[0]);
            else return sendChat("Cannot display other users' avatars in DMs, yet, sorry~");
  
            if (member == null) return sendChat("User not found.");
            else member = member.user;

            let embed = new Discord.RichEmbed();
            embed.setTitle("User Avatar");
            embed.setDescription(`Avatar for <@${member.id}>`);
            embed.setImage(`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=2048`);
            embed.setColor(new Color().random());
            return sendChat({embed});
        } else return sendChat("Unknown request.");
    },

    "help": function(cmd, args, input, message, sendChat, user) {
        if (!input) {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Help");
            embed.setDescription("A list of all commands supported by Bakeneko~\n`\*command either dysfunctional or not yet available`\n`" + (message.channel.type == "dm" ? "Some of these commands do not work in servers" : "Some of these commands do not work in DMs") + "`\nFor more help about any specific command, do \"`x![command]` `help`\"");
            let helps;
            if (message.channel.type == "dm") helps = [
                    ["`I apologize, but none of my larger games can work in DMs. When I get bigger and more people are playing my games regularly, I'll make it where you can play against strangers through DMs.`"],
                    ["\\*`hangman", "\\*`quickmaffs", "\\*`iq", "\\*`sequence", "\\*`shuffle"],
                    ["`help", "`avatar",, "`aliases", "`bugreport", "`request"],
                    ["\\*`anime", "\\*`manga", "`jisho", "\\*`jshelp", "`nekos", "`calculate", "`graph"]
                ];
            else helps = [
                    ["`connect4", "`squares", "`othello", "\\*`3dtictactoe", "\\*`gomoku", "`profile"],
                    ["\\*`hangman", "\\*`quickmaffs", "\\*`iq", "\\*`sequence", "\\*`shuffle"],
                    ["`help", "`avatar", "`aliases", "`server", "`kick", "`ban"],
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
            return sendChat({embed});
        } else if (["games", "utility", "profile", "miscellaneous", "misc", "nsfw"].includes(input)) {
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
        } else {
            if (message.channel.type != "dm") {
                for (let i in guildAliases) {
                    if (guildAliases[i].includes(input)) {
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
                            "othello": "Play a game of Reversi with someone else (Othello = competative Reversi).",
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
                        embed.addField("Aliases", '`' + guildAliases[i].join("`\n`") + '`');
                        embed.setFooter("Xyvybot version " + version);
                        embed.setColor(new Color().random());
                        return sendChat({embed});
                    }
                }
                return sendChat("Unknown request.");
            } else {
                for (let i in userAliases) {
                    if (userAliases[i].includes(input)) {
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
                        embed.addField("Aliases", '`' + userAliases[i].join("`\n`") + '`');
                        embed.setFooter("Xyvybot version " + version);
                        embed.setColor(new Color().random());
                        return sendChat({embed});
                    }
                }
                return sendChat("Unknown request.");
            }
        }
    },
  
    "aliases": function(cmd, args, input, message, sendChat, user) {
        if (!input) return sendChat("To view all the aliases for a command, do `x!aliases` `[command name]`");
        else if (input.startsWith('[')) return sendChat("With***out*** the brackets.");
        for (let i in guildAliases) {
            if (guildAliases[i].includes(input)) {
                let embed = new Discord.RichEmbed();
                embed.setTitle("Aliases for " + i);
                embed.setDescription("`" + guildAliases.join("`  `") + "`");
                embed.setColor(new Color().random());
                return sendChat({embed});
            }
        }
    },

    "bug": function(cmd, args, input, message, sendChat, user) {
        db.query(`SELECT bug FROM bans`, function(err, res) {
            if (err) return sendChat("```" + err + "```");
            if (!rows.includes(message.author.id)) {
                if (bugTimers[message.author.id]) return sendChat("You can submit 1 bug every 2 hours. Xyvy doesn't like being spammed, you know.");
                if (!input) return sendChat("Here is how to format a bug report:\n\n```\nx!reportbug [command that's bugged]\n[description of bug (less than 1000 characters, please)]```\nPlease take note that if you submit a fake bug report, your user ID will be blacklisted and you will no longer be able to use this command. Don't be a dick.");
                let com = input.split("\n")[0];
                console.log('"' + com + '"');
                if (com.startsWith("[")) return sendChat("With***out*** the brackets, you twit.");
                let aliases = message.channel.type == "dm" ? userAliases : guildAliases;
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
                client.guilds.get("399327996076621825").channels.get("467853697528102912").send({embed});
                bugTimers[message.author.id] = 100 * 60 * 60 * 2;
                return sendChat("Bug report sent! Thanks for helping out!");
            } else sendChat("You are not allowed to use this command, since you thought you were funny and tried to spam it at some point. Way to go, you're a dick. You should feel proud.");
        })
    },

    "request": function(cmd, args, input, message, sendChat, user) {
        db.query(`SELECT request FROM bans`, function(err, res) {
            if (err) return sendChat("```" + err + "```");
            if (!rows.includes(message.author.id)) {
                if (requestTimers[message.author.id]) return sendChat("You can submit 1 request every 2 hours. Xyvy doesn't like being spammed, you know.");
                if (!input) return sendChat("Here is how to format a request:\n\n```\nx!request [description of suggestion (less than 1000 characters, please)]```\nPlease take note that if you submit a fake request, your user ID will be blacklisted and you will no longer be able to use this command. Don't be a dick.");
                if (input.length > 1000) return sendChat("Your description must be 1000 characters or shorter! This is not my personal preference, it's just a Discord thing.");
                let embed = new Discord.RichEmbed();
                embed.setTitle("User Request");
                embed.setAuthor(message.author.username + "#" + message.author.discriminator + " (" + message.author.id + ")");
                embed.setDescription("**Suggestion**:\n" + input);
                client.guilds.get("399327996076621825").channels.get("468245442388295691").send({embed});
                requestTimers[message.author.id] = 100 * 60 * 60 * 2;
                return sendChat("Request sent! Thanks for the suggestion!");
            } else sendChat("You are not allowed to use this command, since you thought you were funny and tried to spam it at some point. Way to go, you're a dick. You should feel proud.");
        });
    },
   
    "guild": function(cmd, args, input, message, sendChat, user, a) {
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

    "kick": function(cmd, args, input, message, sendChat, user, a) {
        if (!user.hasPermission("KICK_MEMBERS")) return;
        if (!input) return sendChat("**Proper Usage**: `x!kick <@user>`");
        if (!RE.ping.test(args[0]) || !RE.id2.test(args[0])) return sendChat("Invalid user mention, try again.");
        else {
            message.channel.guild.members.get(args[0].match(RE.id1)[0]).kick(args[1] ? input.substring(args[0].lenght + 1) : "Probably for something annoying.").then(() => sendChat("kicked user <@" + args[0].match(RE.id1)[0] + ">")).catch((err) => sendChat("Failed to kick user <@" + args[0].match(RE.id1)[0] + ">```\n" + err + "```"))
        }

    },

    "ban": function(cmd, args, input, message, sendChat, user, a) {
        if (user.hasPermission("BAN_MEMBERS")) return;
        if (!input) return sendChat("**Proper Usage**: `x!ban <@user>`");
        if (!RE.ping.test(args[0]) || !RE.id2.test(args[0])) return sendChat("Invalid user mention, try again.");
        else {
            message.channel.guild.members.get(args[0].match(RE.id1)[0]).ban({ days: 1, reason: args[1] ? input.substring(args[0].length + 1) : "Probably for something annoying." }).then(() => sendChat("baned user <@" + args[0].match(RE.id1)[0] + ">")).catch((err) => sendChat("Failed to ban user <@" + args[0].match(RE.id1)[0] + ">```\n" + err + "```"))
        }

    },
   
    // Miscellaneous
    "anime": function(cmd, args, input, message, sendChat, user) {
   
    },
       
    "manga": function(cmd, args, input, message, sendChat, user) {
   
    },
       
    "jisho": function(cmd, args, input, message, sendChat, user) {
        if (!input) return sendChat("Jisho, the Japanese Dictionary!\nSearch for Kanji definitions, radicals, examples, and more!\nFor more help, use the command `x!jisho help`!");
           
        else if (["help", "syntax"].includes(input)) {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Jisho Syntax");
            embed.addField("Kanji", "Returns all there is to know about a Kanji!\nExample: `x!jisho kanji 語`");
            embed.addField("Examples", "Returns example sentences for a Kanji!\nExample: `x!jisho example 日`");
            embed.addField("Phrase", "Returns a definition for a Kanji phrase!\nExample: `x!jisho phrase 日曜日`");
            embed.addField("Kana", "Returns a simple Hiragana chart with a short explanation as to how Kana works!");
        }
   
        else if (["kanji"].includes(args[0])) {
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
               
                sendChat({embed});
            });
        }
   
        else if (["examples"].includes(args[0])) {
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
                return sendChat({embed});
            });
        }
   
        else if (["phrase", "word"].includes(args[0])) {
            if (!args[1]) return sendChat("Please include a query");
            input = input.substring(args[0].length + 1);
            jisho.searchForPhrase(input).then(result => {
                if (result.data.length == 0) return sendChat("Nothing found.");
                let embed = new Discord.RichEmbed();
                embed.setTitle("Phrase: " + input);
                let definition = result.data[0];
                embed.addField("Definition", definition.senses[0].english_definitions);
                embed.addField("Reading", definition.japanese[0].reading);
                sendChat({embed});
            });
        }
   
        else if (["kana"].includes(args[0])) {
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
   
                return sendChat({embed});
            } else if (["charts", "chart"].includes(args[1])) {
                let embed = new Discord.RichEmbed();
            }
        }
    },
   
    "nekos": function(cmd, args, input, message, sendChat, user) {
        Nekos.getSFWNeko().then(neko => sendChat(new Discord.RichEmbed().setImage(neko.url).setDescription("Have a neko~!").setFooter("Powered by Nekos.Life").setColor(new Color().random())));
    },
   
    "cats": function(cmd, args, input, message, sendChat, user) {
        Nekos.getSFWCat().then(cat => sendChat(new Discord.RichEmbed().setImage(cat.url).setDescription("Have a neko~!").setFooter("Powered by Nekos.Life").setColor(new Color().random())));
    },

    "calc": function(cmd, args, input, message, sendChat, user) {
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
                else equation = equation.replace('|', ')');
            }
        }
   
        try {
            return sendChat("```Input: " + input + "``````Output: " + eval(equation) + "```");
        } catch (err) {
            return sendChat("```Input: " + input + "``````Output: " + err + "```");
        }
    },
   
    "graph": function(cmd, args, input, message, sendChat, user) {
        let equ = function(equation, xy) {
            if (xy !== undefined) {
                if (xy.length > 0) equation = equation.replace(/x/g, '(' + xy[0] + ')');
                if (xy.length > 1) equation = equation.replace(/y/g, '(' + xy[1] + ')');
            }
            equation = equation.replace(/(sin|cos|tan|csc|sec|cot|log)([0-9.xy]{1,})/g, "$1($2)");
            equation = equation.replace(/(sin|cos|tan|csc|sec|cot|log)/g, 'Math.$1');
            equation = equation.replace(/(pi|π)/g, 'Math.PI');
            equation = equation.replace(/([0-9.xy])\(/g, "$1*(");
            equation = equation.replace(/\)([0-9.xy])/, ")*$1");
            equation = equation.replace(/([0-9])M/g, '$1*M');
            equation = equation.replace(/\)\(/g, ")*(");
            equation = equation.replace(/\^/g, '**');
            if (/\|/.test(equation)) {
                a = equation.match(/\|/g);
                if (a.length % 2 == 1) return sendChat("`Unmatched |`");
                for (let i = 0; i < a.length; i++) {
                    if (i % 2 == 0) equation = equation.replace('|', 'Math.abs(');
                    else equation = equation.replace('|', ')');
                }
            }
   
            try {
                return eval(equation);
            } catch (err) {
                return sendChat('`' + err + '`');
            }
   
        }
   
        canvas = new Canvas(300, 300);
        ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 300, 300);
        ctx.strokeStyle = "#aaa";
        for (let i = 80; i--;) {
            ctx.moveTo(0, i * 10);
            ctx.lineTo(300, i * 10);
        }
        for (let i = 80; i--;) {
            ctx.moveTo(i * 10, 0);
            ctx.lineTo(i * 10, 300);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.moveTo(150, 0);
        ctx.lineTo(150, 300);
        ctx.moveTo(0, 150);
        ctx.lineTo(301, 150);
        ctx.stroke();
        input = input.toLowerCase().split(';');
        colors = ["#f00", "#00f", "#080", "#909", "#f80", "#ff0", "#0ff", "#0f0", "#840", "#f8f"];
        if (input.length > colors.length) return sendChat("`Too many equations!`");
        for (let z = 0; z < input.length; z++) {
            ctx.beginPath();
            ctx.strokeStyle = colors[z];
            q = input[z].split('=');
            if (q.length == 1) {
                if (q[0].includes('y') && q[0].includes('x')) return sendChat('`' + input[z] + "`\nInvalid equation: must have a set value for x and y to be on the same side of the equation.");
                else if (!q[0].includes('y')) {
                    equation = q[0].replace(/ /g, '');
                    for (let x = 151; x > -151; x--) {
                        try {
                            let a = equ(equation, [x]);
                            if (typeof a !== "number") return sendChat("Error.");
                            if (x == 151) ctx.moveTo(150 + x, 150 - a);
                            else if (a == undefined || a == Infinity) {
                                ctx.lineTo(150 + x, 0);
                                ctx.moveTo(150 + x, 300);
                            }
                            else ctx.lineTo(150 + x, 150 - a);
                        } catch (err) {
                            return sendChat("```" + err + "```");
                        }
   
                    }
                    ctx.stroke();
                }
            } else if (q.length == 2) {
                if ((/y/.test(q[0]) && /x/.test(q[0])) || (/y/.test(q[1]) && /x/.test(q[1]))) {
                    if ((/y/.test(q[0]) && /y/.test(q[1])) || (/x/.test(q[0]) && /x/.test(q[1]))) return sendChat('`' + input[z] + "`\nInvalid equation: neither x nor y may be on both sides of the equation.");
   
                    equ1 = /y/.test(q[0]) ? q[0] : q[1];
                    equ2 = equ1 == q[1] ? q[0] : q[1];
                    for (let x = 151; x > -151; x--) {
                        for (let y = 151; y > -151; y--) {
                            ans = equ(equ1, [x, y]);
                            if (typeof ans !== "number") return sendChat("Error.");
                            if (ans > equ2 - 1 && ans < equ2 + 1) {
                                ctx.moveTo(150 + x, 150 - y);
                                ctx.lineTo(150 + x, 150 - y);
                            }
                        }
                    }
                    ctx.stroke();
                } else if ((/y/.test(q[0]) && q[0].trim() !== 'y') || (/y/.test(q[1]) && q[1].trim() !== 'y')) {
                    equ = /x/.test(q[0]) ? q[0] : q[1];
                    ans = /y/.test(q[0]) ? q[0] : q[1];
   
                    for (let x = 151; x > -151; x--) {
                           
                    }
                } else {
                    if (q[0].includes('y')) equation = q[1].replace(/ /g, '');
                    else equation = q[0].replace(/ /g, '');
                    for (let x = 151; x > -151; x--) {
                        try {
                            let a = equ(equation, [x]);
                            if (typeof a !== "number") return sendChat("Error.");
                            if (x == 151) ctx.moveTo(150 + x, 150 - a);
                            else if (a == undefined || a == Infinity) {
                                ctx.lineTo(150 + x, 0);
                                ctx.moveTo(150 + x, 300);
                            }
                            else ctx.lineTo(150 + x, 150 - a);
                        } catch (err) {
                            return sendChat("```" + err + "```");
                        }
   
                    }
                    ctx.stroke();
                }
            }
        }
   
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, 10, 10);
        ctx.font = "10px Calibri";
        ctx.fillStyle = "#000000"
        ctx.fillText("= 10 units\u00b2", 24, 19);
   
        for (let i = input.length; i--;) input[i] = '  ' + input[i].replace(/ /g, '') + ' - ' + ["Red", "Blue", "Green", "Purple", "Orange", "Yellow", "Teal", "Light Green", "Brown", "Pink"][i];
        sendChat("```Equation" + (input.length > 1 ? 's' : '') + ":\n" + input.join('\n') + "```", new Discord.Attachment(canvas.toBuffer()));
   
    },
   
    // NSFW
    "nsfw": function(cmd, args, input, message, sendChat, user) {
        if (message.channel.type != "dm" && !message.channel.nsfw) return;
        if (["help"].includes(input)) {
            let embed = new Discord.RichEmbed();
            embed.setDescription("If you don't really care what kind of lewd you want, just do `x!nsfw`\nIf you *do* care, do `x!nsfw [category]`\nThese are all my available NSFW categories:\n`Gif  Pussy  NekoGif  Neko  Lesbian  Kuni  Cumsluts  Classic  Boobs  Bj  Anal`\n\nHappy fapping~");
            embed.setTitle("NSFW Command help");
            embed.setFooter("Powered by Nekos.Life");
            embed.setColor(new Color().random())
            return Nekos.getNSFWNeko().then(help => sendChat(embed.setImage(help.url)));
        }
        if (!input) {
            let type = ["RandomHentaiGif", "Pussy", "NekoGif", "Neko", "Lesbian", "Kuni", "Cumsluts", "Classic", "Boobs", "Bj", "Anal"].random();
            let desc = {
                "gif": "if you want any random gif of someone getting fucked in hentai!",
                "pussy": "if you want gifs of pussies getting fucked~",
                "nekogif": "if you want gifs of lewd neko girls~",
                "neko": "if you want pictures of lewd neko girls~",
                "lesbian": "if you want to watch two girls fuck each other!",
                "kuni": "if you like watching pussies get licked!",
                "cumsluts": "if you enjoy seeing girls covered in semen!",
                "classic": "if you like some good ol' fashion fucking!",
                "boobs": "if you want to see some bouncy breasts~",
                "bj": "if you like watching girls give blowjobs~",
                "anal": "if you enjoy watching girls getting fucked in the ass!"
            }[type.replace("RandomHentai", "").toLowerCase()];
            return Nekos["getNSFW" + type]().then(nsfw => sendChat(new Discord.RichEmbed().setImage(nsfw.url).setDescription(`Have something NSFW~\nDo \`x!nsfw ${type.replace("RandomHentai", "").toLowerCase()}\` ${desc}\nDo \`x!nsfw help\` to see all the kinds of lewds I can do~`).setFooter("Powered by Nekos.Life").setColor(new Color().random())));
        }
        if (!["gif", "pussy", "neko", "lesbian", "yuri", "kuni", "cumslut", "cumsluts", "classic", "boobs", "tits", "boobies", "titties", "bj", "blowjob", "anal"].includes(input))
            return sendChat("Sorry, I don't have that");
        let type = {
            "gif": ["RandomHentaiGif", "Have a hentai gif~"],
            "pussy": ["Pussy", "Have some anime pussy~"],
            "neko": [["NekoGif", "Neko"].random(), "Have a lewd neko~"],
            "nekogif": ["NekoGif", "Have a lewd neko gif~"],
            "lesbian": ["Lesbian", "Have some yuri~"],
            "yuri": ["Lesbian", "Have some yuri~"],
            "kuni": ["Kuni", "Have some anime pussy-licking~"],
            "cumslut": ["Cumsluts", "Have an anime cumslut~"],
            "cumsluts": ["Cumsluts", "Have an anime cumslut~"],
            "classic": ["Classic", "Have some classic anime sex~"],
            "boobs": ["Boobs", "Have some anime boobs~"],
            "tits": ["Boobs", "Have some anime tits~"],
            "boobies": ["Boobs", "Have some anime boobies~"],
            "titties": ["Boobs", "Have some anime titties~"],
            "bj": ["Bj", "Have an anime blowjob~"],
            "blowjob": ["Bj", "Have an anime blowjob~"],
            "anal": ["Anal", "Have some anime anal sex~"],
        }[input];
        return Nekos["getNSFW" + type[0]]().then(nsfw => sendChat(new Discord.RichEmbed().setImage(nsfw.url).setDescription(type[1]).setFooter("Powered by Nekos.Life").setColor(new Color().random())));
    },
   
    // Admin-only
    "js": function(cmd, args, input, message, sendChat, user) {
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
                else sendChat("```" + err + "``````" + b[0] + '\n' + ' '.repeat(b[1]) + "^```");
            }
        }
    },
   
    "pg": function(cmd, args, input, message, sendChat, user) {
        if (!admins.includes(user.user.id)) return;
        if (input.startsWith("```sql\n") && input.endsWith("```")) {
            db.query(input.substring(7, input.length - 3), function(err, res) {
                if (err) return sendChat("```" + err + "```");
                sendChat("```js\n" + JSON.stringify(res) + "```");
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
        else {
            let b = [];
            let c = [];
            if (this.length < a) a = this.length;
            for (let i = a; i--;) {
                let d = Math.random() * this.length | 0;
                if (c.includes(d)) i++;
                else c.push(d);
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
   
exports.db = db;
exports.version = version;
exports.command = command;
exports.other = other;
exports.bot = bot;