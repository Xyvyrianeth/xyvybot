const Discord = require("discord.js");
const { client, config } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
var db = require("/app/commands.js").db;

var backup = true;

var timer = setInterval(function() {
    let minigames = exports.minigames;
    minigames.forEach((minigame, index) => {
        minigame.timer--;
        if (minigame.timer == 0)
        {
			if (minigame.type == "iq")
			{
				client.channels.get(minigame.channel).send(minigame.embeds.lose);
				delete minigames[index];
				minigames.splice(index, 1);
			}
			if (minigame.type == "hangman")
			{
				let embed = new Discord.RichEmbed()
					.setTitle("Hangman")
					.setColor(new Color(231, 76, 60).toHexa())
					.addField("Looks like nobody's playing anymore!", "The word was\n**__" + minigame.ans.join("__ __") + "__**\n\nGuesses: `" + minigame.guesses.join("` `") + '`');
				client.channels.get(minigame.channel).send(embed);
				delete minigames[index];
				minigames.splice(index, 1);
			}
        }
    });
    exports.minigames = minigames;
}, 1000);

exports.minigames = [];
