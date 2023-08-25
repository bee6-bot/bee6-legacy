const {SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const userModel = require('../../models/userModel');
const moderationModel = require('../../models/moderationModel');

module.exports = {

    data: new SlashCommandBuilder()
        .setName(`kick`)
        .setDescription(`Kick a user.`)
        .setDefaultMemberPermissions(PermissionsBitField.KickMembers)
        .addUserOption(option => option
            .setName(`user`)
            .setDescription(`The user to kick.`)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName(`reason`)
            .setDescription(`The reason for the kick.`)
            .setRequired(true)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser(`user`);
        const reason = interaction.options.getString(`reason`);

        const punishmentID = Math.random().toString(36).substring(2, 9);
        const punishment = new moderationModel({
            guildID: interaction.guild.id,
            userID: user.id,
            moderatorID: interaction.user.id,

            punishmentType: `kick`,
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
                    .setLabel(`Kicked by ${interaction.user.username}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setEmoji(`👢`)
            );

        const userDocument = await userModel.findOne({guildID: interaction.guild.id, userID: user.id});
        if (userDocument) {
            userDocument.punishments.push(punishment);
            userDocument.save();
        } else {
            const newUser = new userModel({
                guildID: interaction.guild.id,
                userID: user.id,
                punishments: [punishment]
            });
            await newUser.save();
        }

        await punishment.save();
        await user.kick(reason);
        await sendEmbed(interaction, EmbedType.Information, `User kicked`, `${user} has been kicked by ${interaction.user} for \`${reason}\`.`, buttonRow);

    }

}
