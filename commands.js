const Discord = require("discord.js");
const Canvas = require("canvas");
const Jimp = require("jimp");
const GIFEncoder = require('gifencoder');
const pngFileStream = require('png-file-stream');

const client = require("./Xyvy.js").client;
const databaseURL = require("./Xyvy.js").database;
   
var version = "v2.19.2.19";
var pingtime = {};
var pingtimer = {};
var titleChannels = {};
var badgeChannels = {};
var buyBadgeChannels = {};
var defaultImages = require("./stuffs/images.json");
var admins = "357700219825160194".split(' ');

var OwnerObject;
exports.getOwner = function(thing) {
    OwnerObject = thing;
}

var bugTimers = {};
var bugTimer = setInterval(function() {
    for (let i in bugTimers) {
        bugTimers[i] -= 1;
        if (bugTimers[i] == 0) delete bugTimers[i];
    }
}, 10);
   
// var TTT = require("./games/TTT.js");
// var TTTlogs = {};
var connect4 = require("./games/connect4.js");
var connect4timer = setInterval(function() {
    for (let i in connect4.channels) {
        connect4.channels[i].timer.time -= 1;
        if (connect4.channels[i].timer.time == 0) {
            connect4.channels[i].channel.send(connect4.channels[i].timer.message);
            delete connect4.channels[i];
        }
    }
}, 10);
   
var squares = require("./games/squares.js");
var squarestimer = setInterval(function() {
    for (let i in squares.channels) {
        squares.channels[i].timer.time -= 1;
        if (squares.channels[i].timer.time == 0) {
            squares.channels[i].channel.send(squares.channels[i].timer.message);
            delete squares.channels[i];
        }
    }
}, 10);
   
var othello = require("./games/othello.js");
var othellotimer = setInterval(function() {
    for (let i in othello.channels) {
        othello.channels[i].timer.time -= 1;
        if (othello.channels[i].timer.time == 0) {
            othello.channels[i].channel.send(othello.channels[i].timer.message);
            delete othello.channels[i];
        }
    }
}, 10);
   
var gomoku = require("./games/gomoku.js");
var gomokutimer = setInterval(function() {
    for (let i in gomoku.channels) {
        gomoku.channels[i].timer.time -= 1;
        if (gomoku.channels[i].timer.time == 0) {
            gomoku.channels[i].channel.send(gomoku.channels[i].timer.message);
            delete gomoku.channels[i];
        }
    }
}, 10);
   
// var Go = require("./games/go.js");
// var TTT3D = require("./games/3DTTT.js");
// var hangman = require("./games/hangman.js");
// var trivia = require("./games/trivia.js");
// var math = require("./games/math.js");
// var IQ = require("./games/iq.js");
// var Seq = require("./games/sequence.js");
// var BShip = require("./games/battleship.js");
// var shuffle = require("./games/shuffle.js");
  
var titles = require("./stuffs/titles.json");
   
var timers = {
    profile: {},
    image: {},
    desc: {},
    titleequip: {},
    badgeequip: {}
}
   
var RE = {
    ping: /^<@[0-9]{1,}>$/,
    id1: /[0-9]{1,}/,
    id2: /^[0-9]{1,}$/,
    color: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
};
   
const pg = require("pg");
var db = new pg.Client(databaseURL);
db.connect().then(() => console.log("Connected to Database!")).catch(() => console.error("Could not connect to Database."));
   
const Mal = require("node-mal");
var mal = new Mal({
    username: "Xyvyrianeth",
    password: "IaaBsGD20x20"
}).verifyCredentials().then((user) => console.log("Successfully logged into MAL~")).catch((err) => console.log(err));
   
const jishoApi = require("unofficial-jisho-api");
const jisho = new jishoApi();
   
const nekos = require("nekos.life");
const Nekos = new nekos();
   
