import { gameCount } from "../../index.js";
import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
import { drawText } from "../drawText/drawText.js";
import { Color } from "../misc/color.js";
import { newUIColor } from "../misc/newUIColor.js";
const games = ["OTHELLO", "SQUARES", "ROKUMOKU", "3D TIC-TAC-TOE", "CONNECT FOUR", "ORDO", "PAPER SOCCER", "LINES OF ACTION", "LATRONES", "SPIDER LINETRIS"];
const multiplier = 3;

export async function drawProfile(Side, user, profile, avatar, background, preview) {
    const aspectRatio = background.height / background.width;
    const trueWidth =
        background.height > 300 || background.width > 400 ?
        aspectRatio > 0.75 ? Math.round(aspectRatio * 300) :
        aspectRatio < 0.75 ? 400 : 400 : background.width;
    const trueHeight =
        background.height > 300 || background.width > 400 ?
        aspectRatio < 0.75 ? Math.round(aspectRatio * 400) :
        aspectRatio > 0.75 ? 300 : 300 : background.height;

    const color = preview ? newUIColor(background) : new Color(profile.color);
    const images = {
        background: background,
        top: undefined,
        topBack: undefined,
        topExtend: undefined,
        topExtendBack: undefined,
        topEnd: undefined,
        topEndBack: undefined,
        game: undefined,
        gameBack: undefined,
        bottom: undefined,
        bottomBack: undefined,
        username: undefined,
        userId: undefined,
        title: undefined,
        gameText: undefined,
        scores: undefined,
        preText: undefined,
        money: undefined,
        avatar: avatar };
    const side = Side ? 0 : 1;
    for (let asset in assets[Side ? "left" : "right"])
    {
        const Asset = assets[Side ? "left" : "right"][asset];
        const borderCanvas = new createCanvas(Asset.width, Asset.height);
        const borderContext = borderCanvas.getContext("2d");
        borderContext.drawImage(Asset, 0, 0);

        const data = borderContext.getImageData(0, 0, Asset.width, Asset.height);
        for (let i = 0; i < data.data.length; i += 4)
        {
            const val = asset.endsWith("Back") ? 223 : asset.endsWith("Text") ? 63 : 31;
            data.data[i] = Math.round(color.r - (color.r - val) / 2);
            data.data[i + 1] = Math.round(color.g - (color.g - val) / 2);
            data.data[i + 2] = Math.round(color.b - (color.b - val) / 2);
            data.data[i + 3] *= 0.8;
        }
        borderContext.putImageData(data, 0, 0);
        images[asset] = borderCanvas;
    }

    let topWidth = 0;
    for (let i = 0; i < 3; i++)
    {
        const text = [user.username, user.id, profile.title.replace(/\u200b/g, "'")][i];
        const drawnText = await drawText(text);
        const textCanvas = new createCanvas(drawnText.width, 11);
        const textContext = textCanvas.getContext("2d");
        textContext.drawImage(drawnText, 0, 0);
        const data = textContext.getImageData(0, 0, drawnText.width, 11);
        for (let x = 0; x < data.data.length; x += 4)
        {
            data.data[x] = Math.round(color.r - (color.r - 63) / 2);
            data.data[x + 1] = Math.round(color.g - (color.g - 63) / 2);
            data.data[x + 2] = Math.round(color.b - (color.b - 63) / 2);
            data.data[x + 3] *= 0.8;
        }

        if (text[0] == "j")
        {
            drawnText.width += 2;
        }
        if (drawnText.width > [134, 120, 104][i] + topWidth)
        {
            topWidth = drawnText.width - [134, 120, 104][i];
        }

        textContext.putImageData(data, 0, 0);
        images[["username", "userId", "title"][i]] = textCanvas;
    }

    images.gameText = [];
    games.forEach(async game => {
        const drawnText = await drawText(game);
        const textCanvas = new createCanvas(drawnText.width, 11);
        const textContext = textCanvas.getContext("2d");
        textContext.drawImage(drawnText, 0, 0);
        const data = textContext.getImageData(0, 0, drawnText.width, 11);
        for (let x = 0; x < data.data.length; x += 4)
        {
            data.data[x] = Math.round(color.r - (color.r - 63) / 2);
            data.data[x + 1] = Math.round(color.g - (color.g - 63) / 2);
            data.data[x + 2] = Math.round(color.b - (color.b - 63) / 2);
            data.data[x + 3] *= 0.8;
        }

        textContext.putImageData(data, 0, 0);
        images.gameText.push(textCanvas);
    });

    images.scores = [];
    for (let y = 0; y < 2 + gameCount; y++)
    {
        const score = y == gameCount ? profile.elo : y < gameCount ? profile.elos[y] : profile["money"];
        const magnitude = String(score).length - 1;
        const Score = score < 1000000 ? score : 
            String((Math.floor(score / Number(`1E${magnitude - 3}`)) * 10) / Number(`1E${4 - magnitude % 3}`)) + "MBTQ"[(magnitude / 3 | 0) - 2];

        const paddedScore = " ".repeat(6 - String(Score).length) + String(Score);
        const number = await drawText(paddedScore, true);
        const numberCanvas = new createCanvas(number.width, number.height);
        const numberContext = numberCanvas.getContext('2d');
        numberContext.drawImage(number, 0, 0);

        const data = numberContext.getImageData(0, 0, 48, 9);
        for (let i = 0; i < data.data.length; i += 4)
        {
            data.data[i] = Math.round(color.r - (color.r - 63) / 2);
            data.data[i + 1] = Math.round(color.g - (color.g - 63) / 2);
            data.data[i + 2] = Math.round(color.b - (color.b - 63) / 2);
            data.data[i + 3] *= 0.8;
        }

        numberContext.putImageData(data, 0, 0);
        images.scores.push(numberCanvas);
    }

    const drawnText = await drawText("MONEY");
    const moneyCanvas = new createCanvas(drawnText.width, 11);
    const moneyContext = moneyCanvas.getContext("2d");
    moneyContext.drawImage(drawnText, 0, 0);
    const moneyData = moneyContext.getImageData(0, 0, drawnText.width, 11);
    for (let x = 0; x < moneyData.data.length; x += 4)
    {
        moneyData.data[x] = Math.round(color.r - (color.r - 63) / 2);
        moneyData.data[x + 1] = Math.round(color.g - (color.g - 63) / 2);
        moneyData.data[x + 2] = Math.round(color.b - (color.b - 63) / 2);
        moneyData.data[x + 3] *= 0.8;
    }
    moneyContext.putImageData(moneyData, 0, 0);
    images.money = moneyCanvas;

    const overlayCanvas = new createCanvas(trueWidth, trueHeight);
    const overlayContext = overlayCanvas.getContext("2d");
    overlayContext.drawImage(images.top,           [0, trueWidth - 154][side], 0);
    overlayContext.drawImage(images.topBack,       [0, trueWidth - 154][side], 0);
    overlayContext.drawImage(images.topExtend,     [152, trueWidth - (152 + topWidth)][side], 0, topWidth, 47);
    overlayContext.drawImage(images.topExtendBack, [152, trueWidth - (152 + topWidth)][side], 0, topWidth, 47);
    overlayContext.drawImage(images.topEnd,        [152 + topWidth, trueWidth - (200 + topWidth)][side], 0);
    overlayContext.drawImage(images.topEndBack,    [152 + topWidth, trueWidth - (200 + topWidth)][side], 0);
    overlayContext.drawImage(images.game,          [0, trueWidth - 154][side], 64, 154, 11 * gameCount - 1);
    overlayContext.drawImage(images.gameBack,      [0, trueWidth - 154][side], 64, 154, 11 * gameCount - 1);
    overlayContext.drawImage(images.bottom,        [0, trueWidth - 154][side], 63 + 11 * gameCount);
    overlayContext.drawImage(images.bottomBack,    [0, trueWidth - 154][side], 63 + 11 * gameCount);
    overlayContext.drawImage(images.username,      [48, trueWidth - (48 + images.username.width)][side], 3);
    overlayContext.drawImage(images.userId,        [48, trueWidth - (48 + images.userId.width)][side], 19);
    overlayContext.drawImage(images.title,         [48, trueWidth - (48 + images.title.width)][side], 33);
    overlayContext.drawImage(images.preText,       [4, trueWidth - 150][side], 49);
    overlayContext.drawImage(images.money,         [4, trueWidth - 150][side], 68 + 11 * gameCount);
    for (let i = 0; i < gameCount; i++)
    {
        overlayContext.drawImage(images.scores[i], [103, trueWidth - 51][side], 64 + 11 * i);
    }
    overlayContext.drawImage(images.scores[gameCount],     [103, trueWidth -  51][side], 68 + 11 * gameCount);
    overlayContext.drawImage(images.scores[gameCount + 1], [50,  trueWidth - 104][side], 68 + 11 * gameCount);

    const finalWidth = multiplier * trueWidth;
    const finalHeight = multiplier * trueHeight;
    const finalCanvas = new createCanvas(finalWidth, finalHeight);
    const finalContext = finalCanvas.getContext("2d");
    finalContext.drawImage(background, 0, 0, finalWidth, finalHeight);
    finalContext.imageSmoothingEnabled = false;
    finalContext.drawImage(overlayCanvas, 0, 0, finalWidth, finalHeight);
    for (let i = 0; i < gameCount; i++)
    {
        const x1 = [4, trueWidth - 150][side] * multiplier;
        const y1 = (64 + 11 * i) * multiplier;
        const x2 = (images.gameText[i].width > 93 ? 93 : images.gameText[i].width) * multiplier;
        const y2 = images.gameText[i].height * multiplier;
        finalContext.drawImage(images.gameText[i], x1, y1, x2, y2);
    }
    finalContext.imageSmoothingEnabled = true;
    finalContext.drawImage(images.avatar, [2, trueWidth - 45][side] * multiplier, 2 * multiplier, 43 * multiplier, 43 * multiplier);
    return finalCanvas.toBuffer();
}

