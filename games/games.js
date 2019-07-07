const Discord = require("discord.js");
const { client, config } = require("/app/Xyvy.js");
var db = require("/app/commands.js").db;

exports.games = [];

var timer = setInterval(function() {
    console.log(exports.games.length);
    exports.games.forEach((game, index) => {
        game.timer.time -= 1;
        if (game.timer.time == 0)
        {
            for (let ch of game.channels)
            {
                client.channels.get(ch).send(game.timer.message, game.buffer);
            }
            delete exports.games[index];
            exports.games.splice(index, 1);
        }
        if (game.forfeit)
        {
            for (let ch of game.channels)
            {
                client.channels.get(ch).send(`Well, <@${game.forfeit == game.players[0] ? game.players[1] : game.players[0]}>, It looks like your opponent, <@${game.forfeit}>, has forfeit the game!`, {});
            }
            delete exports.games[index];
            exports.games.splice(index, 1);
        }
        if (game.over)
        {
            delete exports.games[index];
            exports.games.splice(index, 1);
        }
    });

    if (exports.games.length > 0)
    {
        db.query(`UPDATE games SET data = '${JSON.stringify(exports.games)}'`);
    }
    else
    {
        db.query("SELECT * FROM games", function(err, res) {
            if (err)
            {
                client.channels.get("478371618620571648").send('Error retrieving game data backups\n```\n' + err + '```');
            }
            if (res.rows[0].backup)
            {
                exports.games = res.rows[0].data;
                db.query("UPDATE games SET backup = false");
            }
            else
            {
                db.query("UPDATE games SET data = '[]'");
            }
        });
    }
}, 5000);