function command(message) {
  
    a = message.channel.type == "dm";
      
    let args = message.content.split(/ {1,}/),
        cmd = args.shift().replace("x!", '').toLowerCase(),
        input = args.join(' '),
        user = a ? message.channel.recipient : message.channel.guild.members.get(message.author.id);
   
    let sendChat = function(content, options) {
        if (typeof content == "string") content = content.replace(/\$user\$/g, `<@${message.author.id}>`);
        if (options == undefined) message.channel.send(content);
        else message.channel.send(content, options);
    }
   
    if (a) for (let i in userAliases) {
        if (userAliases[i].includes(cmd))
            try {
                return commands[i](cmd, args, input, message, sendChat, user, a);
            } catch (error) {
                sendChat("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~```");
                let a = [];
                for (let i = 0; i < 5; i++) a.push(error.stack.split('\n')[i]);
                OwnerObject.send("```\nError in private messages of user " + message.author.id + "```\n```\nUser errored on:```<@" + message.author.id + ">```\nMessage sent:``````" + message.content.replace(/`/g, "\\`") + "\n```\n```\n" + a.join('\n') + "```");
            }
    } else for (let i in guildAliases) {
        if (guildAliases[i].includes(cmd))
            try {
                return commands[i](cmd, args, input, message, sendChat, user, a);
            } catch (error) {
                sendChat("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~```");
                let a = [];
                for (let i = 0; i < 5; i++) a.push(error.stack.split('\n')[i]);
                OwnerObject.send("```\nError in server " + message.channel.guild.id + "```\n```\nUser errored on:```<@" + message.author.id + ">```\nMessage sent:``````" + message.content.replace(/`/g, "\\`") + "\n```\n```\n" + a.join('\n') + "```");
            }
    }
   
}
   
function other(message) {
    let sendChat = function(content, options) {
        if (typeof content == "string") content = content.replace(/\$user\$/g, `<@${message.author.id}>`);
        if (options == undefined) message.channel.send(content);
        else message.channel.send(content, options);
    }
   
    if (message.channel.type == "dm" || message.author.bot) return;
    else {
        if (/^[1-7]$/.test(message.content) && connect4.channels[message.channel.id] && connect4.channels[message.channel.id].started && message.author.id == connect4.channels[message.channel.id].players[connect4.channels[message.channel.id].turn]) {
            message.delete();
            try {
                return sendChat(connect4.takeTurn(message.channel, message.content));
            } catch (err) {
                delete connect4.channels[message.channel.id];
                sendChat("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough~```");
                OwnerObject.send("```\nError in server ID " + message.channel.guild.id + "``````\nUser errored on: " + message.author.id + "``````\nMessage sent: " + message.content + "``````\n" + err + "```");
            }
        }
        if (squares.channels[message.channel.id] && squares.channels[message.channel.id].started && message.author.id == squares.channels[message.channel.id].players[Math.floor(squares.channels[message.channel.id].turn)]) {
            let k = squares.channels[message.channel.id].size;
            let a = 'abcdefghijklmno'[k - 1];
            if (k < 10) b = "[1-" + k + "]";
            else b = "(1[0-" + (k - 10) + "]|[1-9])";
            if (new RegExp(`^([a-${a}]${b}|${b}[a-${a}])$`, 'i').test(message.content)) {
                message.delete();
                try {
                    return sendChat(squares.takeTurn(message.channel, [message.content.match(new RegExp(`(${b})`))[0] - 1, "abcdefghijklmno".split('').indexOf(message.content.toLowerCase().match(new RegExp(`[a-${a}]`))[0])]));
                } catch (err) {
                    delete squares.channels[message.channel.id];
                    sendChat("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough~```");
                    OwnerObject.send("```\nError in server ID " + message.channel.guild.id + "``````\nUser errored on: " + message.author.id + "``````\nMessage sent: " + message.content + "``````\n" + err + "```");
                }
            }
        }
        if (/^([a-h][1-8]|[1-8][a-h])$/i.test(message.content) && othello.channels[message.channel.id] && othello.channels[message.channel.id].started && message.author.id == othello.channels[message.channel.id].players[othello.channels[message.channel.id].turn]) {
            message.delete();
            try {
                return sendChat(othello.takeTurn(message.channel, [message.content.match(/[1-8]/)[0] - 1, "abcdefgh".split('').indexOf(message.content.toLowerCase().match(/[a-h]/)[0])]));
            } catch (err) {
                delete othello.channels[message.channel.id];
                sendChat("```\nWhoops! It appears I've made an error! My maker has been notified and he will fix it as soon as he can! It's best you try something else, for now~\nFor safety, I've ended the game, but don't worry! You'll be able to have a rematch soon enough~```");
                OwnerObject.send("```\nError in server ID " + message.channel.guild.id + "``````\nUser errored on: " + message.author.id + "``````\nMessage sent: " + message.content + "``````\n" + err + "```");
            }
        }
    }
}
   
function bot(message) {
    if (message.attachments.array().length != 0) {
        let ids;
        if (othello.channels[message.channel.id]) ids = othello.channels[message.channel.id].players;
        else if (squares.channels[message.channel.id]) ids = squares.channels[message.channel.id].players;
        else if (connect4.channels[message.channel.id]) ids = connect4.channels[message.channel.id].players;
        else return;
        db.query(`SELECT * FROM profiles WHERE id = '${ids[0]}' OR id = '${ids[1]}'`, function(err, res) {
            if (err) return message.channel.send("```" + err + "```");
            let result = false;
            if (connect4.channels[message.channel.id]) {
                if (/connect4_0_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].file.name)) return connect4.channels[message.channel.id].lastDisplay = message;
                if (/connect4_1_[0-9]{1,}\.png/.test(message.attachments.array()[0].file.name)) {
                    game = connect4.channels[message.channel.id];
                    result.winner = game.players[game.winner];
                    result.loser = game.players[game.winner == 0 ? 1 : 0];
                    result.game = "1";
                    delete connect4.channels[message.channel.id];
                }
                if (/connect4_2_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].file.name)) return delete connect4.channels[message.channel.id];
            } else if (squares.channels[message.channel.id]) {
                if (/squares_0_1?[0-9]_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].file.name)) return squares.channels[message.channel.id].lastDisplay = message;
                if (/squares_1_1?[0-9]_[0-9]{1,}\.png/.test(message.attachments.array()[0].file.name)) {
                    game = squares.channels[message.channel.id];
                    result.winner = game.players[game.winner];
                    result.loser = game.players[game.winner == 0 ? 1 : 0];
                    result.game = "2";
                    delete squares.channels[message.channel.id];
                }
                if (/squares_2_1?[0-9]_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].file.name)) return delete squares.channels[message.channel.id];
            } else if (othello.channels[message.channel.id]) {
                if (/othello_0_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].file.name)) return othello.channels[message.channel.id].lastDisplay = message;
                if (/othello_1_[0-9]{1,}\.png/.test(message.attachments.array()[0].file.name)) {
                    game = othello.channels[message.channel.id];
                    result.winner = game.players[game.winner];
                    result.loser = game.players[game.winner == 0 ? 1 : 0];
                    result.game = "3";
                    result.score = game.score;
                    delete othello.channels[message.channel.id];
                }
                if (/othello_2_[0-9]{1,}vs[0-9]{1,}\.png/.test(message.attachments.array()[0].file.name)) return delete othello.channels[message.channel.id];
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
        if (message.content.includes("is now requesting a new game of Connect Four")) return connect4.channels[message.channel.id].lastDisplay = message;
        if (message.content.includes("is now requesting a new game of Squares")) return squares.channels[message.channel.id].lastDisplay = message;
        if (message.content.includes("is now requesting a new game of Othello")) return othello.channels[message.channel.id].lastDisplay = message;
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
   
function newUser(id, channel) {
    let image = defaultImages.images.random();
    db.query(`INSERT INTO profiles (
        id,       color,   title,      titles,             background,  backgrounds,         lorr,     money,  wins1,  lose1,  wins2,  lose2,  wins3,  lose3,  wins4,  lose4,  wins5,  lose5
    ) VALUES (
        '${id}',  '#aaa',  'default',  ARRAY ['default'],  '${image}',  ARRAY ['${image}'],  'right',  0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0
    )`, function(err) {
        if (err) return channel.send("```" + err + "```");
    });
    return { id: id, color: "#aaa", title: "default", titles: ["default"], background: image, backgrounds: [image], lorr: "right", money: 0, wins1: 0,  lose1: 0,  wins2: 0,  lose2: 0,  wins3: 0,  lose3: 0,  wins4: 0,  lose4: 0,  wins5: 0,  lose5: 0 };
}
   
