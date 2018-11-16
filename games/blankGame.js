const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
var gamename = "";
var shortname = "";

exports.newGame = function(channel, player1, cmd, mode) {
    channels[channel.id] = {game:shortname,channel:channel,turn:0,players:[],started:false,lastmove:'',player:false,RE:/stuff/,casual:mode};
    let game = channels[channel.id];
    game.board = [];
 
    game.timer = {
        time: 100 * 60 * 15,
        message: "It appears nobody wants to play right now, <@" + player1 + ">."
    }
 
    game.players[0] = player1;
    return `**$user$** is now requesting a new game of ${gamename}, say \`x!${cmd} start\` to play against them!`;
}
 
exports.startGame = function(channel, player2) {
    let game = channels[channel.id];
    game.players[1] = player2;
    game.started = true;
 
    game.timer = {
        time: 100 * 60 * 5,
        message: "Whoops, it looks like <@" + game.players[0] + "> has run out of time, so the game is over!"
    }
 
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
    game.player = game.players[0];
 
    return ["The game has started! <@" + game.players[0] + "> will be player1, and <@" + game.players[1] + "> will be player2!\n\nTo place a piece, just say the number of the column you wish to place in.", new Discord.Attachment(exports.drawBoard(game, 0), `${shortname}_0_${game.players[0]}vs${game.players[1]}.png`)];
}
 
exports.drawBoard = function(game, end, highlight) {
    let canvas = new Canvas(220, 225);
    let ctx = canvas.getContext("2d");
     
    // Function will vary with game
    
    //
     
    return canvas.toBuffer();
}
 
exports.takeTurn = function(channel, move) {
    let game = channels[channel.id];
     
    // Function will vary with game
    
    //
 
    if (end == 0) game.timer = {
        time: 100 * 60 * 5,
        message: "Whoops, it looks like <@" + game.players[game.turn] + "> has run out of time, so the game is over!"
    }
     
    return exports.nextTurn(channel, end, row);
}
 
exports.nextTurn = function(channel, end, highlight) {
    let game = channels[channel.id];
    if (end == 0) {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
    }
    game.buffer = exports.drawBoard(game, end, highlight);
    board = new Discord.Attachment(game.buffer, end == 1 ? `${shortname}_${end}_${game.players[game.turn]}.png` : `${shortname}_${end}_${game.players[0]}vs${game.players[1]}.png`);
    if (channels[channel.id].lastDisplay) channels[channel.id].lastDisplay.delete();
    return board;
}