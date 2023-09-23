const {SlashCommandBuilder} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const guildModel = require('../../models/guildModel');
const {placeholders} = require('../../functions/utilities/memberEventUtility');

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
                ))
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
                ))
        )
        .addSubcommandGroup(group => group
            .setName('member-events')
            .setDescription('Configure member event settings, such as join and leave messages.')
            .addSubcommand(subcommand => subcommand
                .setName('variables')
                .setDescription('Get a list of variables that can be used in join and leave messages.'))

            .addSubcommand(subcommand => subcommand
                .setName('join-message')
                .setDescription('Configure join messages.')
                .addBooleanOption(option => option
                    .setName('enabled')
                    .setDescription('Enable or disable join messages.')
                    .setRequired(true)
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel to send the messages to.')
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName('message')
                    .setDescription('The message to send.')
                    .setRequired(true)
                ))
            .addSubcommand(subcommand => subcommand
                .setName('leave-message')
                .setDescription('Configure leave messages.')
                .addBooleanOption(option => option
                    .setName('enabled')
                    .setDescription('Enable or disable leave messages.')
                    .setRequired(true)
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel to send the messages to.')
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName('message')
                    .setDescription('The message to send.')
                    .setRequired(true)
                ))
        ),


    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();
        const args = interaction.options.data;
        const guildID = interaction.guild.id;
        const guild = await guildModel.findOne({guildID: guildID});
        const enabled = interaction.options.getBoolean('enabled');
        const channel = interaction.options.getChannel('channel');

        console.log(subcommand)

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

                break;

            case 'join-message':
                if (enabled) {
                    guild.welcome = true;
                    guild.welcomeChannelID = channel.id;
                    guild.welcomeMessage = interaction.options.getString('message');
                } else {
                    guild.welcome = false;
                    guild.welcomeChannelID = '';
                    guild.welcomeMessage = '';
                }

                break;

            case 'leave-message':
                if (enabled) {
                    guild.leave = true;
                    guild.leaveChannelID = channel.id;
                    guild.leaveMessage = interaction.options.getString('message');
                } else {
                    guild.leave = false;
                    guild.leaveChannelID = '';
                    guild.leaveMessage = '';
                }

                break;

            case 'variables':

                const variables = Object.keys(placeholders).map(key => `\`${key}\``).join(', ');
                await sendEmbed(interaction, EmbedType.INFO,
                    'Guild Configuration', `Variables that can be used in join and leave messages:`
                    + `\n${variables}`
                    + `\n\nTo use a variable, wrap the variable name in [{variable}].`
                    + `For example, \`[{user}]\` will be replaced with <@${interaction.user.id}>.`);
                return;

            default:
                break;


        }

        await guild.save();
        await sendEmbed(interaction, EmbedType.INFO, 'Guild Configuration', `Set \`${subcommand}\``
            + `\n\`\`\`json\n${JSON.stringify(args, null, 2)}\`\`\``);

    }
}