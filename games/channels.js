const Discord = require("discord.js");

var channels = {}; // Leave blank

var timer = setInterval(function() {
    for (let channel in channels)
    {
        channels[channel].timer.time -= 1;
        if (channels[channel].timer.time == 0)
        {
            if (channels[channel].buffer)
            {
                client.guilds.get(channels[channel].guild).channels.get(channel).send(channels[i].timer.message, channels[i].buffer);
            }
            else
            {
                client.guilds.get(channels[channel].guild).channels.get(channel).send(channels[i].timer.message);
            }
            delete channels[i];
        }
    }
}, 100);

exports.channels = channels;