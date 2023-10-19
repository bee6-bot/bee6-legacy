const {SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user')
        .setDefaultMemberPermissions(PermissionsBitField.KickMembers)
        .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(true)),
    category: 'Moderation',
    description: 'Kicks a user',

    async execute(interaction) {const actionData = {
            moderator: interaction.user.id,
            target: interaction.options.getUser('user'),
            reason: interaction.options.getString('reason') || 'No reason provided'
        };

        async function sendLog() {
            const buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('moderator')
                        .setLabel(`Kicked by ${interaction.user.username}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('👮')
                        .setDisabled(true)
                )

            await sendEmbed(
                interaction, EmbedType.ERROR,
                `Kicked ${actionData.target.username}`,
                `<@${actionData.target.id}> has been kicked by <@${actionData.moderator}> for ${actionData.reason}`,
                false, [buttonRow]
            );
        }

        try {
            await interaction.guild.members.ban(actionData.target, {reason: actionData.reason})
                .then(async () => { await sendLog(); })
                .catch(async (error) => { await interaction.reply({content: 'There was an error kicking this user', ephemeral: false}); });
        } catch (error) {
            await interaction.reply({content: 'There was an error kicking this user', ephemeral: false});
        }
    }
}