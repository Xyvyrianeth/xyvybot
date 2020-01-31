const Discord = require("discord.js");
const { client, config } = require("/app/Xyvy.js");
var db = require("/app/commands.js").db;

var backup = true;

var timer = setInterval(function() {
    let minigames = exports.minigames;
    minigames.forEach((game, index) => {
        game.timer.time--;
        if (game.timer.time == 0)
        {
            for (let ch in game.channels)
            {
                client.channels.get(ch).send(game.timer.embed);
            }
            delete games[index];
            minigames.splice(index, 1);
        }
    });
    exports.minigames = minigames;
}, 1000);

exports.minigames = [];
