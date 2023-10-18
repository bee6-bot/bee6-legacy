const {SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const {getModLogChannel} = require('../../functions/utilities/moderation/modlogUtils');
const guildModel = require('../../models/guildModel');
const {newCase, actionType} = require('../../functions/utilities/moderation/newCase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user')
        .setDefaultMemberPermissions(PermissionsBitField.ManageMessages)
        .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning')),

    category: 'Moderation',
    description: 'Warns a user',

    async execute(interaction) {

        const actionData = {
            moderator: interaction.user.id,
            target: interaction.options.getUser('user'),
            reason: interaction.options.getString('reason') || 'No reason provided'
        };

        // Get guild data
        const guildData = await guildModel.findOne({guildID: interaction.guild.id}); // If not found, continue, do not attempt to log
        const modLogChannel = await getModLogChannel(interaction.guild.id); // If not found, continue

        // Get the caseID and create the case in the database
        const caseID = await newCase(interaction.guild.id, {
            ...actionData,
            type: actionType.WARN
        });

        // Send the embed with buttons
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('moderator')
                    .setLabel(`Warned by ${interaction.user.username}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👮')
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('case')
                    .setLabel(`Case #${caseID}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📄')
                    .setDisabled(true)
            )

        // Respond to the interaction
        await sendEmbed(
            interaction, EmbedType.WARNING,
            `Warned ${actionData.target.username}`,
            `<@${actionData.target.id}> has been warned by <@${actionData.moderator}> for ${actionData.reason}`,
            false, [buttonRow]
        );

        // Log the action in the mod logs
        await sendEmbed(
            interaction, EmbedType.WARNING,
            `Warned ${actionData.target.username}`,
            `<@${actionData.target.id}> has been warned by <@${actionData.moderator}> for ${actionData.reason}`,
            false, [buttonRow], false, modLogChannel.normal
        );

        if (!guildData) return await sendEmbed(interaction, 'No guild data found, this event will not be logged', EmbedType.ERROR);
    }
}
