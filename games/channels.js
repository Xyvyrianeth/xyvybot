const Discord = require("discord.js");
const { client } = require("/app/Xyvy.js");

var channels = {}; // Leave blank

var timer = setInterval(function() {
    for (let channel in channels)
    {
        channels[channel].timer.time -= 1;
        if (channels[channel].timer.time == 0)
        {
            if (channels[channel].buffer)
            {
                client.guilds.get(channels[channel].guild).channels.get(channel).send(channels[channel].timer.message, channels[channel].buffer);
            }
            else
            {
                client.guilds.get(channels[channel].guild).channels.get(channel).send(channels[channel].timer.message);
            }
            delete channels[channel];
        }
    }
}, 100);

exports.channels = channels;