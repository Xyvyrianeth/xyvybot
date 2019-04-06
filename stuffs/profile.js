const Canvas = require('canvas');
const {Color} = require('/app/stuffs/color.js');
var titles = require('/app/stuffs/titles.json');


exports.drawProfile = function(member, profile, avatar, background) {
    let width, height;
    if (background.height > 300 || background.width > 400)
    {
        if (background.height / background.width == 0.75)
        {
            width = 400;
            height = 300;
        }
        if (background.height / background.width <  0.75)
        {
            width = 400;
            height = Math.round(background.height / background.width * 400);
        }
        if (background.height / background.width >  0.75)
        {
            width = Math.round(background.width / background.height * 300);
            height = 300;
        }
    }
    else
    {
        width = background.width;
        height = background.height;
    }
    let canvas = new Canvas.createCanvas(width, height);
    let ctx = canvas.getContext('2d');

    let color = new Color(profile.color);        
    let assets = [];
    for (let img = 0; img < 7; img++)
    {
        let w = [154, 154, 33, 33, 1, 1, 134][img];
        let h = [132, 132, 47, 47, 47, 47, 64][img]
        let image = exports.Images[["border", "borderback", "corner", "cornerback", "extend", "extendback", "preText"][img]];
        let border = new Canvas.createCanvas(w, h);
        let bdrctx = border.getContext('2d');
        bdrctx.drawImage(image, 0, 0);
        let data = bdrctx.getImageData(0, 0, w, h);
        for (let i = 0; i < data.data.length; i += 4)
        {
            if (img == 6)
            {
                data.data[i]     = Math.floor(color.r <= 127.5 ? color.r + ((127.5 - color.r) / 2) : color.r >= 127.5 ? color.r - ((color.r - 127.5) / 2) : color.r);
                data.data[i + 1] = Math.floor(color.g <= 127.5 ? color.g + ((127.5 - color.g) / 2) : color.g >= 127.5 ? color.g - ((color.g - 127.5) / 2) : color.g);
                data.data[i + 2] = Math.floor(color.b <= 127.5 ? color.b + ((127.5 - color.b) / 2) : color.b >= 127.5 ? color.b - ((color.b - 127.5) / 2) : color.b);
            }
            else
            if (img % 2 == 0)
            {
                data.data[i]     = Math.floor(color.r >= 127.5 ? color.r - ((color.r - 127.5) / 2) : color.r) - 20;
                data.data[i + 1] = Math.floor(color.g >= 127.5 ? color.g - ((color.g - 127.5) / 2) : color.g) - 20;
                data.data[i + 2] = Math.floor(color.b >= 127.5 ? color.b - ((color.b - 127.5) / 2) : color.b) - 20;
            }
            else
            {
                data.data[i]     = Math.floor(color.r <= 127.5 ? color.r + ((127.5 - color.r) / 2) : color.r);
                data.data[i + 1] = Math.floor(color.g <= 127.5 ? color.g + ((127.5 - color.g) / 2) : color.g);
                data.data[i + 2] = Math.floor(color.b <= 127.5 ? color.b + ((127.5 - color.b) / 2) : color.b);
            }
            data.data[i + 3] /= 2;
        }
        bdrctx.putImageData(data, 0, 0);
        assets.push(border);
    }

    // Text
    let h = 0;
    let texts = [];
    for (let i = 0; i < 3; i++)
    {
        text = getWidth([member.username + "#" + member.discriminator, member.id, titles[profile.title]][i]);
        let Text = new Canvas.createCanvas(text[1], 11);
        let tectx = Text.getContext('2d');
        tectx.drawImage(text[0], 0, 0);
        let data = tectx.getImageData(0, 0, text[1], 11);
        for (let x = 0; x < data.data.length; x += 4)
        {
            data.data[x]     = Math.floor(color.r <= 127.5 ? color.r + ((127.5 - color.r) / 2) : color.r >= 127.5 ? color.r - ((color.r - 127.5) / 2) : color.r)
            data.data[x + 1] = Math.floor(color.g <= 127.5 ? color.g + ((127.5 - color.g) / 2) : color.g >= 127.5 ? color.g - ((color.g - 127.5) / 2) : color.g)
            data.data[x + 2] = Math.floor(color.b <= 127.5 ? color.b + ((127.5 - color.b) / 2) : color.b >= 127.5 ? color.b - ((color.b - 127.5) / 2) : color.b)
            data.data[x + 3] /= 2;
        }
        if (texts[1] > [120, 105, 103][i] + h)
        {
            h = text[1] - [120, 105, 103][i];
        }
        tectx.putImageData(data, 0, 0);
        texts.push(Text);
    }

    ctx.drawImage(background, 0, 0, width, height);
    ctx.drawImage(assets[0], 0, 0);
    ctx.drawImage(assets[1], 0, 0);
    for (let i = 0; i < h; i++)
    {
        ctx.drawImage(assets[4], i, 0);
        ctx.drawImage(assets[5], i, 0);
    }
    ctx.drawImage(assets[2], 152 + h, 0);
    ctx.drawImage(assets[3], 152 + h, 0);
    for (let i = 0; i < 3; i++)
    {
        ctx.drawImage(texts[i], 48, 3 + (15 * i));
    }
    ctx.drawImage(assets[6], 16, 49);
    ctx.drawImage(avatar, 2, 2, 43, 43);

    return canvas.toBuffer();
}

