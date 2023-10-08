const {SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const userModel = require('../../models/userModel');
const moderationModel = require('../../models/moderationModel');

module.exports = {

    data: new SlashCommandBuilder()
        .setName(`ban`)
        .setDescription(`Ban a user.`)
        .setDefaultMemberPermissions(PermissionsBitField.BanMembers)
        .addUserOption(option => option
            .setName(`user`)
            .setDescription(`The user to ban.`)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName(`reason`)
            .setDescription(`The reason for the ban.`)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName(`confirm`)
            .setDescription('Type the user\'s name to confirm.')
            .setRequired(true)
        )
        .addBooleanOption(option => option
            .setName(`dryrun`)
            .setDescription(`Don't actually ban the user.`)
            .setRequired(false)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser(`user`);
        const reason = interaction.options.getString(`reason`);
        const confirm = interaction.options.getString(`confirm`);
        const dryrun = interaction.options.getBoolean(`dryrun`);

        if (confirm !== `${user.username}`) {
            return sendEmbed(interaction, EmbedType.ERROR, `Missing required argument: \`confirm\`.`, `You must type the user's name (${user.username}) to confirm the ban.`);
        }

        const punishmentID = Math.random().toString(36).substring(2, 9);
        const punishment = new moderationModel({
            guildID: interaction.guild.id,
            userID: user.id,
            moderatorID: interaction.user.id,

            punishmentType: `ban`,
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
                    .setLabel(`Banned by ${interaction.user.displayName}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setEmoji(`🔨`)
            );

        const userDocument = await userModel.findOne({guildID: interaction.guild.id, userID: user.id});
        if (userDocument) {
            userDocument.bans.push(punishment);
            userDocument.save();
        } else {
            const newUser = new userModel({
                guildID: interaction.guild.id,
                userID: user.id,
                bans: [punishment]
            });
            await newUser.save();
        }

        await punishment.save();

        if (dryrun === true) return sendEmbed(interaction, EmbedType.SUCCESS, `Dryrun successful.`, buttonRow);
        await interaction.guild.members.ban(user, {reason: reason});
        return sendEmbed(interaction, EmbedType.SUCCESS, `Successfully banned ${user.displayName}.`, buttonRow);

    }
}
