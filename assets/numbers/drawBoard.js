import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
import { drawText } from "../drawText/drawText.js";

export async function drawBoard(numbers, target) {
    const canvas = new createCanvas(449, 168);
    const context = canvas.getContext("2d");
    context.drawImage(assets[numbers[0] || "blank"], 5 + (75 * 0), 99, 64, 64);
    context.drawImage(assets[numbers[1] || "blank"], 5 + (75 * 1), 99, 64, 64);
    context.drawImage(assets[numbers[2] || "blank"], 5 + (75 * 2), 99, 64, 64);
    context.drawImage(assets[numbers[3] || "blank"], 5 + (75 * 3), 99, 64, 64);
    context.drawImage(assets[numbers[4] || "blank"], 5 + (75 * 4), 99, 64, 64);
    context.drawImage(assets[numbers[5] || "blank"], 5 + (75 * 5), 99, 64, 64);
    if (target)
    {
        context.drawImage(assets[String(target)[0]], 5 + (75 * 3), 5, 64, 64);
        context.drawImage(assets[String(target)[1]], 5 + (75 * 4), 5, 64, 64);
        context.drawImage(assets[String(target)[2]], 5 + (75 * 5), 5, 64, 64);
    }
    else
    {
        context.drawImage(assets[0], 5 + (75 * 3), 5, 64, 64);
        context.drawImage(assets[0], 5 + (75 * 4), 5, 64, 64);
        context.drawImage(assets[0], 5 + (75 * 5), 5, 64, 64);
    }

    const textCanvas = await drawText("Target:");
    const textContext = textCanvas.getContext("2d");
    const data = textContext.getImageData(0, 0, 44, 11);
    for (let i = 0; i < data.data.length; i += 4)
    {
        data.data[i + 0] = 200;
        data.data[i + 1] = 200;
        data.data[i + 2] = 200;
    }
    textContext.putImageData(data, 0, 0);
    context.imageSmoothingEnabled = false;
    context.drawImage(textCanvas, 5, 15, 44 * 5, 55);

    return canvas.toBuffer();
}

const assets = {
    0: await loadImage("./assets/numbers/0.png"),
    1: await loadImage("./assets/numbers/1.png"),
    2: await loadImage("./assets/numbers/2.png"),
    3: await loadImage("./assets/numbers/3.png"),
    4: await loadImage("./assets/numbers/4.png"),
    5: await loadImage("./assets/numbers/5.png"),
    6: await loadImage("./assets/numbers/6.png"),
    7: await loadImage("./assets/numbers/7.png"),
    8: await loadImage("./assets/numbers/8.png"),
    9: await loadImage("./assets/numbers/9.png"),
    10: await loadImage("./assets/numbers/10.png"),
    25: await loadImage("./assets/numbers/25.png"),
    50: await loadImage("./assets/numbers/50.png"),
    75: await loadImage("./assets/numbers/75.png"),
    100: await loadImage("./assets/numbers/100.png"),
    blank: await loadImage("./assets/numbers/blank.png")
};