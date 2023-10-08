const {SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const userModel = require('../../models/userModel');
const moderationModel = require('../../models/moderationModel');

module.exports = {

    data: new SlashCommandBuilder()
        .setName(`warn`)
        .setDescription(`Warn a user.`)
        .setDefaultMemberPermissions(PermissionsBitField.ManageMessages)
        .addUserOption(option => option
            .setName(`user`)
            .setDescription(`The user to warn.`)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName(`reason`)
            .setDescription(`The reason for the warning.`)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName(`evidence`)
            .setDescription(`Relevant message links.`)
            .setRequired(false)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser(`user`);
        const reason = interaction.options.getString(`reason`);

        const punishmentID = Math.random().toString(36).substring(2, 9);
        const punishment = new moderationModel({
            guildID: interaction.guild.id,
            userID: user.id,
            moderatorID: interaction.user.id,

            punishmentType: `warn`,
            punishmentID: punishmentID,
            punishmentReason: reason,
            punishmentDate: Date.now(),
            punishmentDuration: `N/A`,
            punishmentActive: true
        });

        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`e`)
                    .setLabel(`Warned by ${interaction.user.displayName}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setEmoji(`�`),
                new ButtonBuilder()
                    .setCustomId(`warn:${punishmentID}:revoke`)
                    .setLabel(`Revoke`)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(`⚠️`)
            );

        const User = await userModel.findOne({guildID: interaction.guild.id, userID: user.id});
        User.warnings.push(punishmentID);

        await punishment.save();
        await User.save();
        await sendEmbed(interaction, EmbedType.SUCCESS,
            `Warned ${user.displayName}`, `\`ID: ${punishmentID}\` | **Warned for:** ${reason}`, false, [buttonRow]);


    }
};
