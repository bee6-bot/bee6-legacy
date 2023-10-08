const {SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const userModel = require('../../models/userModel');
const moderationModel = require('../../models/moderationModel');
const {checkUser} = require("../../functions/utilities/makerSurerExister");

module.exports = {

    data: new SlashCommandBuilder()
        .setName(`mute`)
        .setDescription(`Mute a user.`)
        .setDefaultMemberPermissions(PermissionsBitField.ModerateMembers)
        .addUserOption(option => option
            .setName(`user`)
            .setDescription(`The user to mute.`)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName(`reason`)
            .setDescription(`The reason for the mute.`)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName(`duration`)
            .setDescription(`The duration of the mute.`)
            .setRequired(true)
            .addChoices(
                {name: '60 seconds', value: '60'},
                {name: '5 minutes', value: '300'},
                {name: '10 minutes', value: '600'},
                {name: '1 hour', value: '3600'},
                {name: '1 day', value: '86400'},
                {name: '1 week', value: '604800'},
                {name: 'remove', value: '0'}
            )),

    async execute(interaction) {

        const user = interaction.options.getMember(`user`);
        const reason = interaction.options.getString(`reason`);
        let duration = interaction.options.getString(`duration`);

        if (!duration === '0') duration *= 1000;

        const punishmentID = Math.random().toString(36).substring(2, 9);
        const punishment = new moderationModel({
            guildID: interaction.guild.id,
            userID: user.id,
            moderatorID: interaction.user.id,

            punishmentType: `${duration === null ? `unmute` : `mute`}`,
            punishmentID: punishmentID,
            punishmentReason: reason,
            punishmentDate: Date.now(),
            punishmentDuration: `${duration === null ? `N/A` : duration}`,
            punishmentActive: true
        });

        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`e`)
                    .setLabel(`Muted by ${interaction.user.displayName}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setEmoji(`🔇`),
                new ButtonBuilder()
                    .setCustomId(`mute:${punishmentID}:revoke`)
                    .setLabel(`Revoke`)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(`🔇`)
            );

        await checkUser(interaction.guild.id, user.id);
        const userDocument = await userModel.findOne({guildID: interaction.guild.id, userID: user.id});
        if (userDocument) {
            userDocument.mutes.push(punishment);
            userDocument.save();
        } else {
            const newUser = new userModel({
                guildID: interaction.guild.id,
                userID: user.id,
                mutes: [punishment]
            });
            await newUser.save();
        }

        await punishment.save();
        await user.timeout(parseInt(duration), reason);
        await sendEmbed(interaction, EmbedType.SUCCESS,
            `${duration === '0' ? `Unmuted` : `Muted`} ${user.user.displayName}`, `\`ID: ${punishmentID}\` | **${duration === '0' ? `Unmuted` : `Muted`} for:** ${reason}`, false, [buttonRow]);


    }

}