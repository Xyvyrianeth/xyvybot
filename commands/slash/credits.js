import { Color } from "../../assets/misc/color.js";
import Package from "../../package.json" assert { type: "json" };

export const command = (interaction) => {
    let author = { attachment: "./assets/authors/credits.png", name: "author.png" };
    let embed = {
        author: { name: "Acknowledgements", icon_url: "attachment://author.png" },
        fields: [
            {   name: "Creator, Author, and Primary Tester", value: "Xyvyrianeth" },
            {   name: "Code", value: `- Powered by [Node.js (${Package.engines.node})](https://nodejs.org) and [NPM (v${Package.engines.npm})](https://npmjs.com)\n` +
                "- __Dependencies (NPMs)__:\n" +
                ` - [discord.js (v${Package.dependencies["discord.js"]})](https://discord.js.org)\n` +
                ` - [dotenv (v${Package.dependencies["dotenv"]})](https://npmjs.com/package/dotenv)\n` +
                ` - Database by [PostgreSQL](https://postgresql.org) and [pg (npm) (v${Package.dependencies["pg"]})](https://npmjs.com/package/pg)\n` +
                ` - Trivia questions provided by [Open Trivia Database](https://opentdb.com/) and their [npm](https://github.com/Elitezen/open-trivia-db-wrapper) (${Package.dependencies["open-trivia-db"]})\n` +
                ` - Many images constructed with [canvas](https://github.com/Automattic/node-canvas) (v${Package.dependencies["canvas"]})\n` },
                // ` - Replays powered by [Canvas GIF Encoder](https://github.com/bcafuk/canvas-gif-encoder) (discontinued)` },
                // ` - [Nekos.life (v${Package.dependencies["nekos.life"]})](https://nekos.life) for all the catgirls` },
            {   name: "Images", value: "All background images found via [Imgur](https://imgur.com/) posted by [user/Kizenkis](https://imgur.com/user/Kizenkis). Credit to the actual artists for each work is in progress.\n" +
                "All other assets made by Xyvyrianeth." },
            {   name: "Special Thanks", value: "To various users from [The Officially Unofficial Server for the Unofficially Official Dan-Ball Community](https://discord.gg/gYVMUrM) for all of their support, feedback, and debugging.\n" +
                "And all other users who provided feedback and testing." } ],
        color: new Color().random().toInt() };
    return interaction.reply({ embeds: [ embed ], files: [ author ] });
};