function newResolution(width, height) {
    if (height <= 300 && width <= 400) return [width, height];
    if (height / width == 0.75)        return [400, 300];
    if (height / width <  0.75)        return [400, Math.round(height / width * 400)];
    if (height / width >  0.75)        return [Math.round(width / height * 300), 300];
}
   
function Color() {
    var r, g, b;
    if (arguments.length === 1) {
        var hexa = arguments[0].toLowerCase();
        if (hexa.match(/^#[0-9a-f]{6}$/i)) {
            hexa = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hexa);
            if (hexa && hexa.length === 4) {
                r = parseInt(hexa[1], 16);
                g = parseInt(hexa[2], 16);
                b = parseInt(hexa[3], 16);
            }
        } else if (hexa.match(/^#[0-9a-f]{3}$/i)) {
            hexa = /^#?([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})$/i.exec(hexa);
            if (hexa && hexa.length === 4) {
                r = parseInt(hexa[1] + hexa[1], 16);
                g = parseInt(hexa[2] + hexa[2], 16);
                b = parseInt(hexa[3] + hexa[3], 16);
            }
        }
    } else if (arguments.length === 3) {
        r = arguments[0];
        g = arguments[1];
        b = arguments[2];
    }
    this.r = ~~r || 0;
    this.g = ~~g || 0;
    this.b = ~~b || 0;
};
function randomColor() {
    return '#' + (Math.random() * 16 | 0).toString(16) + (Math.random() * 16 | 0).toString(16) + (Math.random() * 16 | 0).toString(16) + (Math.random() * 16 | 0).toString(16) + (Math.random() * 16 | 0).toString(16) + (Math.random() * 16 | 0).toString(16);
}
  
function newProfileCard(username, profile, background, avatar) {
    // Set the picture
    res = newResolution(background.width, background.height);
    canvas = new Canvas(res[0], res[1]);
    ctx = canvas.getContext('2d');
    ctx.drawImage(background, 0, 0, res[0], res[1]);
  
    // Set important colors
    color = new Color(profile.color);
    colors = {
        bg: `rgba(${Math.floor(color.r * 1.25)}, ${Math.floor(color.g * 1.25)}, ${Math.floor(color.b * 1.25)}, 0.5)`,   // Background
        ed: `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`,                                                            // Edge Lines
        tx: `rgba(${Math.floor(color.r * 0.5)}, ${Math.floor(color.g * 0.5)}, ${Math.floor(color.b * 0.5)}, 1)`,        // Text
        ii: `rgba(255, 255, 255, 0)`                                                                                    // Invisible Ink
    };
  
    // Get important text sizes
    text = {};
    ctx.font = "20px calibri";
    text.un = Math.floor(ctx.measureText(username).width > 193 ? 193 : ctx.measureText(username).width < 96 ? 96 : ctx.measureText(username).width);                        // Username
    ctx.font = "15px calibri";
    text.tt = Math.floor(ctx.measureText(titles[profile.title]).width > text.un ? text.un : ctx.measureText(titles[profile.title]).width < 96 ? 96 : ctx.measureText(titles[profile.title]).width); // Title
      
    if (profile.lorr == "right") {
        // Draws avatar box
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.lineWidth = 2;
        ctx.moveTo(res[0] - 75, 0);
        ctx.lineTo(res[0] - 75, 75);
        ctx.lineTo(res[0] + 2, 75);
        ctx.lineTo(res[0] + 2, 0);
        ctx.stroke();
          
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.lineWidth = 2;
        ctx.moveTo(res[0] - 74, 0);
        ctx.lineTo(res[0] - 74, 74);
        ctx.lineTo(res[0] + 2, 74);
        ctx.lineTo(res[0] + 2, 0);
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(avatar, res[0] - 72, 2, 70, 70);
  
        // Username
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(res[0] - 76, 25);
        ctx.lineTo(res[0] - 81 - text.un, 25);
        ctx.lineTo(res[0] - 107 - text.un, -1);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(res[0] - 76, 24);
        ctx.lineTo(res[0] - 80.62 - text.un, 24);
        ctx.lineTo(res[0] - 105.62 - text.un, -1);
        ctx.lineTo(res[0] - 76, -1);
        ctx.fill();
        ctx.stroke();
  
        ctx.textAlign = "end";
        ctx.textBaseline = "hanging";
        ctx.font = "20px calibri";
        ctx.fillStyle = colors.tx;
        ctx.fillText(username, res[0] - 78, 2, text.un);
  
        // Title
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(res[0] - 76, 42);
        ctx.lineTo(res[0] - 80 - text.tt, 42);
        ctx.lineTo(res[0] - 80 - text.tt, 26);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(res[0] - 76, 41);
        ctx.lineTo(res[0] - 79 - text.tt, 41);
        ctx.lineTo(res[0] - 79 - text.tt, 26);
        ctx.lineTo(res[0] - 76, 26);
        ctx.fill();
        ctx.stroke();
  
        ctx.textAlign = "end";
        ctx.textBaseline = "hanging";
        ctx.font = "15px calibri";
        ctx.fillStyle = colors.tx;
        ctx.fillText(titles[profile.title], res[0] - 78, 26, text.tt);
  
        // Money
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(res[0] - 76, 59);
        ctx.lineTo(res[0] - 176, 59);
        ctx.lineTo(res[0] - 176, 43);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(res[0] - 76, 58);
        ctx.lineTo(res[0] - 175, 58);
        ctx.lineTo(res[0] - 175, 43);
        ctx.lineTo(res[0] - 76, 43);
        ctx.fill();
        ctx.stroke();
  
        ctx.textAlign = "start";
        ctx.textBaseline = "hanging";
        ctx.font = "15px calibri";
        ctx.fillStyle = colors.tx;
        ctx.fillText("Money:", res[0] - 174, 44, 40);
        ctx.textAlign = "end";
        mon1 = String(profile.money);
        mon2 = mon1.length % 3;
        mon3 = mon1.length < 4 ? mon1 : mon1.substring(0, mon2 > 0 ? mon2 : 3);
        mon4 = mon1.length < 4 ? '' : mon2 > 0 ? '.' + mon1.substring(mon3.length, 4) : '';
        mon5 = " K M B Tr Qu Pn".split(' ')[Math.floor((mon1.length - 1) / 3)];
        mon = mon3 + mon4 + mon5;
        ctx.font = "15px calibri";
        ctx.fillText(mon, res[0] - 78, 44, 50);
  
        // "Game Stats:" box
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(res[0] - 150, 60);
        ctx.lineTo(res[0] - 150, 199);
        ctx.lineTo(res[0] + 2, 199);
        ctx.moveTo(res[0] - 150, 75);
        ctx.lineTo(res[0] - 76, 75);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(res[0] - 76, 74);
        ctx.lineTo(res[0] - 149, 74);
        ctx.lineTo(res[0] - 149, 60);
        ctx.lineTo(res[0] - 76, 60);
        ctx.fill();
        ctx.stroke();
  
        ctx.textAlign = "start";
        ctx.textBaseline = "hanging";
        ctx.font = "15px calibri";
        ctx.fillStyle = colors.tx;
        ctx.fillText("Game Stats:", res[0] - 147, 61, 70);
  
        // Wins and Loses
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(res[0] - 149, 76);
        ctx.lineTo(res[0] - 149, 198);
        ctx.lineTo(res[0] + 2, 198);
        ctx.lineTo(res[0] + 2, 76);
        ctx.fill();
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(res[0] - 70, 77);
        ctx.lineTo(res[0] - 70, 197);
        ctx.moveTo(res[0] - 35, 77);
        ctx.lineTo(res[0] - 35, 197);
        ctx.moveTo(res[0] - 148, 95);
        ctx.lineTo(res[0] - 1, 95);
        ctx.stroke();
  
        ctx.textAlign = "start";
        ctx.textBaseline = "hanging";
        ctx.font = "15px calibri";
        ctx.fillStyle = colors.tx;
        ctx.fillText("Game Name", res[0] - 148, 80, 75);
        ctx.fillText("Wins", res[0] - 68, 80);
        ctx.fillText("Loses", res[0] - 33, 80, 31);
        for (let i = 0; i < 5; i++) {
            let game = ["Connect Four", "Squares", "Othello", "3D Tic Tac Toe", "Gomoku"][i];
            ctx.fillText(game, res[0] - 148, 97 + (15 * i), 75);
            ctx.fillText(profile["wins" + (i + 1)], res[0] - 68, 97 + (15 * i));
            ctx.fillText(profile["lose" + (i + 1)], res[0] - 33, 97 + (15 * i), 31);
        }
  
    } else if (profile.lorr == "left") {
        // Draws avatar box
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.lineWidth = 2;
        ctx.moveTo(75, 0);
        ctx.lineTo(75, 75);
        ctx.lineTo(-2, 75);
        ctx.lineTo(-2, 0);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(74, 0);
        ctx.lineTo(74, 74);
        ctx.lineTo(-2, 74);
        ctx.lineTo(-2, 0);
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(avatar, 2, 2, 70, 70);
  
        // Username
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(76, 25);
        ctx.lineTo(81 + text.un, 25);
        ctx.lineTo(107 + text.un, -1);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(76, 24);
        ctx.lineTo(80.62 + text.un, 24);
        ctx.lineTo(105.62 + text.un, -1);
        ctx.lineTo(76, -1);
        ctx.fill();
        ctx.stroke();
  
        ctx.textAlign = "start";
        ctx.textBaseline = "hanging";
        ctx.font = "20px calibri";
        ctx.fillStyle = colors.tx;
        ctx.fillText(username, 77, 2, text.un);
  
        // Title
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(76, 42);
        ctx.lineTo(80 + text.tt, 42);
        ctx.lineTo(80 + text.tt, 26);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(76, 41);
        ctx.lineTo(79 + text.tt, 41);
        ctx.lineTo(79 + text.tt, 26);
        ctx.lineTo(76, 26);
        ctx.fill();
        ctx.stroke();
  
        ctx.textAlign = "start";
        ctx.textBaseline = "hanging";
        ctx.font = "15px calibri";
        ctx.fillStyle = colors.tx;
        ctx.fillText(titles[profile.title], 77, 26, text.tt);
  
        // Money
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(76, 59);
        ctx.lineTo(176, 59);
        ctx.lineTo(176, 43);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(76, 58);
        ctx.lineTo(175, 58);
        ctx.lineTo(175, 43);
        ctx.lineTo(76, 43);
        ctx.fill();
        ctx.stroke();
  
        ctx.textAlign = "start";
        ctx.textBaseline = "hanging";
        ctx.font = "15px calibri";
        ctx.fillStyle = colors.tx;
        ctx.fillText("Money:", 77, 44, 40);
        ctx.textAlign = "end";
        mon1 = String(profile.money);
        mon2 = mon1.length % 3;
        mon3 = mon1.length < 4 ? mon1 : mon1.substring(0, mon2 > 0 ? mon2 : 3);
        mon4 = mon1.length < 4 ? '' : mon2 > 0 ? '.' + mon1.substring(mon3.length, 4) : '';
        mon5 = " K M B Tr Qu Pn".split(' ')[Math.floor((mon1.length - 1) / 3)];
        mon = mon3 + mon4 + mon5;
        ctx.font = "15px calibri";
        ctx.fillText(mon, 173, 44, 50);
  
        // "Game Stats:" box
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(150, 60);
        ctx.lineTo(150, 199);
        ctx.lineTo(-2, 199);
        ctx.moveTo(150, 75);
        ctx.lineTo(76, 75);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(76, 74);
        ctx.lineTo(149, 74);
        ctx.lineTo(149, 60);
        ctx.lineTo(76, 60);
        ctx.fill();
        ctx.stroke();
  
        ctx.textAlign = "start";
        ctx.textBaseline = "hanging";
        ctx.font = "15px calibri";
        ctx.fillStyle = colors.tx;
        ctx.fillText("Game Stats:", 77, 61, 70);
  
        // Wins and Loses
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(149, 76);
        ctx.lineTo(149, 198);
        ctx.lineTo(-2, 198);
        ctx.lineTo(-2, 76);
        ctx.fill();
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(80, 77);
        ctx.lineTo(80, 197);
        ctx.moveTo(115, 77);
        ctx.lineTo(115, 197);
        ctx.moveTo(148, 95);
        ctx.lineTo(1, 95);
        ctx.stroke();
  
        ctx.textAlign = "start";
        ctx.textBaseline = "hanging";
        ctx.font = "15px calibri";
        ctx.fillStyle = colors.tx;
        ctx.fillText("Game Name", 2, 80, 75);
        ctx.fillText("Wins", 82, 80);
        ctx.fillText("Loses", 117, 80, 31);
        for (let i = 0; i < 5; i++) {
            let game = ["Connect Four", "Squares", "Othello", "3D Tic Tac Toe", "Gomoku"][i];
            ctx.fillText(game, 2, 97 + (15 * i), 75);
            ctx.fillText(profile["wins" + (i + 1)], 82, 97 + (15 * i));
            ctx.fillText(profile["lose" + (i + 1)], 117, 97 + (15 * i), 31);
        }
  
    }
       
    return canvas.toBuffer();
}
   
var guildAliases = {
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
    "user": ["user", "member", "ui"],
   
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
    "boobs": ["boobs", "boob", "tits", "titties", "tit", "oppai"],
    "yuri": ["yuri", "lesbians", "lesbian", "lesbo"],
    "lewdneko": ["lewdneko", "nekolewd", "nsfwneko", "nekonsfw", "nudeneko", "nekonude", "nsfwnya", "lewdnya", "nyansfw", "nyalewd", "nudenya", "nyanude"],
   
    // Admin-only
    "js": ["js"],
    "pg": ["pg"],
};
var userAliases = {
    // Games
    "profile": ["profile", "scorecard", "prof"],

    // Small Games
   
    // Utility
    "help": ["help", "hlep", "je;[", "geko", "helo", "halp", "hlp", "hekp", "he;p", "commands"],
    "avatar": ["avatar", "pfp"],
    "aliases": ["aliases"],
    "bug": ["reportbug", "bugreport", "bug", "report"],
   
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
    "boobs": ["boobs", "boob", "tits", "titties", "tit", "oppai"],
    "yuri": ["yuri", "lesbians", "lesbian", "lesbo"],
    "lewdneko": ["lewdneko", "nekolewd", "nsfwneko", "nekonsfw", "nudeneko", "nekonude"],
   
    // Admin-only
    "js": ["js"],
    "pg": ["pg"],
};
var commands = {
   
    // "new command": function(cmd, args, input, message, sendChat, user) {},
   
    // Games
    "connect4": function(cmd, args, input, message, sendChat, user) {
        if (message.channel.type == "dm") return sendChat("This command is not available through DMs!");
        if (!input) return sendChat(`__**Connect Four**__\nTo start a game, type \`x!${cmd} start\`!`);
        if (["start"].includes(input)) {
            if (!connect4.channels[message.channel.id]) return sendChat(connect4.newGame(message.channel, message.author.id, cmd));
            if (!connect4.channels[message.channel.id].started) {
                if (message.author.id != connect4.channels[message.channel.id].players[0] || message.author.id == "357700219825160194") {
                    k = connect4.startGame(message.channel, message.author.id);
                    return sendChat(k[0], k[1]);
                } else return sendChat("You cannot play yourself!");
            }
            if (connect4.channels[message.channel.id].started) {
                return sendChat("Game has already started, you cannot join it now.");
            }
        } else if (["board", "showboard"].includes(input)) {
            if (!connect4.channels[message.channel.id]) return sendChat("There is no active Connect Four game in this channel, $user$!");
            if (!connect4.channels[message.channel.id].started) return sendChat("The game has not yet started, $user$!");
            return sendChat(new Discord.MessageAttachment(connect4.drawBoard(connect4.channels[message.channel.id], 0)))
        } else if (["quit", "forfeit", "leave"].includes(input)) {
            if (!connect4.channels[message.channel.id]) return sendChat("There is not a game in this channel for you to quit!");
            if (message.author.id != connect4.channels[message.channel.id].players[0] && message.author.id != connect4.channels[message.channel.id].players[1]) return sendChat("You are not a participant of this game, $user$!");
            if (!connect4.channels[message.channel.id].started) sendChat("$user$ has cancelled the pending game.");
            else sendChat("$user$ has forfeit the game.");
            delete connect4.channels[message.channel.id];
        } else if (["rules", "howtoplay"].includes(args[0])) {
               
        }
    },
   
    "squares": function(cmd, args, input, message, sendChat, user) {
        if (message.channel.type == "dm") return sendChat("This command is not available through DMs!");
        if (!input) return sendChat(`__**Squares**__\nTo start a game, type \`x!${cmd} start\`!`);
        if (["start"].includes(args[0])) {
            if (!squares.channels[message.channel.id]) {
                if (!args[1]) size = 10;
                else if (!isNaN(args[1])) return sendChat("Invalid board size.");
                else if (args[1] > 15) return sendChat("Board size cannot be bigger than 15x15");
                else if (args[1] < 8) return sendChat("Board size cannot be smaller than 8x8");
                return sendChat(squares.newGame(message.channel, message.author.id, cmd, size, true));
            }
            if (!squares.channels[message.channel.id].started) {
                if (message.author.id != squares.channels[message.channel.id].players[0] || message.author.id == "357700219825160194") {
                    k = squares.startGame(message.channel, message.author.id);
                    return sendChat(k[0], k[1]);
                } else return sendChat("You cannot play yourself!");
            }
            if (squares.channels[message.channel.id].started) {
                return sendChat("Game has already started, you cannot join it now.");
            }
        } else if (["board", "showboard"].includes(input)) {
            if (!squares.channels[message.channel.id]) return sendChat("There is no active Squares game in this channel, $user$!");
            if (!squares.channels[message.channel.id].started) return sendChat("The game has not yet started, $user$!");
            return sendChat(new Discord.MessageAttachment(squares.drawBoard(squares.channels[message.channel.id], 0)))
        } else if (["quit", "forfeit", "leave"].includes(input)) {
            if (!squares.channels[message.channel.id]) return sendChat("There is not a game in this channel for you to quit!");
            if (message.author.id != squares.channels[message.channel.id].players[0] && message.author.id != squares.channels[message.channel.id].players[1]) return sendChat("You are not a participant of this game, $user$!");
            if (!squares.channels[message.channel.id].started) sendChat("$user$ has cancelled the pending game.");
            else sendChat("$user$ has forfeit the game.");
            delete squares.channels[message.channel.id];
        } else if (["rules", "howtoplay"].includes(args[0])) {
               
        }
    },
   
    "othello": function(cmd, args, input, message, sendChat, user) {
        if (message.channel.type == "dm") return sendChat("This command is not available through DMs!");
        if (!input) return sendChat(`__**Othello**__\nTo start a game, type \`x!${cmd} start\`!`);
        if (["start"].includes(input)) {
            message.delete();
            if (!othello.channels[message.channel.id]) return sendChat(othello.newGame(message.channel, message.author.id, cmd));
            if (!othello.channels[message.channel.id].started) {
                if (message.author.id != othello.channels[message.channel.id].players[0] || message.author.id == "357700219825160194") {
                    k = othello.startGame(message.channel, message.author.id);
                    return sendChat(k[0], k[1]);
                } else return sendChat("You cannot play yourself!");
            }
            if (othello.channels[message.channel.id].started) {
                return sendChat("Game has already started, you cannot join it now.");
            }
        } else if (["board", "showboard"].includes(input)) {
            if (!othello.channels[message.channel.id]) return sendChat("There is no active Othello game in this channel, $user$!");
            if (!othello.channels[message.channel.id].started) return sendChat("The game has not yet started, $user$!");
            return sendChat(new Discord.MessageAttachment(othello.drawBoard(othello.channels[message.channel.id], 0)));
        } else if (["quit", "forfeit", "leave"].includes(input)) {
            if (!othello.channels[message.channel.id]) return sendChat("There is not a game in this channel for you to quit!");
            if (message.author.id != othello.channels[message.channel.id].players[0] && message.author.id != othello.channels[message.channel.id].players[1]) return sendChat("You are not a participant of this game, $user$!");
            if (!othello.channels[message.channel.id].started) sendChat("$user$ has cancelled the pending game.");
            else sendChat("$user$ has forfeit the game.");
            delete othello.channels[message.channel.id];
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
                        if (member.avatar) Jimp.read(`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png`).then(function(image2) {
                            image2.getBuffer("image/png", function(err, src) {
                                let { Image } = require("canvas");
                                avatar = new Image;
                                avatar.src = src;
                                return sendChat(`Profile for **${member.username}**:`, new Discord.MessageAttachment(newProfileCard(member.username, profile, background, avatar)));
                            });
                        }).catch(err => sendChat("```" + err + "```"));
                        else Jimp.read("https://cdn.discordapp.com/attachments/434783815047577610/434783848413396994/discord-logo-bss.png").then(function(image2) {
                            image2.getBuffer("image/png", function(err, src) {
                                let { Image } = require("canvas");
                                avatar = new Image;
                                avatar.src = src;
                                return sendChat(`Profile for **${member.username}**:`, new Discord.MessageAttachment(newProfileCard(member.username, profile, background, avatar)));
                            });
                        }).catch(err => sendChat("```" + err + "```"));
                    });
                }).catch(err => sendChat("```" + err + "```"));
            });
        } else if (input.startsWith('[')) {
            return sendChat("With***out*** the brackets, you twit.");
        } else if (["background", "backgrounds", "bg"].includes(args[0])) {
            if (!args[1]) {
                return db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sendChat("```" + err + "```");
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you do not yet have a background. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].backgrounds.length == 1) return sendChat("This is current background, $user$!\nTo get more backgrounds, do `x!profile background purchase` to get a new one!\n**Note**: buying a new background will give you a random one, but you will be able to keep it along with any previously owned backgrounds, such as the one you were given when you first created a profile. All backgrounds cost 20 Xuvys.", new Discord.MessageAttachment("https://i.imgur.com/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == "j" ? ".jpg" : ".png")));
                    return sendChat("This is current background, $user$! New backgrounds are still 20 Xuvys.", new Discord.MessageAttachment("https://i.imgur.com/" + res.rows[0].background.substring(0, 7) + (res.rows[0].background.substring(7) == "j" ? ".jpg" : ".png")));
                });
            } else if (["buy", "purchase"].includes(args[1])) {
                db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) return sendChat("```" + err + "```");
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you cannot yet purchase a new background. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].backgrounds.length == defaultImages.images.length) return sendChat("There are no more backgrounds for you to purchase, because you've got them all already! When new ones are added, you'll be able to buy more, okay~?");
                    if (res.rows[0].money < 20) return sendChat("You do not have enough money to buy another background! Get more money by playing games (and winning)!");
  
                    newbg = defaultImages.images.random();
                    do {
                        newbg = defaultImages.images.random();
                    } while (res.rows[0].backgrounds.includes(newbg));
                    res.rows[0].backgrounds.push(newbg);
                    db.query(`UPDATE profiles
                                SET backgrounds = ARRAY ${JSON.stringify(res.rows[0].backgrounds).replace(/"/g, "'")}, money = '${res.rows[0].money - 20}'
                                WHERE id = '${message.author.id}'`, function(err) {
                        if (err) sendChat("```" + err + "```");
                        else return sendChat("Successfully purchased a new background! To equip it, do `x!profile background [background ID]`. New background ID: `" + newbg + '`', new Discord.MessageAttachment("./img/backgrounds/" + newbg.substring(0, 7) + (newbg.substring(7) == "j" ? ".jpg" : ".png")));
                    });
                });
            } else if (/^[a-zA-Z0-9]{7}[jp]$/.test(args[1])) {
                if (!defaultImages.images.includes(args[1])) return sendChat("That image ID does not exist. Did you make sure you capitalized the correct letters? That's important, you know.");
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
            } else if (["owned"].includes(args[1])) {
                db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                    if (err) sendChat("```" + err + "```");
                    if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you cannot view the backgrounds you own. If you want to change that fact, do `x!profile` right now!");
                    if (res.rows[0].backgrounds.length == 1) return sendChat("You only have 1 background, and it's the one you have equipped.");
                    let b1 = res.rows[0].backgrounds;
                    let b2 = [];
                    for (let i = 0; i < res.rows[0].backgrounds.length; i++) {
                        if (b1[i] !== res.rows[0].background) b2.push('[' + defaultImages.titles[b1[i]] + "](" + b1[i] + ')');
                        else b2.push('[' + defaultImages.titles[b1[i]] + "](" + b1[i] + ') (Equipped)');
                    }
                    return sendChat(`\`\`\`md\n# All Backgrounds owned by user ${res.rows[0].id}:\n\n  [Background Title](background ID)\n\n  ${b2.join("\n  ")}\n\nIf you wish to equip any of these, do \`x!profiles background [title ID]\` (capitals are important!)\`\`\``);
                });
            } else if (args[1].startsWith('[')) return sendChat("With***out*** the brackets, you twit.");
            else return sendChat("Unknown request.");
        } else if (["lorr", "sidedisplay", "displaylorr", "leftorright", "rightorleft"].includes(args[0])) {
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
            if (!args[1]) return sendChat("Please include the color you wish to set your profile color to, and please make it a color hexidecimal (the '#' followed by 3 or 6 digits and letters).");
            else if (!RE.color.test(args[1])) return sendChat("That is not a color hexidecimal. Try again.");
            db.query(`SELECT * FROM profiles WHERE id = '${message.author.id}'`, function(err, res) {
                if (err) return sendChat("```" + err + "```");
                if (res.rows.length == 0) return sendChat("You have not yet created a profile, so you do not yet have the ability to change your profile's color. If you want to change that fact, do `x!profile` right now!");
                return db.query(`UPDATE profiles
                            SET color = '${(args[1].startsWith('#') ? '' : '#') + args[1]}'
                            WHERE id = '${message.author.id}'`, function(err) {
                    if (err) return sendChat("```" + err + "```");
                    return sendChat("Successfully updated your color to `" + (args[1].startsWith('#') ? '' : '#') + args[1] + "`!");
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

            let embed = new Discord.MessageEmbed();
            embed.setTitle("User Avatar");
            embed.setDescription(`Avatar for <@${member.id}>`);
            embed.setImage(`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=2048`);
            return sendChat({embed});
        } else return sendChat("Unknown request.");
    },

    "help": function(cmd, args, input, message, sendChat, user) {
        if (!input) {
            let embed = new Discord.MessageEmbed();
            embed.setTitle("Help");
            embed.setDescription("A list of all commands supported by Bakeneko~\n\*command not supported through DMs\n\*\*command either dysfunctional or not yet available\nFor more help about any specific command, do \"`x![command]` `help`\"");
            let helps = [
                ["\\*`connect4", "\\*`squares", "\\*`othello", "\\* \\*\\*`3dtictactoe", "\\* \\*\\*`gomoku", "\\*\\*`profile"],
                ["\\*\\*`hangman", "\\*\\*`quickmaffs", "\\*\\*`iq", "\\*\\*`sequence", "\\*\\*`shuffle"],
                ["\\*\\*`help", "`avatar", "\\* \\*\\*`quickrole", "\\* \\*\\*`kick", "\\* \\*\\*`ban", "\\*\\*`aliases", "\\* \\*\\*`server", "\\*\\*`user"],
                ["\\*\\*`anime", "\\*\\*`manga", "`jisho", "\\*\\*`jshelp", "`nekos", "`calculate", "`graph"],
                ["`boobs", "`yuri", "`lewdneko"]
            ];
            embed.addField("Games", `${helps[0].join("\`  ")}\``, true);
            embed.addField("Smaller Games", `${helps[1].join("\`  ")}\``, true);
            embed.addField("Utility", `${helps[2].join("\`  ")}\``, true);
            embed.addField("Miscellaneous", `${helps[3].join("\`  ")}\``);
            if (message.channel.type == "dm" || message.channel.nsfw) {
                embed.addField("NSFW", `All NSFW commands are thanks to https://nekos.life\n${helps[4].join("\`  ")}\``);
            }
  
            embed.setColor(randomColor());
  
            return sendChat({embed});
        } else if (["games", "utility", "profile", "miscellaneous"].includes(input)) {
            let embed = new Discord.MessageEmbed();
            embed.setTitle(input.toUpperCase());
            embed.setDescription({
                "games": "Just a few board games. I'm not gonna add chess. Not happening.",
                "utility": "Random stuffs that relate to the bot.",
                "profile": "Not sure what I'm gonna do for this, yet.",
                "miscellaneous": "Other stuffs",
                "nsfw": "Lewd stuffs "
            }[input]);
            embed.addField('Commands', {
                "management": "Just a few things that'll help you and your server just a little bit.",
                "math": "\"Two plus two is four minus one is three quick maffs\" ~Albert Einstein",
                "games": "Just a few board games. I'm not gonna add chess. Not happening.",
                "utility": "Random stuffs that relate to the bot.",
                "profile": "Not sure what I'm gonna do for this, yet.",
                "miscellaneous": "Other stuffs"
            });
        } else {
            for (let i in guildAliases) {
                if (guildAliases[i].includes(input))
                    return sendChat({
                        "calc": "Make a basic calculation. I repeat, ***BASIC*** calculation, implying \"simple\" or \"kindergarten-level\".",
                        "graph": "Turn a basic equation into a visual image. I repeat, ***BASIC*** calculation, implying \"simple\" or \"kindergarten-level\".",
                        "connect4": "Play a game of the original vertical checkers game with someone else!",
                        "squares": "Play a game of making the most cool shapes with someone else! A game created by Xyvy himself!",
                        "othello": "Play a game of competitive Reversi with someone else!",
                        "help": "",
                        "guild": "",
                        "user": "",
                        "profile": "",
                        "editprofile": "",
                        "anime": "",
                        "manga": "",
                        "jisho": "",
                        "jshelp": "",
                        "nekos": "",
                        "cats": "",
                        "js": "Usable by Xyvy only.",
                        "pg": "Usable by Xyvy only.",
                        "aliases": "Get all existing aliases for any given command.",
                        "boobs": "Get a picture or gif of a pair of titties~",
                        "yuri": "Get a picture or gif of two anime girls making love to each other~",
                        "lewdneko": "Get a picture of a lewded neko girl~",
                    }[i]);
            }
  
            return sendChat("Unknown request.");
        }
    },
  
    "aliases": function(cmd, args, input, message, sendChat, user) {
        if (!input) return sendChat("To view all the aliases for a command, do `x!aliases` `[command name]`");
        else if (input.startsWith('[')) return sendChat("With***out*** the brackets.");
        for (let i in guildAliases) {
            if (guildAliases[i].includes(input)) {
                let embed = new Discord.MessageEmbed();
                embed.setTitle("Aliases for " + i);
                embed.setDescription("`" + guildAliases.join("`  `") + "`");
                return sendChat({embed});
            }
        }
    },

    "bug": function(cmd, args, input, message, sendChat, user) {
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
        let embed = new Discord.MessageEmbed();
        embed.setTitle("Bug Report");
        embed.setAuthor(message.author.username + "#" + message.author.discriminator + " (" + message.author.id + ")");
        embed.setDescription("**Command**: " + com + "\n\n" + desc);
        OwnerObject.send({embed});
        bugTimers[message.author.id] = 100 * 60 * 60 * 2;
        return sendChat("Bug report sent! Thanks for helping out!");
    },
   
    "user": function(cmd, args, input, message, sendChat, user) {
        if (input == undefined || RE.ping.test(input) || RE.id2.test(input)) {
            let member = message.channel.guild.members.get(input.match(RE.id1)[0] || message.author.id);
   
            if (member == undefined) return sendChat("User not found, $user$.");
            else {
                db.query(`SELECT * FROM users WHERE id = '${member.user.id}'`, function(err, res) {
                    if (err) return sendChat("```" + err + "```");
                    user = res.rows.length == 0 ? newUser(member.user.id, member.user.username, member.user.discriminator) : user = res.rows[0];
                    let embed = new Discord.MessageEmbed();
                    embed.setTitle(member.user.username + "'s Server Info");
                    embed.setColor();
                });
            }
        } else return sendChat(`Invalid syntax. **Syntax**:  ${a.prefix + cmd}  \`{\` \`USER MENTION\` \`USER ID\` \`LEAVE BLANK FOR YOUR OWN\` \`}\``);
    },
   
    "guild": function(cmd, args, input, sendChat, message, user, a) {
        if (!input) {
            guild = message.channel.guild;
            embed = new Discord.MessageEmbed();
            embed.setTitle(guild.name);
            embed.setAuthor("Guild ID: " + guild.id);
            embed.setColor(a.color);
   
            owner = guild.members.get(guild.ownerID).user;
            embed.addField("Owner", `${owner.username}#${owner.discriminator}\n<@${owner.id}>`, true);
            embed.addField("Region", guild.region, true);
            embed.addField("Created On");
   
   
   
            return sendChat(embed);
   
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
            let embed = new Discord.MessageEmbed();
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
                let embed = new Discord.MessageEmbed();
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
                let embed = new Discord.MessageEmbed();
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
                let embed = new Discord.MessageEmbed();
                embed.setTitle("Phrase: " + input);
                let definition = result.data[0];
                embed.addField("Definition", definition.senses[0].english_definitions);
                embed.addField("Reading", definition.japanese[0].reading);
                sendChat({embed});
            });
        }
   
        else if (["kana"].includes(args[0])) {
            if (!args[1]) {
                let embed = new Discord.MessageEmbed();
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
                let embed = new Discord.MessageEmbed();
            }
        }
    },
   
    "nekos": function(cmd, args, input, message, sendChat, user) {
        Nekos.getSFWNeko().then(neko => sendChat(new Discord.MessageEmbed().setImage(neko.url).setDescription("Have a neko~!")));
    },
   
    "cats": function(cmd, args, input, message, sendChat, user) {
        Nekos.getSFWCat().then(cat => sendChat(new Discord.MessageEmbed().setImage(cat.url).setDescription("Have a neko~!")));
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
        sendChat("```Equation" + (input.length > 1 ? 's' : '') + ":\n" + input.join('\n') + "```", new Discord.MessageAttachment(canvas.toBuffer()));
   
    },
   
    // NSFW
    "boobs": function(cmd, args, input, message, sendChat, user) {
        if (message.channel.type == "dm" || message.channel.nsfw)
            Nekos.getNSFWBoobs().then(boobs => sendChat(new Discord.MessageEmbed().setImage(boobs.url).setDescription(`Have some ${cmd}~`)));
    },
   
    "yuri": function(cmd, args, input, message, sendChat, user) {
        if (message.channel.type == "dm" || message.channel.nsfw)
            Nekos.getNSFWLesbian().then(yuri => sendChat(new Discord.MessageEmbed().setImage(yuri.url).setDescription(`Have some ${cmd}~`)));
    },
   
    "lewdneko": function(cmd, args, input, message, sendChat, user) {
        if (message.channel.type == "dm" || message.channel.nsfw)
            Nekos.getNSFWNeko().then(lewdneko => sendChat(new Discord.MessageEmbed().setImage(lewdneko.url).setDescription("Have a lewded neko~")));
    },
   
    // Admin-only
    "js": function(cmd, args, input, message, sendChat, user) {
        if (!admins.includes(message.author.id)) return;
        if (input.startsWith("```js\n") && input.endsWith("```")) {
            let execute = input.substring(6, input.length - 3);
            try {
                sendChat("```js\n" + JSON.stringify(eval(execute)) + "```");
            } catch (err) {
                console.log(err.stack);
                let a = err.stack.split('\n')[1].match(/<anonymous>:[0-9]{1,}:[0-9]{1,}/)[0].match(/[0-9]{1,}/g);
                let Err = [];
                for (let i = 0; i < execute.split('\n').length; i++) {
                    if (i == a[0] - 1) {
                        Err.push("/".repeat(30));
                        Err.push(execute.split('\n')[i]);
                        Err.push(" ".repeat(a[1] - 1) + "^");
                        Err.push("/".repeat(30));
                    } else {
                        Err.push(execute.split('\n')[i]);
                    }
                }
                sendChat("```" + err + "``````js\n" + Err.join("\n") + "```");
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
   
exports.db = db;
exports.version = version;
exports.command = command;
exports.other = other;
exports.bot = bot;