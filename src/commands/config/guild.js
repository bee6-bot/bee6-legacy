const {SlashCommandBuilder} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const guildModel = require('../../models/guildModel');
const {placeholders} = require('../../functions/utilities/memberEventUtility');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('guild')
        .setDescription('Configure guild settings.')

        .addStringOption(option => option
            .setName('setting')
            .setDescription('The setting to configure.')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption(option => option
            .setName('value')
            .setDescription('The value to set the setting to.')
            .setRequired(false)
        ),

    async autocomplete(interaction) {

        const focusedInput = interaction.options.getFocused();

        const modelKeys = Object.keys(guildModel.schema.paths);
        const settings = modelKeys.map(key => ({name: key, value: key}));
        const settingsArray = settings.map(setting => setting.name);

        // Remove settings that are of type Array, and with a protected value of true
        let filteredArray = settingsArray.filter(setting => {
            const type = guildModel.schema.paths[setting].instance;
            const protectedValue = guildModel.schema.paths[setting].options.protected || false;
            return type !== 'Array' && !protectedValue;
        });

        filteredArray = filteredArray.filter(setting => setting.toLowerCase().includes(focusedInput.toLowerCase()));

        // Limit to 25 options
        if (filteredArray.length > 25) filteredArray.length = 25;

        await interaction.respond(
            // setting | note (if exists) | type
            filteredArray.map(setting => ({name: `${setting} ${guildModel.schema.paths[setting].options.notes ? "• " + guildModel.schema.paths[setting].options.notes + ' | ' : ''}${guildModel.schema.paths[setting].instance}`, value: setting}))
        )
    },

    async execute(interaction) {

        const setting = interaction.options.getString('setting').split(' ')[0];
        let value = interaction.options.getString('value');

        const guildData = await guildModel.findOne({guildID: interaction.guild.id});
        if (!guildData) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

        // If the value is empty, send the current value and the setting's notes
        if (!value) {

            const settingType = guildModel.schema.paths[setting].instance;
            const settingNotes = guildModel.schema.paths[setting].options.notes || '';

            let currentValue = guildData[setting];

            if (settingType === 'Array') currentValue = guildData[setting].join(', ');
            if (settingType === 'Boolean') currentValue = guildData[setting] ? 'true' : 'false';

            // Only show the notes if they exist
            let notes = '';
            if (settingNotes) notes = `\n\n**Notes:** ${settingNotes}`;

            return await sendEmbed(
                interaction, EmbedType.INFO,
                `Current value of ${setting}`,
                `**Current Value:** ${currentValue}\n`
                + `${notes ? notes + '\n' : ''}`
                + `**Type:** ${settingType}`
            );
        }

        const settingType = guildModel.schema.paths[setting].instance;

        // Check if the setting's value is in the correct data type
        if (settingType === 'Number') {
            if (isNaN(value)) return interaction.reply({content: 'The value must be a number.', ephemeral: true});
            value = parseInt(value);
        }
        if (settingType === 'Boolean') {
            value = value.toLowerCase();
            if (value !== 'true' && value !== 'false') return interaction.reply({
                content: 'The value must be true or false.',
                ephemeral: true
            });
        }

        // Save the new value to the database
        const oldValue = guildData[setting];

        // Must be able to catch errors such as x is not a valid enum value
        try {
            guildData[setting] = value;
            await guildData.save();
            await sendEmbed(
                interaction, EmbedType.SUCCESS,
                `Set value of ${setting}`,
                `**Old value:** ${oldValue.toLocaleString()}`
                + `\n**New value:** ${value.toLocaleString()}`
            );
        } catch (err) {
            if (err.name === 'ValidationError') {
                return interaction.reply({
                    content: `The value must be one of the following: ${guildModel.schema.paths[setting].enumValues.join(', ')}`,
                    ephemeral: true
                });
            }
        }
    }
}