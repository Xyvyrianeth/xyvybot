const Discord = require("discord.js");
const { client, config } = require("/app/Xyvy.js");

var backup = true;

var timer = setInterval(function() {
    let games = exports.games;
    games.forEach((game, index) => {
        game.timer.time--;
        if (game.timer.time == 0)
        {
            for (let ch in game.channels)
            {
                client.channels.get(ch).send(game.timer.message);
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
    });
    exports.games = games;
}, 1000);

exports.games = [];