function getWidth(text) {
    let canvasA = new Canvas.createCanvas(64, 132)
    let Alphabet = canvasA.getContext("2d")
    Alphabet.drawImage(exports.Images.alphabet, 0, 0);

    let canvasB = new Canvas.createCanvas(335, 11);
    let ctx = canvasB.getContext('2d');
    let h = 1;

    let alphabet = {
        'A': [0, 0, 7, false],
        'B': [1, 0, 7, false],
        'C': [2, 0, 7, false],
        'D': [3, 0, 7, false],
        'E': [4, 0, 7, false],
        'F': [5, 0, 7, false],
        'G': [6, 0, 7, false],
        'H': [7, 0, 7, false],
        'I': [0, 1, 4, false],
        'J': [1, 1, 7, false],
        'K': [2, 1, 7, false],
        'L': [3, 1, 7, false],
        'M': [4, 1, 8, false],
        'N': [5, 1, 8, false],
        'O': [6, 1, 7, false],
        'P': [7, 1, 7, false],
        'Q': [0, 2, 7, false],
        'R': [1, 2, 7, false],
        'S': [2, 2, 7, false],
        'T': [3, 2, 6, false],
        'U': [4, 2, 7, false],
        'V': [5, 2, 7, false],
        'W': [6, 2, 8, false],
        'X': [7, 2, 7, false],
        'Y': [0, 3, 6, false],
        'Z': [1, 3, 7, false],
        'a': [0, 4, 7, false],
        'b': [1, 4, 7, false],
        'c': [2, 4, 7, false],
        'd': [3, 4, 7, false],
        'e': [4, 4, 7, false],
        'f': [5, 4, 5, false],
        'g': [6, 4, 7, false],
        'h': [7, 4, 7, false],
        'i': [0, 5, 2, false],
        'j': [1, 5, 3, true],
        'k': [2, 5, 6, false],
        'l': [3, 5, 2, false],
        'm': [4, 5, 8, false],
        'n': [5, 5, 7, false],
        'o': [6, 5, 7, false],
        'p': [7, 5, 7, false],
        'q': [0, 6, 7, false],
        'r': [1, 6, 6, false],
        's': [2, 6, 7, false],
        't': [3, 6, 4, false],
        'u': [4, 6, 7, false],
        'v': [5, 6, 7, false],
        'w': [6, 6, 8, false],
        'x': [7, 6, 7, false],
        'y': [0, 7, 7, false],
        'z': [1, 7, 7, false],
        '0': [2, 3, 7, false],
        '1': [3, 3, 4, false],
        '2': [4, 3, 7, false],
        '3': [5, 3, 7, false],
        '4': [6, 3, 7, false],
        '5': [2, 7, 7, false],
        '6': [3, 7, 7, false],
        '7': [4, 7, 7, false],
        '8': [5, 7, 7, false],
        '9': [6, 7, 7, false],
        '—': [7, 3, 6, false],
        '–': [7, 3, 5, false],
        '-': [7, 3, 3, false],
        '_': [7, 7, 6, false],
        '!': [0, 8, 2, false],
        '?': [1, 8, 6, false],
        '.': [2, 8, 2, false],
        ',': [3, 8, 3, true],
        ':': [4, 8, 2, false],
        ';': [5, 8, 3, true],
        '/': [6, 8, 7, false],
        '\\': [7, 8,74, false],
        '(': [0, 9, 4, false],
        ')': [1, 9, 4, false],
        '[': [2, 9, 4, false],
        ']': [3, 9, 4, false],
        '{': [4, 9, 4, false],
        '}': [5, 9, 4, false],
        '|': [6, 9, 2, false],
        '~': [7, 9, 7, false],
        '+': [0, 10, 6, false],
        '×': [1, 10, 6, false],
        '@': [2, 10, 7, false],
        '#': [3, 10, 7, false],
        '$': [4, 10, 7, false],
        '%': [5, 10, 8, false],
        '^': [6, 10, 6, false],
        '&': [7, 10, 8, false],
        '*': [0, 11, 5, false],
        '÷': [1, 11, 6, false],
        '=': [2, 11, 4, false],
        '\'': [3, 11, 1, false],
        '"': [4, 11, 3, false],
        '<': [5, 11, 4, false],
        '>': [6, 11, 4, false],
        '`': [7, 11, 4, false],
    };

    for (let i = 0; i < text.length; i++) {
        let a = text.split('')[i];
        if (alphabet.hasOwnProperty(a))
        {
            let A = alphabet[a];
            let letter = Alphabet.getImageData(A[0] * 8, A[1] * 11, A[2], 11);
            if (A[3]) h -= 1;
            ctx.putImageData(letter, h, 0);
            h += A[2];
        }
    }
    return [canvasB, h];
}

exports.Images = {};
Canvas.loadImage("/app/img/profileAssets/alphabet.png").then(image => {
    exports.Images.alphabet = image;
});
Canvas.loadImage("/app/img/profileAssets/border.png").then(image => {
    exports.Images.border = image;
});
Canvas.loadImage("/app/img/profileAssets/borderback.png").then(image => {
    exports.Images.borderback = image;
});
Canvas.loadImage("/app/img/profileAssets/corner.png").then(image => {
    exports.Images.corner = image;
});
Canvas.loadImage("/app/img/profileAssets/cornerback.png").then(image => {
    exports.Images.cornerback = image;
});
Canvas.loadImage("/app/img/profileAssets/extend.png").then(image => {
    exports.Images.extend = image;
});
Canvas.loadImage("/app/img/profileAssets/extendback.png").then(image => {
    exports.Images.extendback = image;
});
Canvas.loadImage("/app/img/profileAssets/preText.png").then(image => {
    exports.Images.preText = image;
});