const assets = {
    left:
    {   top:            await loadImage("./assets/profile/left/top.png"),
        topBack:        await loadImage("./assets/profile/left/topBack.png"),
        topExtend:      await loadImage("./assets/profile/left/topExtend.png"),
        topExtendBack:  await loadImage("./assets/profile/left/topExtendBack.png"),
        topEnd:         await loadImage("./assets/profile/left/topEnd.png"),
        topEndBack:     await loadImage("./assets/profile/left/topEndBack.png"),
        game:           await loadImage("./assets/profile/left/game.png"),
        gameBack:       await loadImage("./assets/profile/left/gameBack.png"),
        bottom:         await loadImage("./assets/profile/left/bottom.png"),
        bottomBack:     await loadImage("./assets/profile/left/bottomBack.png"),
        preText:        await loadImage("./assets/profile/left/preText.png") },
    right:
    {   top:            await loadImage("./assets/profile/right/top.png"),
        topBack:        await loadImage("./assets/profile/right/topBack.png"),
        topExtend:      await loadImage("./assets/profile/right/topExtend.png"),
        topExtendBack:  await loadImage("./assets/profile/right/topExtendBack.png"),
        topEnd:         await loadImage("./assets/profile/right/topEnd.png"),
        topEndBack:     await loadImage("./assets/profile/right/topEndBack.png"),
        game:           await loadImage("./assets/profile/right/game.png"),
        gameBack:       await loadImage("./assets/profile/right/gameBack.png"),
        bottom:         await loadImage("./assets/profile/right/bottom.png"),
        bottomBack:     await loadImage("./assets/profile/right/bottomBack.png"),
        preText:        await loadImage("./assets/profile/right/preText.png") } };
