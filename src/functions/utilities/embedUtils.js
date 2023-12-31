const {logMessage} = require('./core/loggingUtils');
const userModel = require('../../models/userModel');

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
 * @param {boolean} [ephemeral=true] - Whether the embed should be ephemeral (only visible to the user who triggered the interaction).
 * @param {Array} [components=[]] - The components to add to the embed.
 * @param {boolean} [edit=false] - Whether to edit the original reply instead of sending a new one.
 * @param {string} [channelId=null] - The ID of the channel to send the embed to. If not provided, the embed will be sent to the channel where the interaction was triggered.
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while sending the embed.
 */

const {EmbedBuilder} = require("discord.js");

async function embedUtils(interaction, type, title, description, ephemeral = true, components = [], edit = false, channelId = null) {


    // Get user configs
    const user = await userModel.findOne({userID: interaction.user.id, guildID: interaction.guild.id});
    let compact = user.preferences.compactMode || false;

    // Get channel
    let channel;
    if (channelId) channel = await interaction.guild.channels.cache.get(channelId);

    try {
        let colour, emoji;

        // Determine the colour based on the type
        switch (type) {
            case 'WARNING':
                colour = '#FFA500';
                emoji = '⚠️';
                break;
            case 'ERROR':
                colour = '#FF0000';
                emoji = '❌';
                break;
            case 'SUCCESS':
                colour = '#00FF00';
                emoji = '✅';
                break;
            case 'INFO':
                colour = '#7289DA';
                emoji = 'ℹ️';
        }

        if (!compact || channel) {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(colour)
                .setTimestamp();

            // Check if components is an array
            if (components && !Array.isArray(components)) return logMessage(`Components must be an array.`, 'ERROR');

            // Reply to the interaction with the embed
            try {

                if (channel) await channel.send({embeds: [embed], ephemeral: ephemeral, components: components});
                else {
                    if (edit) await interaction.editReply({
                        embeds: [embed],
                        ephemeral: ephemeral,
                        components: components
                    });
                    else if (interaction.replied || interaction.deferred) await interaction.followUp({
                        embeds: [embed],
                        ephemeral: ephemeral,
                        components: components
                    });
                    else await interaction.reply({embeds: [embed], ephemeral: ephemeral, components: components});
                }
            } catch (err) {
                if (err.code === 10062) await interaction.editReply({embeds: [embed]});
                if (err.code === "InteractionAlreadyReplied") await interaction.editReply({embeds: [embed]});
                else return logMessage(`Error sending embed: ${err.stack}`, 'ERROR');
            }
        } else {
            await interaction.reply({
                content: `**${emoji} ${title}**\n${description}`,
                ephemeral: ephemeral,
                components: components
            });
        }

    } catch (error) {
        logMessage(`Error sending embed: ${error.stack}`, 'ERROR');
        throw error;
    }
}

module.exports = {sendEmbed: embedUtils, EmbedType};
