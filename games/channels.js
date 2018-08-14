const Discord = require("discord.js");

var channels = {}; // Leave blank

var timer = setInterval(function() {
    for (let i in channels) {
        channels[i].timer.time -= 1;
        if (channels[i].timer.time == 0) {
            if (channels[i].buffer) channels[i].channel.send(channels[i].timer.message, channels[i].buffer);
            else channels[i].channel.send(channels[i].timer.message);
            delete channels[i];
        }
    }
}, 10);

exports.channels = channels;