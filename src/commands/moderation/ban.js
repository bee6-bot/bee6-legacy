const {SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user')
        .setDefaultMemberPermissions(PermissionsBitField.BanMembers)
        .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(true))
        .addStringOption(option => option.setName('confirm').setDescription('Type their username to confirm').setRequired(true)),
    category: 'Moderation',
    description: 'Bans a user',

    async execute(interaction) {
        const actionData = {
            moderator: interaction.user.id,
            target: interaction.options.getUser('user'),
            reason: interaction.options.getString('reason') || 'No reason provided'
        };

        if (interaction.options.getString('confirm') !== interaction.options.getUser('user').username &&
            interaction.options.getString('confirm') !== interaction.options.getUser('user').displayName) {
            return interaction.reply({
                content: 'You did not type the username correctly. Please try again. ' +
                    'You typed: ' + interaction.options.getString('confirm') + ' but I expected: ' + interaction.options.getUser('user').username
                    + ' or ' + interaction.options.getUser('user').displayName, ephemeral: false
            });
        }

        async function sendLog() {
            const buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('moderator')
                        .setLabel(`Banned by ${interaction.user.username}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('👮')
                        .setDisabled(true)
                )

            await sendEmbed(
                interaction, EmbedType.ERROR,
                `Banned ${actionData.target.username}`,
                `<@${actionData.target.id}> has been banned by <@${actionData.moderator}> for ${actionData.reason}`,
                false, [buttonRow]
            );
        }

        try {
            await interaction.guild.members.ban(actionData.target, {reason: actionData.reason})
                .then(async () => { await sendLog(); })
                .catch(async (error) => { await interaction.reply({content: 'There was an error banning this user: ' + error, ephemeral: false}); });
        } catch (error) {
            await interaction.reply({content: 'There was an error banning this user: ' + error, ephemeral: false});
        }
    }
}