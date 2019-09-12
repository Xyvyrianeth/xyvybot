x = [0, 0, 0, 0, 0, 0];
if (game.here) x[0] = 1;
if (game.started) x[1] = 1;
if (message.author.id == "561578790837289002") x[2] = 1;
if (game.players.includes(message.author.id)) x[3] = 1;
if (games.channels.hasOwnProperty(message.channel.id)) x[4] = 1;
if (game.game == gameName) x[5] = 1;

y = [
    0, // pend game
    1, // start game
    "A different game is pending in this channel.", // say this then do nothing
    0,
    "You are already pending a different game in a different channel.",
    "You are already pending this game in a different channel.",
    "You are already pending a different game in this channel.",
    "You cannot play a game against yourself.",
    2, // do nothing.
    2,
    2,
    0,
    2,
    2,
    2,
    2,
    0,
    0,
    "A game is currently active in this channel.",
    "A game is currently active in this channel.",
    "You are already playing a game in a different channel.",
    "You are already playing this game in a different channel.",
    "You are already playing a game in this channel.",
    "You are already playing this game in this channel.",
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,

][Number(parseInt(x.join(''), 2).toString(10))];