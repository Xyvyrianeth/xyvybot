const Discord = require("discord.js");
const { client } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
setInterval(function() {
    let minigames = exports.minigames;
    minigames.forEach((minigame, index) => {
        minigame.timer--;
        if (minigame.timer == 0)
        {
			if (minigame.type == "iq")
			{
				client.channels.cache.get(minigame.channel).send(minigame.embeds.lose);
				delete minigames[index];
				minigames.splice(index, 1);
			}
			if (minigame.type == "hangman")
			{
				let display = [];
				for (let i = 0; i < minigame.ans.length; i++)
				{
					if (/^([A-Z0-9][\u0300-\u036f]?|\u200b \u200b \u200b \u200b)$/.test(minigame.ans[i])) display.push("__" + minigame.ans[i] + "__");
					else display.push(minigame.ans[i]);
				}
				let embed = new Discord.RichEmbed()
					.setTitle("Hangman")
					.setColor(new Color(231, 76, 60).toHexa())
					.addField("Looks like nobody's playing anymore!", `**${display.join("\u200b \u200b")}**\n\nGuesses: \`` + minigame.guesses.join("` `") + '`');
				client.channels.cache.get(minigame.channel).send(embed);
				delete minigames[index];
				minigames.splice(index, 1);
			}
        }
    });
    exports.minigames = minigames;
}, 1000);
exports.minigames = [];