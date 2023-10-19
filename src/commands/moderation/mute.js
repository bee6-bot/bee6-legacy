const {SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const {convertToMilliseconds, millisecondsToTime} = require('../../functions/utilities/timeUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user')
        .setDefaultMemberPermissions(PermissionsBitField.ModerateMembers)
        .addUserOption(option => option.setName('user').setDescription('The user to mute').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the mute').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('The duration of the mute').setRequired(true).setAutocomplete(true)),
    category: 'Moderation',
    description: 'Mutes a user',

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = ['5m', '10m', '30m', '1hr', '6hr', '1d', '7d'];
        const filteredChoices = choices.filter(choice => choice.startsWith(focusedValue));
        await interaction.respond(filteredChoices.map(choice => ({ name: choice, value: choice })));
    },

    async execute(interaction) {

        const actionData = {
            moderator: interaction.user.id,
            target: interaction.options.getUser('user'),
            memberTarget: interaction.options.getMember('user'),
            reason: interaction.options.getString('reason') || 'No reason provided',
            duration: interaction.options.getString('duration') || '1hr'
        };

        const duration = convertToMilliseconds(actionData.duration);
        async function sendLog() {

            const buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('moderator')
                        .setLabel(`Muted by ${interaction.user.username}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('👮')
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('duration')
                        .setLabel(`Duration: ${millisecondsToTime(duration)}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⏱️')
                        .setDisabled(true)
                )

            await sendEmbed(
                interaction, EmbedType.ERROR,
                `Muted ${actionData.target.username}`,
                `<@${actionData.target.id}> has been muted by <@${actionData.moderator}> for ${actionData.reason}.`,
                false, [buttonRow]
            );
        }

        try {
            await actionData.memberTarget.timeout(duration, actionData.reason)
                .then(async () => { await sendLog(); })
                .catch(async (error) => { await interaction.reply({content: 'There was an error muting this user', ephemeral: false}); });
        } catch (error) {
            await interaction.reply({content: 'There was an error muting this user', ephemeral: false});
        }
    }
}