import { miniGames } from "../../games/minigames.js";

export const command = async (interaction) => {
    const miniGame = miniGames.get(interaction.message.interaction.id);
    if (!miniGame || miniGame.completed || miniGame.wrongPeople.includes(interaction.user.id))
    {
        return interaction.deferUpdate();
    }

    if (interaction.customId == "trivia.correct")
    {
        miniGame.completed = true;
        miniGame.timer = 30;

        const newComponents = interaction.message.components.map(component => {
            const button = component.toJSON();
            button.components[0].disabled = button.components[0].custom_id !== "trivia.correct";
            button.components[0].style = button.components[0].custom_id == "trivia.correct" ? 3 : 4;
            return button;
        });

        const newEmbed = interaction.message.embeds[0].toJSON();
        newEmbed.description = `${interaction.user} got it right!`;
        if (miniGame.wrongPeople.length > 0)
        {
            newEmbed.fields[1] = { name: "Wrong People", value: `<@${miniGame.wrongPeople.join("> <@")}>` };
        }
        await interaction.deferUpdate();
        return interaction.message.edit({ embeds: [ newEmbed ], components: newComponents, attachments: [] });
    }
    else
    {
        miniGame.wrongPeople.push(interaction.user.id);

        const newEmbed = interaction.message.embeds[0].toJSON();
        newEmbed.fields[1] = { name: "Wrong People", value: `<@${miniGame.wrongPeople.join("> <@")}>` };

        await interaction.deferUpdate();
        return interaction.message.edit({ embeds: [ newEmbed ], components: interaction.message.components, attachments: [] });
    }
}