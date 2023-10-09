import { Color } from "../../assets/misc/color.js";

export const command = (interaction) => {
    const options = interaction.options._hoistedOptions;
    var height = options.filter(option => option.name == "height")[0]?.value || 10;
    var width = options.filter(option => option.name == "width")[0]?.value || 10;

    height = height > 20 ? 20 : height;
    width = height * width > 198 ? Math.floor(198 / height) > 16 ? 16 : Math.floor(198 / height) : width > 16 ? 16 : width;

    const bombs = options.filter(option => option.name == "bombs")[0]?.value || 0.1 * (height * width);
    const a = [];
    for (let y = 0; y < height; y++)
    {
        const b = [];
        for (let x = 0; x < width; x++)
        {
            b.push(0);
        }
        a.push(b);
    }

    const k = [];

    do
    {
        const x = Math.random() * width | 0;
        const y = Math.random() * height | 0;
        if (typeof a[y][x] == "number")
        {
            a[y][x] = "💥", k.push([y, x]);
        }
    }
    while (k.length < bombs);

    for (let b = 0; b < bombs; b++)
    {
        let y = k[b][0];
        let x = k[b][1];
        let z = [true, true, true, true, true, true, true, true];
        if (y == 0)
        {
            z[0] = z[1] = z[2] = false;
        }

        if (y == height - 1)
        {
            z[4] = z[5] = z[6] = false;
        }

        if (x == 0)
        {
            z[0] = z[7] = z[6] = false;
        }

        if (x == width - 1)
        {
            z[2] = z[3] = z[4] = false;
        }

        for (let xy = 8; xy--;)
        {
            if (z[xy])
            {
                const Y = y + [-1, -1, -1,  0,  1,  1,  1,  0][xy];
                const X = x + [-1,  0,  1,  1,  1,  0, -1, -1][xy];
                if (typeof a[Y][X] == "number")
                {
                    a[Y][X] += 1;
                }
            }
        }
    }
    for (let y = 0; y < height; y++)
    {
        for (let x = 0; x < width; x++)
        {
            if (typeof a[y][x] == "number")
            {
                a[y][x] = "0⃣ 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣".split(' ')[a[y][x]];
            }
        }
    }
    for (let y = 0; y < height; y++)
    {
        a[y] = a[y].join("||||");
        // a[y] = a[y].replace(/\|\|\|\|0⃣\|\|\|\|/g, "0⃣");
    }

    const author = { attachment: "https://raw.githubusercontent.com/Xyvyrianeth/xyvybot_assets/master/authors/minesweeper.png", name: "author.png" };
    const embed = {
        author: { name: "MineSweeper", icon_url: "attachment://author.png" },
        description: "||" + a.join("||\n||") + "||",
        fields: [
            { name: "\u200b", value: "Note that Discord will not\ndisplay all of the tiles\nfor some reason.\nI *am* putting them there,\nthey just won't show up." } ],
        footer: { text: "Height: " + height + " | Width: " + width + " | Bombs: " + bombs },
        color: new Color().random().toInt() };
    return interaction.reply({ embeds: [embed], files: [author] });
}