import { COMPONENT, BUTTON_STYLE } from "../../index.js";
import { Color } from "../../assets/misc/color.js";
import { Games } from "../../games/Games.js";

export const command = async (interaction, message) => {
    if (!interaction)
    {
        const Game = Games.find(game => game.players.includes(message.author.id));
        if (!Game)
        {
            return;
        }

        const components = {
            type: COMPONENT.ACTION_ROW,
            components: [
                {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.RED, // Red Button
                    label: "Yes, I want to quit",
                    customId: "quit.confirm" },
                {   type: COMPONENT.BUTTON, style: BUTTON_STYLE.BLUE, // Blue Button,
                    label: "No, I do not want to quit",
                    customId: "quit.decline" } ] };
        const embed = {
            author: { name: "quit" },
            title: "Are you sure you wish to forfeit this game?",
            color: new Color("#").toInt() };

        return message.reply({ embeds: [ embed ], components: components });
    }
    else
    {
        console.log(interaction);

        // switch (interaction.customId.split('.')[1])
        // {
        //     case "confirm":
        //     {

        //     }

        //     case "decline":
        //     {
        //         return deleteMessage(interaction.message);
        //     }
        // }
    }
}