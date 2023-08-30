const {SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const userModel = require('../../models/userModel');
const {writeFile} = require("fs");

module.exports = {

    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Configure user settings.')

        .addSubcommand(subcommand => subcommand
            .setName('my-data')
            .setDescription('View your data.')
        )

        .addSubcommand(subcommand => subcommand
            .setName('favourites')
            .setDescription('Set your favourite things.')
            .addStringOption(option => option
                .setName('type')
                .setDescription('The type of favourite to set.')
                .setRequired(true)
                .addChoices(
                    {name: 'Colour', value: 'favouriteColour'},
                    {name: `Animal`, value: 'favouriteAnimal'},
                    {name: `Food`, value: 'favouriteFood'},
                    {name: `Movie`, value: 'favouriteMovie'},
                    {name: `TV Show`, value: 'favouriteShow'}
                )
            )
            .addStringOption(option => option
                .setName('value')
                .setDescription('The value to set.')
                .setRequired(true)
            )
        )
        .addSubcommandGroup(group => group
            .setName('leveling')
            .setDescription('Configure leveling settings.')
            .addSubcommand(subcommand => subcommand
                .setName('level-up-messages')
                .setDescription('Enable or disable level up messages.')
                .addBooleanOption(option => option
                    .setName('enabled')
                    .setDescription('Enable or disable level up messages.')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('dm-level-up-messages')
                .setDescription('Enable or disable DM level up messages.')
                .addBooleanOption(option => option
                    .setName('enabled')
                    .setDescription('Enable or disable DM level up messages.')
                    .setRequired(true)
                )
            ),
        )
        .addSubcommandGroup(group => group
            .setName('appearance')
            .setDescription('Configure appearance settings.')
            .addSubcommand(subcommand => subcommand
                .setName('compact-mode')
                .setDescription('Enable or disable compact mode.')
                .addBooleanOption(option => option
                    .setName('enabled')
                    .setDescription('Enable or disable compact mode.')
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(group => group
            .setName('moderation')
            .setDescription('Configure moderation settings.')
            .addSubcommand(subcommand => subcommand
                .setName('dm-notifications')
                .setDescription('Enable or disable DM notifications when actioned.')
                .addBooleanOption(option => option
                    .setName('enabled')
                    .setDescription('Enable or disable DM notifications when actioned.')
                    .setRequired(true)
                )
            )
        ),

    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();
        const args = interaction.options.data;
        const userID = interaction.user.id;
        const guildID = interaction.guild.id;
        const user = await userModel.findOne({userID: userID, guildID: guildID});

        switch (subcommand) {

            case 'my-data':

                await interaction.reply({content: 'Generating your data...', ephemeral: true});

                // Create a .json file with the user's data
                const data = JSON.stringify(user, null, 2);
                const filename = `${userID}-${guildID}.json`;
                writeFile(filename, data, (err) => {
                    if (err) throw err;
                });

                // Send the file to the user
                await interaction.editReply({content: 'Here is your data:', files: [filename]});
                await interaction.followUp({
                    content: `Please note that this data is not encrypted and may contain sensitive information!`
                        + `your **last 10 messages** are hashed using bcrypt, which is also used to protect `
                        + `passwords! So, rest assured, your messages are safe with us! We don't share your data with `
                        + `any third parties, and we don't sell your data! Remember, you can delete your data at any `
                        + `time by using \`/user delete-data\`\*, and you can view our privacy policy [here](https://google.com/)\*.`
                        + `\n\n \* *This is not yet implemented.*`,
                    ephemeral: true
                });


                break;

            case 'favourites':
                const type = interaction.options.getString('type');
                const value = interaction.options.getString('value');
                user[type] = value;
                break;
            case 'level-up-messages':
                const enabled = interaction.options.getBoolean('enabled');
                user.preferences.levelUpMessages = enabled;
                break;
            case 'dm-level-up-messages':
                const dmEnabled = interaction.options.getBoolean('enabled');
                user.preferences.levelUpDMs = dmEnabled;
                break;
            case 'compact-mode':
                const compactEnabled = interaction.options.getBoolean('enabled');
                user.preferences.compactMode = compactEnabled;
                break;
            case 'dm-notifications':
                const dmNotificationsEnabled = interaction.options.getBoolean('enabled');
                user.preferences.moderationDMs = dmNotificationsEnabled;
                break;
        }

        if (subcommand !== 'my-data') {
            await user.save();
            await sendEmbed(interaction, EmbedType.INFO, 'User Configuration', `Set \`${subcommand}\``
                + `\n\`\`\`json\n${JSON.stringify(args, null, 2)}\`\`\``);
        }
    }

}