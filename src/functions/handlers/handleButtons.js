// Unused - replaced by src/events/buttons/buttonInteraction.js

const { logMessage } = require('../helpers/logging');
logMessage(`Hello, world! From handleButtons.js`, `INFO`);

/**
 * @name handleButtons
 * @type {module}
 * @description Handle buttons
 * @param {Object} client Discord client
 */

module.exports = (client) => {

    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;

        const button = client.buttons.get(interaction.customId);
        if (!button) return interaction.reply({ content: 'Whoops! Something went wrong.', ephemeral: true });

        try {
            logMessage(`Running button ${button.name}`, `INFO`)
            await button.execute(interaction, client);
        } catch (error) {
            logMessage(`Error running button ${button.name}: ${error}`, `ERROR`)
            await interaction.reply({ content: 'Whoops! Something went wrong.', ephemeral: true });
        }
    });
}