const canvas = require('canvas');
var Color = require('/stuffs/color.js');
var titles = require('/stuffs/titles.json');

exports.card = function(username, profile, background, avatar) {
    // Set the picture
    res = newResolution(background.width, background.height);
    canvas = new Canvas(res[0], res[1]);
    ctx = canvas.getContext('2d');
    ctx.drawImage(background, 0, 0, res[0], res[1]);
  
    // Set important colors
    color = new Color.rgb(profile.color);
    colors = {
        bg: `rgba(${Math.floor(color.r <= 127.5 ? color.r + ((127.5 - color.r) / 2) : color.r)}, ${Math.floor(color.g <= 127.5 ? color.g + ((127.5 - color.g) / 2) : color.g)}, ${Math.floor(color.b <= 127.5 ? color.b + ((127.5 - color.b) / 2) : color.b)}, 0.5)`,
    //  Background
        ed: `rgba(${Math.floor(color.r >= 127.5 ? color.r - ((color.r - 127.5) / 2) : color.r) - 20}, ${Math.floor(color.g >= 127.5 ? color.g - ((color.g - 127.5) / 2) : color.g) - 20}, ${Math.floor(color.b >= 127.5 ? color.b - ((color.b - 127.5) / 2) : color.b) - 20}, 0.5)`,
    //  Edge Lines
        tx: `rgba(${Math.floor(color.r <= 127.5 ? color.r + ((127.5 - color.r) / 2) : color.r >= 127.5 ? color.r - ((color.r - 127.5) / 2) : color.r)}, ${Math.floor(color.g <= 127.5 ? color.g + ((127.5 - color.g) / 2) : color.g >= 127.5 ? color.g - ((color.g - 127.5) / 2) : color.g)}, ${Math.floor(color.b <= 127.5 ? color.b + ((127.5 - color.b) / 2) : color.b >= 127.5 ? color.b - ((color.b - 127.5) / 2) : color.b)}, 0.5)`,
    //  Text
        ii: `rgba(255, 255, 255, 0)`
    //  Invisible Ink
    };
  
    // Get important text sizes
    text = {};
    ctx.font = "20px calibri";
    text.un = Math.floor(ctx.measureText(username).width > 193 ? 193 : ctx.measureText(username).width < 96 ? 96 : ctx.measureText(username).width);
    // Username
    ctx.font = "15px calibri";
    text.tt = Math.floor(ctx.measureText(titles[profile.title]).width > text.un ? text.un : ctx.measureText(titles[profile.title]).width < 96 ? 96 : ctx.measureText(titles[profile.title]).width);
    // Title
      
    if (profile.lorr == "right") {
        // Draws avatar box
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.lineWidth = 2;
        ctx.moveTo(res[0] - 75, 0);
        ctx.lineTo(res[0] - 75, 75);
        ctx.lineTo(res[0] + 2, 75);
        ctx.lineTo(res[0] + 2, 0);
        ctx.stroke();
          
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.lineWidth = 2;
        ctx.moveTo(res[0] - 74, 0);
        ctx.lineTo(res[0] - 74, 74);
        ctx.lineTo(res[0] + 2, 74);
        ctx.lineTo(res[0] + 2, 0);
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(avatar, res[0] - 72, 2, 70, 70);
  
        // Username
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(res[0] - 76, 25);
        ctx.lineTo(res[0] - 81 - text.un, 25);
        ctx.lineTo(res[0] - 107 - text.un, -1);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(res[0] - 76, 24);
        ctx.lineTo(res[0] - 80.62 - text.un, 24);
        ctx.lineTo(res[0] - 105.62 - text.un, -1);
        ctx.lineTo(res[0] - 76, -1);
        ctx.fill();
        ctx.stroke();
  
        ctx.textBaseline = "hanging";
        ctx.font = "20px meiryo";
        ctx.fillStyle = colors.tx;
        ctx.fillText(profile.username, res[0] - 78 - text.un, 2, text.un);
  
        // Title
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(res[0] - 76, 42);
        ctx.lineTo(res[0] - 80 - text.tt, 42);
        ctx.lineTo(res[0] - 80 - text.tt, 26);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(res[0] - 76, 41);
        ctx.lineTo(res[0] - 79 - text.tt, 41);
        ctx.lineTo(res[0] - 79 - text.tt, 26);
        ctx.lineTo(res[0] - 76, 26);
        ctx.fill();
        ctx.stroke();
  
        ctx.textBaseline = "hanging";
        ctx.font = "15px meiryo";
        ctx.fillStyle = colors.tx;
        ctx.fillText(titles[profile.title], res[0] - 78 - text.tt, 26, text.tt);
  
        // Money
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(res[0] - 76, 59);
        ctx.lineTo(res[0] - 176, 59);
        ctx.lineTo(res[0] - 176, 43);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(res[0] - 76, 58);
        ctx.lineTo(res[0] - 175, 58);
        ctx.lineTo(res[0] - 175, 43);
        ctx.lineTo(res[0] - 76, 43);
        ctx.fill();
        ctx.stroke();
  
        ctx.fillStyle = colors.tx;
        ctx.fillText("Money:", res[0] - 174, 44, 40);
        ctx.textAlign = "end";
        mon1 = String(profile.money);
        mon2 = mon1.length % 3;
        mon3 = mon1.length < 4 ? mon1 : mon1.substring(0, mon2 > 0 ? mon2 : 3);
        mon4 = mon1.length < 4 ? '' : mon2 > 0 ? '.' + mon1.substring(mon3.length, 4) : '';
        mon5 = " K M B Tr Qu Pn".split(' ')[Math.floor((mon1.length - 1) / 3)];
        mon = mon3 + mon4 + mon5;
        ctx.fillText(mon, res[0] - 78, 44, 50);
  
        // "Game Stats:" box
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(res[0] - 150, 60);
        ctx.lineTo(res[0] - 150, 199);
        ctx.lineTo(res[0] + 2, 199);
        ctx.moveTo(res[0] - 150, 75);
        ctx.lineTo(res[0] - 76, 75);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(res[0] - 76, 74);
        ctx.lineTo(res[0] - 149, 74);
        ctx.lineTo(res[0] - 149, 60);
        ctx.lineTo(res[0] - 76, 60);
        ctx.fill();
        ctx.stroke();
  
        ctx.font = "15px meiryo";
        ctx.textAlign = "start";
        ctx.fillStyle = colors.tx;
        ctx.fillText("Game Stats:", res[0] - 147, 61, 70);
  
        // Wins and Loses
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.fillRect(252, 77, 77, 17);
        ctx.fillRect(331, 77, 33, 17);
        ctx.fillRect(366, 77, 33, 17);
        ctx.fillRect(252, 96, 77, 101);
        ctx.fillRect(331, 96, 33, 101);
        ctx.fillRect(366, 96, 33, 101);
        ctx.beginPath();
        ctx.strokeStyle = colors.bg;
        ctx.lineWidth = 1;
        ctx.rect(251.5, 76.5, 148, 121);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(res[0] - 70, 77);
        ctx.lineTo(res[0] - 70, 197);
        ctx.moveTo(res[0] - 35, 77);
        ctx.lineTo(res[0] - 35, 197);
        ctx.moveTo(res[0] - 148, 95);
        ctx.lineTo(res[0] - 1, 95);
        ctx.stroke();
  
        ctx.fillStyle = colors.tx;
        ctx.fillText("Game Name", res[0] - 148, 80, 75);
        ctx.fillText("Wins", res[0] - 68, 80, 31);
        ctx.fillText("Loses", res[0] - 33, 80, 31);
        for (let i = 0; i < 5; i++) {
            let game = ["Connect Four", "Squares", "Othello", "3D Tic Tac Toe", "Gomoku"][i];
            ctx.fillText(game, res[0] - 148, 97 + (15 * i), 75);
            ctx.fillText(profile["wins" + (i + 1)], res[0] - 68, 97 + (15 * i));
            ctx.fillText(profile["lose" + (i + 1)], res[0] - 33, 97 + (15 * i), 31);
        }
  
    } else if (profile.lorr == "left") {
        // Draws avatar box
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.lineWidth = 2;
        ctx.moveTo(75, 0);
        ctx.lineTo(75, 75);
        ctx.lineTo(-2, 75);
        ctx.lineTo(-2, 0);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(74, 0);
        ctx.lineTo(74, 74);
        ctx.lineTo(-2, 74);
        ctx.lineTo(-2, 0);
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(avatar, 2, 2, 70, 70);
  
        // Username
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(76, 25);
        ctx.lineTo(81 + text.un, 25);
        ctx.lineTo(107 + text.un, -1);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(76, 24);
        ctx.lineTo(80.62 + text.un, 24);
        ctx.lineTo(105.62 + text.un, -1);
        ctx.lineTo(76, -1);
        ctx.fill();
        ctx.stroke();
  
        ctx.textBaseline = "hanging";
        ctx.font = "20px meiryo";
        ctx.fillStyle = colors.tx;
        ctx.fillText(username, 77, 2, text.un);
  
        // Title
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(76, 42);
        ctx.lineTo(80 + text.tt, 42);
        ctx.lineTo(80 + text.tt, 26);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(76, 41);
        ctx.lineTo(79 + text.tt, 41);
        ctx.lineTo(79 + text.tt, 26);
        ctx.lineTo(76, 26);
        ctx.fill();
        ctx.stroke();
  
        ctx.font = "15px meiryo";
        ctx.fillStyle = colors.tx;
        ctx.fillText(titles[profile.title], 77, 26, text.tt);
  
        // Money
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(76, 59);
        ctx.lineTo(176, 59);
        ctx.lineTo(176, 43);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(76, 58);
        ctx.lineTo(175, 58);
        ctx.lineTo(175, 43);
        ctx.lineTo(76, 43);
        ctx.fill();
        ctx.stroke();
  
        ctx.fillStyle = colors.tx;
        ctx.fillText("Money:", 77, 44, 40);
        ctx.textAlign = "end";
        mon1 = String(profile.money);
        mon2 = mon1.length % 3;
        mon3 = mon1.length < 4 ? mon1 : mon1.substring(0, mon2 > 0 ? mon2 : 3);
        mon4 = mon1.length < 4 ? '' : mon2 > 0 ? '.' + mon1.substring(mon3.length, 4) : '';
        mon5 = " K M B Tr Qu Pn".split(' ')[Math.floor((mon1.length - 1) / 3)];
        mon = mon3 + mon4 + mon5;
        ctx.fillText(mon, 173, 44, 50);
  
        // "Game Stats:" box
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(150, 60);
        ctx.lineTo(150, 199);
        ctx.lineTo(-2, 199);
        ctx.moveTo(150, 75);
        ctx.lineTo(76, 75);
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(76, 74);
        ctx.lineTo(149, 74);
        ctx.lineTo(149, 60);
        ctx.lineTo(76, 60);
        ctx.fill();
        ctx.stroke();
  
        ctx.textAlign = "start";
        ctx.fillStyle = colors.tx;
        ctx.fillText("Game Stats:", 77, 61, 70);
  
        // Wins and Loses
        ctx.beginPath();
        ctx.strokeStyle = colors.ii;
        ctx.fillStyle = colors.bg;
        ctx.moveTo(149, 76);
        ctx.lineTo(149, 198);
        ctx.lineTo(-2, 198);
        ctx.lineTo(-2, 76);
        ctx.fill();
        ctx.stroke();
  
        ctx.beginPath();
        ctx.strokeStyle = colors.ed;
        ctx.moveTo(80, 77);
        ctx.lineTo(80, 197);
        ctx.moveTo(115, 77);
        ctx.lineTo(115, 197);
        ctx.moveTo(148, 95);
        ctx.lineTo(1, 95);
        ctx.stroke();
  
        ctx.fillStyle = colors.tx;
        ctx.fillText("Game Name", 2, 80, 75);
        ctx.fillText("Wins", 82, 80);
        ctx.fillText("Loses", 117, 80, 31);
        for (let i = 0; i < 5; i++) {
            let game = ["Connect Four", "Squares", "Othello", "3D Tic Tac Toe", "Gomoku"][i];
            ctx.fillText(game, 2, 97 + (15 * i), 75);
            ctx.fillText(profile["wins" + (i + 1)], 82, 97 + (15 * i));
            ctx.fillText(profile["lose" + (i + 1)], 117, 97 + (15 * i), 31);
        }
    }

    return canvas.toBuffer();
}