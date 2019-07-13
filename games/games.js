const Discord = require("discord.js");
const { client, config } = require("/app/Xyvy.js");
var db = require("/app/commands.js").db;
var backup = true;

var games = [];

var timer = setInterval(function() {
    games.forEach((game, index) => {
        game.timer.time--;
        if (game.timer.time == 0)
        {
            for (let ch in game.channels)
            {
                client.channels.get(ch).send(game.timer.message, game.buffer);
            }
            delete games[index];
            games.splice(index, 1);
        }
        if (game.players.includes(game.forfeit))
        {
            for (let ch in game.channels)
            {
                client.channels.get(ch).send(`Well, <@${game.forfeit == game.players[0] ? game.players[1] : game.players[0]}>, It looks like your opponent, <@${game.forfeit}>, has forfeit the game!`, {});
            }
            delete games[index];
            games.splice(index, 1);
        }
        if (game.over)
        {
            delete games[index];
            games.splice(index, 1);
        }
    });
    db.query("SELECT * FROM games", function(err, res) {
        if (err)
        {
            client.channels.get("478371618620571648").send('Error retrieving game data backups\n```\n' + err + '```');
        }

        if (backup)
        {
            games = res.rows[0].data;
            backup = false;
        }
        
        if (games.length > 0)
        {
            db.query(`UPDATE games SET data = '${JSON.stringify(games)}'`);
        }
        else
        {
            db.query("UPDATE games SET data = '[]'");
        }
    });
}, 1000);

exports.games = games;
