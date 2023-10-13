import { Color } from "../../assets/misc/color.js";

export const command = (interaction) => {
    let author = { attachment: "./assets/authors/games.png", name: "author.png" };
    let embed = {
        author: { name: "games", icon_url: "attachment://author.png" },
        description: "Learn more about a specific game by clicking a link or play that game by using the command /[game]",
        fields: [
        {   name: "List of Playable Games:",
            value: [
                "[Othello (click to learn how to play)](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/othello)",
                "[Squares](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/squares)†",
                "[Rokumoku](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/rokumoku)†",
                "[3D Tic-Tac-Toe](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/ttt3d)†",
                "[Connect Four](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/connect4)",
                "[Ordo](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/ordo)",
                "[Paper Soccer](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/soccer)",
                "[Lines of Action](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/loa)",
                "[Latrones](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/latrones)",
                "[Spider Linetris](https://github.com/Xyvyrianeth/xyvybot_assets/wiki/spiderlinetris)" ].join("\n"),
            inline: false },
        {   name: "Possible Future Games:",
            value: [
                `[Go](https://en.wikipedia.org/wiki/Go_(game))` ].join("\n\n"),
            inline: false } ],
        footer: { text: "† can be played against the bot" },
        color: new Color().random().toInt() };

    return interaction.reply({ embeds: [ embed ], files: [ author ] });
}