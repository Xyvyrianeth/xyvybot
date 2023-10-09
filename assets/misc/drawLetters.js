import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
import { drawText } from "../drawText/drawText.js";

export async function drawBoard(letters) {
    const canvas = new createCanvas(675, 74);
    const context = canvas.getContext("2d");
    context.drawImage(assets[letters[0] || "blank"], 5 + (75 * 0), 5, 64, 64);
    context.drawImage(assets[letters[1] || "blank"], 5 + (75 * 1), 5, 64, 64);
    context.drawImage(assets[letters[2] || "blank"], 5 + (75 * 2), 5, 64, 64);
    context.drawImage(assets[letters[3] || "blank"], 5 + (75 * 3), 5, 64, 64);
    context.drawImage(assets[letters[4] || "blank"], 5 + (75 * 4), 5, 64, 64);
    context.drawImage(assets[letters[5] || "blank"], 5 + (75 * 5), 5, 64, 64);
    context.drawImage(assets[letters[6] || "blank"], 5 + (75 * 6), 5, 64, 64);
    context.drawImage(assets[letters[7] || "blank"], 5 + (75 * 7), 5, 64, 64);
    context.drawImage(assets[letters[8] || "blank"], 5 + (75 * 8), 5, 64, 64);
    context.drawImage(assets[letters[9] || "blank"], 5 + (75 * 9), 5, 64, 64);

    return canvas.toBuffer();
}

const URL = "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/main/letters/";
const assets = {
    a:      await loadImage(URL + "a.png"),
    b:      await loadImage(URL + "b.png"),
    c:      await loadImage(URL + "c.png"),
    d:      await loadImage(URL + "d.png"),
    e:      await loadImage(URL + "e.png"),
    f:      await loadImage(URL + "f.png"),
    g:      await loadImage(URL + "g.png"),
    h:      await loadImage(URL + "h.png"),
    i:      await loadImage(URL + "i.png"),
    j:      await loadImage(URL + "j.png"),
    k:      await loadImage(URL + "k.png"),
    l:      await loadImage(URL + "l.png"),
    m:      await loadImage(URL + "m.png"),
    n:      await loadImage(URL + "n.png"),
    o:      await loadImage(URL + "o.png"),
    p:      await loadImage(URL + "p.png"),
    q:      await loadImage(URL + "q.png"),
    r:      await loadImage(URL + "r.png"),
    s:      await loadImage(URL + "s.png"),
    t:      await loadImage(URL + "t.png"),
    u:      await loadImage(URL + "u.png"),
    v:      await loadImage(URL + "v.png"),
    w:      await loadImage(URL + "w.png"),
    x:      await loadImage(URL + "x.png"),
    y:      await loadImage(URL + "y.png"),
    z:      await loadImage(URL + "z.png"),
    blank:  await loadImage(URL + "blank.png")
};