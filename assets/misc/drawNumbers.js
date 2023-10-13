import pkg from "canvas";
const { createCanvas, loadImage } = pkg;
import { drawText } from "../drawText/drawText.js";

export async function drawBoard(numbers, target, solution) {
    const unsolvedCanvas = new createCanvas(449, 149);
    const unsolvedContext = unsolvedCanvas.getContext("2d");
    unsolvedContext.imageSmoothingEnabled = false;
    unsolvedContext.drawImage(assets[numbers[0] || "blank"], 5 + (75 * 0), 80, 64, 64);
    unsolvedContext.drawImage(assets[numbers[1] || "blank"], 5 + (75 * 1), 80, 64, 64);
    unsolvedContext.drawImage(assets[numbers[2] || "blank"], 5 + (75 * 2), 80, 64, 64);
    unsolvedContext.drawImage(assets[numbers[3] || "blank"], 5 + (75 * 3), 80, 64, 64);
    unsolvedContext.drawImage(assets[numbers[4] || "blank"], 5 + (75 * 4), 80, 64, 64);
    unsolvedContext.drawImage(assets[numbers[5] || "blank"], 5 + (75 * 5), 80, 64, 64);
    if (target)
    {
        unsolvedContext.drawImage(assets[String(target)[0]], 5 + (75 * 3), 5, 64, 64);
        unsolvedContext.drawImage(assets[String(target)[1]], 5 + (75 * 4), 5, 64, 64);
        unsolvedContext.drawImage(assets[String(target)[2]], 5 + (75 * 5), 5, 64, 64);
    }
    else
    {
        unsolvedContext.drawImage(assets[0], 5 + (75 * 3), 5, 64, 64);
        unsolvedContext.drawImage(assets[0], 5 + (75 * 4), 5, 64, 64);
        unsolvedContext.drawImage(assets[0], 5 + (75 * 5), 5, 64, 64);
    }

    const targetCanvas = await drawText("Target:");
    const targetContext = targetCanvas.getContext("2d");
    const data = targetContext.getImageData(0, 0, 44, 11);
    for (let i = 0; i < data.data.length; i += 4)
    {
        data.data[i + 0] = data.data[i + 1] = data.data[i + 2] = 200;
    }
    targetContext.putImageData(data, 0, 0);
    unsolvedContext.drawImage(targetCanvas, 15, 15, 176, 44);
    unsolvedContext.fillStyle = "rgb(200, 200, 200)";
    unsolvedContext.fillRect(15, 62, 176, 3);

    if (!solution)
    {
        return unsolvedCanvas.toBuffer();
    }

    const solvedCanvas = new createCanvas(449, 233);
    const solvedContext = solvedCanvas.getContext("2d");
    solvedContext.imageSmoothingEnabled = false;

    const bestCanvas = await drawText(`Solution (${solution[0] == target ? "Exact" : "Best Possible"})`);
    const bestContext = bestCanvas.getContext("2d");
    const bestData = bestContext.getImageData(0, 0, bestCanvas.width, bestCanvas.height);
    for (let i = 0; i < bestData.data.length; i += 4)
    {
        bestData.data[i + 0] = bestData.data[i + 1] = bestData.data[i + 2] = 200;
    }
    bestContext.putImageData(bestData, 0, 0);

    const solutionCanvas1 = await drawText(solution[1].replace(/-/g, '–').replace(/\*/g, '×'));
    const solutionContext1 = solutionCanvas1.getContext("2d");
    const solutionData1 = solutionContext1.getImageData(0, 0, solutionCanvas1.width, solutionCanvas1.height);
    for (let i = 0; i < solutionData1.data.length; i += 4)
    {
        solutionData1.data[i + 0] = solutionData1.data[i + 1] = solutionData1.data[i + 2] = 200;
    }
    solutionContext1.putImageData(solutionData1, 0, 0);

    const solutionCanvas2 = new createCanvas(solutionCanvas1.width * 3, solutionCanvas1.height * 3);
    const solutionContext2 = solutionCanvas2.getContext("2d");
    solutionContext2.imageSmoothingEnabled = false;
    solutionContext2.drawImage(solutionCanvas1, 0, 0, solutionCanvas1.width * 3, solutionCanvas1.height * 3);

    solvedContext.imageSmoothingEnabled = false;
    solvedContext.drawImage(unsolvedCanvas, 0, 0);
    solvedContext.drawImage(bestCanvas, 5, 155, bestCanvas.width * 3 >= 439 ? 439 : bestCanvas.width * 3, 33);
    solvedContext.imageSmoothingEnabled = true;
    solvedContext.drawImage(solutionCanvas2, 5, 201, solutionCanvas2.width >= 439 ? 439 : solutionCanvas2.width, 33);
    solvedContext.fillStyle = "rgb(200, 200, 200)";
    solvedContext.fillRect(5, 188, bestCanvas.width * 3 >= 439 ? 439 : bestCanvas.width * 3, 3);

    return solvedCanvas.toBuffer();
}

const URL = "./assets/numbers/";
const assets = {
    0:      await loadImage(URL + "0.png"),
    1:      await loadImage(URL + "1.png"),
    2:      await loadImage(URL + "2.png"),
    3:      await loadImage(URL + "3.png"),
    4:      await loadImage(URL + "4.png"),
    5:      await loadImage(URL + "5.png"),
    6:      await loadImage(URL + "6.png"),
    7:      await loadImage(URL + "7.png"),
    8:      await loadImage(URL + "8.png"),
    9:      await loadImage(URL + "9.png"),
    10:     await loadImage(URL + "10.png"),
    25:     await loadImage(URL + "25.png"),
    50:     await loadImage(URL + "50.png"),
    75:     await loadImage(URL + "75.png"),
    100:    await loadImage(URL + "100.png"),
    blank:  await loadImage(URL + "blank.png")
};