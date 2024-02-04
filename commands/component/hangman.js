import { readFileSync } from "fs";
import { Color } from "../../assets/misc/color.js";
import { miniGames } from "../../games/minigames.js";

export const command = (interaction) => {
    const category = ["boardgames", "movies", "tvshows", "videogames", "animemanga", "countries", "pokemon"].random();
    const word = readFileSync(`assets/hangmanWords/${category}.txt`, "utf8").toString().split('\r\n').random();
    const answer = [];
    const current = [];
    for (let i = 0; i < word.length; i++)
    {
        if (!/^[\u0300-\u036f]$/.test(word[i]))
        {
            answer.push(word[i]);
        }

        if (/^[a-z0-9]$/i.test(word[i]))
        {
            current.push(false);
        }
        else
        if (/^[\u0300-\u036f]$/.test(word[i]))
        {
            answer[i - 1] += word[i];
        }
        else
        {
            current.push(word[i]);
        }
    }

    const display = [];
    for (let i = 0; i < current.length; i++)
    {
        if (current[i] === false)
        {
            display.push("__\u200b \u200b \u200b \u200b__");
        }
        else
        if (/^[a-z0-9]$/.test(current[i]))
        {
            display.push(`__${current[i]}__`);
        }
        else
        {
            display.push(current[i]);
        }
    }

    const Category = { "boardgames": "Tabletop/Board/Card Games",  "movies": "Movies",  "tvshows": "TV Shows",  "videogames": "Video Games",  "animemanga": "Anime/Manga",  "countries": "Countries",  "pokemon": "Pokémon"}[category];
    const hangman = { attachment: "./assets/hangman/7.png", name: "hangman.png" };
    const author = { attachment: "./assets/authors/hangman.png", name: "author.png" };
    const embed = {
        author: { name: "hangman", icon_url: "attachment://author.png" },
        thumbnail: { url: "attachment://hangman.png" },
        fields: [ { name: "Guess letters and fill out the word!", value: `**${display.join("\u200b \u200b")}**\nCategory: **${Category}**${answer.some(letter => /[0-9]/.test(letter)) ? "There are numbers in this solution!" : ""}\n\nTime's up <t:${(Date.now() / 1000 | 0) + 180}:R>\n\`7\` wrong guesses left` } ],
        color: new Color("#880088").toInt() };

    const miniGame = {
        id: interaction.id,
        type: "hangman",
        channelId: interaction.channelId,
        category: Category,
        answer: answer,
        current: current,
        guesses: [],
        wrongGuessesLeft: 7,
        timer: 180, };
    miniGames.set(interaction.id, miniGame);

    return interaction.reply({ embeds: [ embed ], files: [ hangman, author ], fetchReply: true }).then((message) => miniGame.lastBotMessage = message.id);
}