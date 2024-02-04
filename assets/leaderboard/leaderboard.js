"use strict";

import Canvas from 'canvas';
const { createCanvas, loadImage } = Canvas;
import { newUIColor } from "../misc/newUIColor.js";
import { drawText } from "../drawText/drawText.js";

export const drawTop = async (users, user) => {
    const backgroundIDs = "wc3NJcw rZnwTBY HQZPLug RXUcufl Q1n8x53 uYfpJKD t1D9XLq t1D9XLq OUscSSr iVUrJCR psW7uFT WWIaZcs lb1i5w2 EZ9fGKQ nQt5RNG ZfMIYm2 BREHc3Q 4OLpzfw".split(' ');
    const backgroundIndex = Math.random() * backgroundIDs.length | 0;
    const backgroundID = backgroundIDs[backgroundIndex];
    const background = await loadImage(`./assets/profile/backgrounds/${backgroundID}.png`);
    const multiplier = 3;

    const aspectRatio = background.height / background.width;
    const trueWidth =
        background.height > 300 || background.width > 400 ?
        aspectRatio > 0.75 ? Math.round(aspectRatio * 300) :
        aspectRatio < 0.75 ? 400 : 400 : background.width;
    const trueHeight =
        background.height > 300 || background.width > 400 ?
        aspectRatio < 0.75 ? Math.round(aspectRatio * 400) :
        aspectRatio > 0.75 ? 300 : 300 : background.height;

    const color = newUIColor(background);
    const userHeight = 12 * users.length;
    const images = {
        background: background,
        top: undefined,
        topBack: undefined,
        place: undefined,
        placeBack: undefined,
        topText: undefined,
        bottom: undefined,
        bottomBack: undefined,
        userCanvas: undefined,
        user: undefined,
        userBack: undefined,
        userText: undefined,
        altBottom: undefined,
        altBottomBack: undefined
    };

    for (let asset in assets)
    {
        const Asset = assets[asset];
        const borderCanvas = new createCanvas(assets[asset].width, assets[asset].height);
        const borderContext = borderCanvas.getContext('2d');
        borderContext.drawImage(Asset, 0, 0);

        const data = borderContext.getImageData(0, 0, assets[asset].width, assets[asset].height);
        for (let i = 0; i < data.data.length; i += 4)
        {
            const val = asset.endsWith("Back") ? 223 : asset.endsWith("Text") ? 63 : 31;
            data.data[i]     = Math.round(color.r - ((color.r - val) / 2));
            data.data[i + 1] = Math.round(color.g - ((color.g - val) / 2));
            data.data[i + 2] = Math.round(color.b - ((color.b - val) / 2));
            data.data[i + 3] *= 0.8;
        }
        borderContext.putImageData(data, 0, 0);
        images[asset] = borderCanvas;
    }

    const finalTexts = [];
    const usernames = [];
    for (let user of users)
    {
        const magnitude = String(user[2]).length - 1;
        const elo = user[2] < 1000000 ? user[2] :
            String((Math.floor(user[2] / Number(`1E${magnitude - 3}`)) * 10) / Number(`1E${4 - magnitude % 3}`)) + "MBTQ"[(magnitude / 3 | 0) - 2];

        const rawTexts = [ await drawText(user[1], true), await drawText(user[0].username + '#' + user[0].discriminator), await drawText(elo, true), await drawText(user[5].replace("100.00%", "100%")) ];
        const userTexts = rawTexts.map((text, index) => {
            const textCanvas = new createCanvas(text.width, 11);
            const textContext = textCanvas.getContext('2d');
            textContext.drawImage(text, 0, 0);
            const data = textContext.getImageData(0, 0, text.width, 11);
            for (let x = 0; x < data.data.length; x += 4)
            {
                data.data[x]     = Math.round(color.r - ((color.r - 63) / 2));
                data.data[x + 1] = Math.round(color.g - ((color.g - 63) / 2));
                data.data[x + 2] = Math.round(color.b - ((color.b - 63) / 2));
                data.data[x + 3] *= 0.8;
            }

            textContext.putImageData(data, 0, 0);
            if (index == 3)
            {
                return [textCanvas, user[5] == "100.00%" ? 4 : 0];
            }
            else
            {
                return textCanvas;
            }
        });

        const textCanvas = new createCanvas(241, 11);
        const textContext = textCanvas.getContext('2d');
        textContext.drawImage(userTexts[0],    0, 0);
        textContext.drawImage(userTexts[2],    138 + (8 * (6 - elo.length)), 0);
        textContext.drawImage(userTexts[3][0], 193 + (user[5] == "100.00%" ? 4 : 0), 0);
        finalTexts.push(textCanvas);

        usernames.push(userTexts[1]);
    }

    const userCanvas = new createCanvas(241, 11);
    const userContext = userCanvas.getContext('2d');
    if (user)
    {
        const magnitude = String(user[2]).length - 1;
        const elo = user[2] < 1000000 ? user[2] :
            String((Math.floor(user[2] / Number(`1E${magnitude - 3}`)) * 10) / Number(`1E${4 - magnitude % 3}`)) + "MBTQ"[(magnitude / 3 | 0) - 2];

        const rawText = [ await drawText(user[1], true), await drawText(user[0].username + '#' + user[0].discriminator), await drawText(elo, true), await drawText(user[5].replace("100.00%", "100%")) ];
        const userText = rawText.map((text, index) => {
            const textCanvas = new createCanvas(text.width, 11);
            const textContext = textCanvas.getContext('2d');
            textContext.drawImage(text, 0, 0);
            const data = textContext.getImageData(0, 0, text.width, 11);
            for (let x = 0; x < data.data.length; x += 4)
            {
                data.data[x]     = Math.round(color.r - ((color.r - 63) / 2));
                data.data[x + 1] = Math.round(color.g - ((color.g - 63) / 2));
                data.data[x + 2] = Math.round(color.b - ((color.b - 63) / 2));
                data.data[x + 3] *= 0.8;
            }

            textContext.putImageData(data, 0, 0);

            if (index == 3)
            {
                return [textCanvas, user[5] == "100.00%" ? 4 : 0];
            }
            else
            {
                return textCanvas;
            }
        });

        userContext.drawImage(userText[0],    0, 0);
        userContext.drawImage(userText[2],    138 + (8 * (6 - elo.length)), 0);
        userContext.drawImage(userText[3][0], 193 + (user[5] == "100.00%" ? 4 : 0), 0);

        usernames.push(userText[1]);
    }

    const padding = (trueWidth - 246) / 2;
    const overlayCanvas = new createCanvas(trueWidth, trueHeight);
    const overlayContext = overlayCanvas.getContext("2d");
    ["top", "topBack", "place", "placeBack", "topText"].forEach(asset => overlayContext.drawImage(images[asset], trueWidth - 245 - padding, asset.startsWith("top") ? 0 : 19, 246, asset.startsWith("top") ? 19 : userHeight));
    if (user)
    {
        overlayContext.drawImage(images.bottom, trueWidth - 245 - padding, 19 + userHeight);
        overlayContext.drawImage(images.bottomBack, trueWidth - 245 - padding, 19 + userHeight);
        overlayContext.drawImage(images.user, trueWidth - 282 - padding, 22 + userHeight);
        overlayContext.drawImage(images.userBack, trueWidth - 282 - padding, 22 + userHeight);
        overlayContext.drawImage(images.userText, trueWidth - 282 - padding, 22 + userHeight);
    }
    else
    {
        overlayContext.drawImage(images.altBottom, trueWidth - 245 - padding, 19 + userHeight);
        overlayContext.drawImage(images.altBottomBack, trueWidth - 245 - padding, 19 + userHeight);
    }

    const finalWidth = multiplier * trueWidth;
    const finalHeight = multiplier * trueHeight;
    const finalCanvas = new createCanvas(finalWidth, finalHeight);
    const finalContext = finalCanvas.getContext('2d');
    finalContext.drawImage(background, 0, 0, finalWidth, finalHeight);
    finalContext.imageSmoothingEnabled = false;
    finalContext.drawImage(overlayCanvas, 0, 0, finalWidth, finalHeight);
    finalTexts.forEach((text, index) => {
        const x1 = (trueWidth - 241 - padding) * multiplier;
        const y1 = (20 + (12 * index)) * multiplier;
        const x2 = text.width * multiplier;
        const y2 = text.height * multiplier
        finalContext.drawImage(text, x1, y1, x2, y2);
        // textContext.drawImage(userTexts[1],    29, 0, userTexts[1].width, userTexts[1].height);
        const username = usernames[index];
        finalContext.drawImage(username, x1 + (29 * multiplier), y1, (username.width > 103 ? 103 : username.width) * multiplier, username.height * multiplier);
    });
    if (user)
    {
        const x1 = (trueWidth - 241 - padding) * multiplier;
        const y1 = (25 + userHeight) * multiplier;
        const x2 = userCanvas.width * multiplier;
        const y2 = userCanvas.height * multiplier;
        finalContext.drawImage(userCanvas, x1, y1, x2, y2)
        const username = usernames[usernames.length - 1];
        finalContext.drawImage(username, x1 + (29 * multiplier), y1, (username.width > 103 ? 103 : username.width) * multiplier, username.height * multiplier)
    }
    return finalCanvas.toBuffer();
}

const assets = {
    top:            await loadImage("./assets/leaderboard/top.png"),
    place:          await loadImage("./assets/leaderboard/place.png"),
    bottom:         await loadImage("./assets/leaderboard/bottom.png"),
    user:           await loadImage("./assets/leaderboard/user.png"),
    altBottom:      await loadImage("./assets/leaderboard/altBottom.png"),
    topBack:        await loadImage("./assets/leaderboard/topBack.png"),
    placeBack:      await loadImage("./assets/leaderboard/placeBack.png"),
    bottomBack:     await loadImage("./assets/leaderboard/bottomBack.png"),
    userBack:       await loadImage("./assets/leaderboard/userBack.png"),
    altBottomBack:  await loadImage("./assets/leaderboard/altBottomBack.png"),
    topText:        await loadImage("./assets/leaderboard/topText.png"),
    userText:       await loadImage("./assets/leaderboard/userText.png") };