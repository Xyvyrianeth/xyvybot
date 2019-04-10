const Discord = require("discord.js");
const { client } = require("/app/Xyvy.js");

var games = []; // Leave blank

var timer = setInterval(function() {
    games.forEach((game, index) => {
        game.timer.time -= 1;
        if (game.timer.time == 0)
        {
            for (let i = 0; i < game.channels.length; i++)
            {
                client.channels.get(game.channels[i]).send(game.timer.message, game.buffer);
            }
            delete games[index];
            games.splice(index, 1);
        }
        if (game.forfeit)
        {
            for (let i = 0; i < game.channels.length; i++)
            {
                client.channels.get(game.channels[i]).send(`Well, <@${game.forfeit == game.players[0] ? game.players[0] : game.players[1]}>, It looks like your opponent, <@${game.forfeit}>, has forfeit the game!`, {});
            }
            delete games[index];
            games.splice(index, 1);
        }
    });
}, 100);

exports.games = games;