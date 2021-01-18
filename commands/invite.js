const Discord = require("discord.js");
const { db, sqlError } = require("/app/Xyvy.js");
var { Color } = require("/app/assets/misc/color.js");
exports.command = (cmd, args, input, message) => {
	let embed = new Discord.MessageEmbed()
	.setTitle("Click here to invite me to your server!", "https://discordapp.com/oauth2/authorize?client_id=398606274721480725&scope=bot&permissions=60416")
	.setColor(new Color().random());
	message.author.send(embed);
};