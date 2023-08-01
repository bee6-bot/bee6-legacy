const { logMessage } = require('./logging');
/**
 * @name sendEmbed
 * @type module
 * @description Sends an embed to a channel using a standard format.
 */

/**
 * Enum representing the type of the embed.
 * @enum {string}
 */
const EmbedType = {
    /** Use this type when you want to display a warning message to the user. Warnings typically
     * indicate potential issues or situations that require attention but are not severe enough
     * to be considered errors. Error on user side is an example of a warning. */
    WARNING: 'WARNING',

    /** Use this type when you want to notify the user about an error or a critical issue that
     * occurred during the execution of their request or command. Errors require the user's
     * attention and may indicate that something went wrong. This is the fault of the bot. */
    ERROR: 'ERROR',

    /** Use this type when you want to provide informational messages to the user. Informational
     * messages can be used to provide additional context or details about an action or command. */
    INFO: 'INFO',

    /** Use this type when you want to inform the user that an action or command was successful.
     * Success messages provide positive feedback to the user. */
    SUCCESS: 'SUCCESS',
};


/**
 * Sends an embed in a standardized format as a reply to a user interaction.
 * @async
 * @param {Object} interaction - The interaction object representing the user's interaction with the bot (e.g., command interaction, button interaction).
 * @param {("WARNING"|"ERROR"|"INFO"|"SUCCESS")} type - The type of the embed.
 * @param {string} title - The title of the embed.
 * @param {string} description - The main content of the embed.
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while sending the embed.
 */

const {EmbedBuilder} = require("discord.js");

async function sendEmbed(interaction, type, title, description) {
    try {
        let colour;

        // Determine the colour based on the type
        switch (type) {
            case 'WARNING':
                colour = '#FFA500';
                break;
            case 'ERROR':
                colour = '#FF0000';
                break;
            case 'SUCCESS':
                colour = '#00FF00';
                break;
            case 'INFO':
                colour = '#7289DA';
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setcolor(colour)
            .setTimestamp();

        // Reply to the interaction with the embed
        try {
            await interaction.reply({embeds: [embed]});
        } catch (err) {
            if (err.code === 10062) await interaction.editReply({embeds: [embed]});
            else throw err;
        }
    } catch (error) {
        logMessage(`Error sending embed: ${error}`, 'ERROR');
        throw error;
    }
}

module.exports = {sendEmbed};
