const Discord = require("discord.js");
const { client, config } = require("/app/Xyvy.js");
var db = require("/app/commands.js").db;

var backup = true;

var timer = setInterval(function() {
    let minigames = exports.minigames;
    minigames.forEach((minigame, index) => {
        minigame.timer--;
        if (minigame.timer == 0)
        {
            client.channels.get(minigame.channel).send(minigame.embeds.lose);
            delete minigames[index];
            minigames.splice(index, 1);
        }
    });
    exports.minigames = minigames;
}, 1000);

exports.minigames = [];
