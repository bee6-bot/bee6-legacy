const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const moderationModel = require('../../models/moderationModel');

module.exports = {

    data: new SlashCommandBuilder()
        .setName(`warnings`)
        .setDescription(`View a user's warnings.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addUserOption(option => option
            .setName(`user`)
            .setDescription(`The user to view warnings for.`)
            .setRequired(true)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser(`user`);
        const warnings = await moderationModel.find({
            guildID: interaction.guild.id,
            userID: user.id,
            punishmentType: `warn`
        });

        if (warnings.length === 0) return await sendEmbed(interaction, EmbedType.ERROR, `Warnings`, `This user has no warnings.`, true);
        const warningString = warnings.map(warning => `**${warning.punishmentID}** - ${warning.punishmentReason}`).join(`\n`);
        await sendEmbed(interaction, EmbedType.INFO, `Warnings`, warningString, true);

    }
}
