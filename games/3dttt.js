const Discord = require("discord.js");
const Canvas = require("canvas");
const { channels } = require("/app/games/channels.js");
var gamename = "3D Tic Tac Toe";
var shortname = "3dttt";

exports.newGame = function(channel, player1, cmd, mode) {
    channels[channel.id] = {game:shortname,channel:channel,turn:0,players:[],started:false,lastmove:'',player:false,RE:/^[1-4] ?([1-4] ?[a-d]|[a-d] ?[1-4])$/i,casual:mode};
    let game = channels[channel.id];
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
        time: 9000,
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
    game.buffer = exports.drawBoard(game, 0, highlight);
    return ["The game has started!", new Discord.Attachment(game.buffer, `${shortname}_0.png`)];
}
 
exports.drawBoard = function(game, end, highlight) {
    
}
 
exports.takeTurn = function(channel, move) {
    let game = channels[channel.id];
     
    // Function will vary with game
    
    //
     
    return exports.nextTurn(channel, end);
}
 
exports.nextTurn = function(channel, end) {
    let game = channels[channel.id];
    if (end == 0) {
        game.turn = game.turn == 0 ? 1 : 0;
        game.player = game.players[game.turn];
        game.timer = {
            time: 10 * 60 * 5,
            message: `Whoops, it looks like <@${game.player}> has run out of time, so the game is over!`
        }
    }
    game.buffer = exports.drawBoard(game, end, highlight);
    board = new Discord.Attachment(game.buffer, `${shortname}_${end}.png`);
    if (channels[channel.id].lastDisplay) channels[channel.id].lastDisplay.delete();
    if (end != 0) {
        delete channels[channel.id];
    }
    return board;
}