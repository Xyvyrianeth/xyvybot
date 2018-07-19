const Discord = require("discord.js");
const Canvas = require("canvas");
var gamename = "3D Tic Tac Toe";
var shortname = "3dttt";
 
exports.channels = {}; // Leave blank
exports.timer = setInterval(function() {
    for (let i in exports.channels) {
        exports.channels[i].timer.time -= 1;
        if (exports.channels[i].timer.time == 0) {
            exports.channels[i].channel.send(exports.channels[i].timer.message);
            delete exports.channels[i];
        }
    }
}, 10);
 
exports.newGame = function(channel, player1, cmd) {
    exports.channels[channel.id] = {turn:0,players:[],started:false,lastmove:''};
    game = exports.channels[channel.id];
    game.board = {
        '1': {
            'A': [],
            'B': [],
            'C': [],
            'D': [],
        },
        '2': {
            'A': [],
            'B': [],
            'C': [],
            'D': [],
        },
        '3': {
            'A': [],
            'B': [],
            'C': [],
            'D': [],
        },
        '4': {
            'A': [],
            'B': [],
            'C': [],
            'D': [],
        }
    };
 
    game.timer = {
        time: 100 * 60 * 15,
        message: "It appears nobody wants to play right now, <@" + player1 + ">."
    }
 
    game.players[0] = player1;
    return `**$user$** is now requesting a new game of ${gamename}, say \`x!${cmd} start\` to play against them!`;
}
 
exports.startGame = function(channel, player2) {
    game = exports.channels[channel.id];
    game.players[1] = player2;
    game.started = true;
 
    game.timer = {
        time: 100 * 60 * 5,
        message: "Whoops, it looks like <@" + game.players[0] + "> has run out of time, so the game is over!"
    }
 
    game.players = (Math.random() * 2 | 0) == 0 ? game.players : [game.players[1], game.players[0]]; // Makes player one random instead of always the challenger
 
    return ["The game has started!", new Discord.Attachment(exports.drawBoard(game), `${shortname}_0.png`)];
}
 
exports.drawBoard = function(game, end) {
    canvas = new Canvas(w, h);
    ctx = canvas.getContext('2d');
     
    // Function will vary with game
 
    //
     
    return new Discord.Attachment(canvas.toBuffer());
}
 
exports.takeTurn = function(channel, move) {
    let game = exports.channels[channel.id];
     
    // Function will vary with game
 
    //
 
    if (end == 0) game.timer = {
        time: 100 * 60 * 5,
        message: "Whoops, it looks like <@" + game.players[game.turn == 0 ? 1 : 0] + "> has run out of time, so the game is over!"
    }
     
    return exports.nextTurn(channel, end);
}
 
exports.nextTurn = function(channel, end) {
    let game = exports.channels[channel.id];
    if (end == 0) game.turn = game.turn == 0 ? 1 : 0;
    board = new Discord.Attachment(exports.drawBoard(game, end, highlight), `${shortname}_${end}.png`);
    if (exports.channels[channel.id].lastDisplay) exports.channels[channel.id].lastDisplay.delete();
    if (end != 0) {
        delete exports.channels[channel.id];
    }
    return board;
}