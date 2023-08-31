const {SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const guildModel = require('../../models/guildModel');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('guild')
        .setDescription('Configure guild settings.')
        .addSubcommandGroup(group => group
            .setName('moderation')
            .setDescription('Configure moderation settings.')
            .addSubcommand(subcommand => subcommand
                .setName('continuous-logging')
                .setDescription('A continuous stream of messages in a centralized channel.')
                .addBooleanOption(option => option
                    .setName('enabled')
                    .setDescription('Enable or disable continuous logging.')
                    .setRequired(true)
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel to send the logs to.')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('mod-log')
                .setDescription('Configure mod logs (message edits, deletes, etc.).')
                .addBooleanOption(option => option
                    .setName('enabled')
                    .setDescription('Enable or disable mod logs.')
                    .setRequired(true)
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel to send the logs to.')
                    .setRequired(true)
                )
            )
        ),

    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();
        const args = interaction.options.data;
        const guildID = interaction.guild.id;
        const guild = await guildModel.findOne({guildID: guildID});
        const enabled = interaction.options.getBoolean('enabled');
        const channel = interaction.options.getChannel('channel');

        switch (subcommand) {
            case 'continuous-logging':
                if (enabled) {
                    guild.continuousMessageLogging = true;
                    guild.continuousMessageLoggingChannelID = channel.id;
                } else {
                    guild.continuousMessageLogging = false;
                    guild.continuousMessageLoggingChannelID = '';
                }

                break;

            case 'mod-log':
                if (enabled) {
                    guild.modLog = true;
                    guild.modLogChannelID = channel.id;
                } else {
                    guild.modLog = false;
                    guild.modLogChannelID = '';
                }
        }

        await guild.save();
        await sendEmbed(interaction, EmbedType.INFO, 'Guild Configuration', `Set \`${subcommand}\``
            + `\n\`\`\`json\n${JSON.stringify(args, null, 2)}\`\`\``);

    }

}