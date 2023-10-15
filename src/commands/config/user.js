const {SlashCommandBuilder} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const userModel = require('../../models/userModel');
const {writeFile} = require("fs");

module.exports = {

    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Configure user settings.')

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

        const modelKeys = Object.keys(userModel.schema.paths);
        const settings = modelKeys.map(key => ({name: key, value: key}));
        const settingsArray = settings.map(setting => setting.name);

        // Remove settings that are of type Array, and with a protected value of true
        let filteredArray = settingsArray.filter(setting => {
            const type = userModel.schema.paths[setting].instance;
            const protectedValue = userModel.schema.paths[setting].options.protected || false;
            return type !== 'Array' && !protectedValue;
        });

        filteredArray = filteredArray.filter(setting => setting.toLowerCase().includes(focusedInput.toLowerCase()));

        // Limit to 25 options
        if (filteredArray.length > 25) filteredArray.length = 25;

        await interaction.respond(
            // setting | note (if exists) | type
            filteredArray.map(setting => ({name: `${setting} ${userModel.schema.paths[setting].options.notes ? "• " + userModel.schema.paths[setting].options.notes + ' | ' : ' | '}${userModel.schema.paths[setting].instance}`, value: setting}))
        )

    },

    async execute(interaction) {

        const setting = interaction.options.getString('setting').split(' ')[0];
        let value = interaction.options.getString('value');

        const userData = await userModel.findOne({userID: interaction.user.id, guildID: interaction.guild.id});
        if (!userData) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

        // If the value is empty, send the current value and the setting's notes
        if (!value) {

            const settingType = userModel.schema.paths[setting].instance;
            const settingNotes = userModel.schema.paths[setting].options.notes || '';

            let currentValue = userData[setting];

            if (settingType === 'Array') currentValue = userData[setting].join(', ');
            if (settingType === 'Boolean') currentValue = userData[setting] ? 'true' : 'false';

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


        const settingType = userData.schema.paths[setting].instance;

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
        const oldValue = userData[setting];

        // Must be able to catch errors such as x is not a valid enum value
        try {
            userData[setting] = value;
            await userData.save();
            await sendEmbed(
                interaction, EmbedType.SUCCESS,
                `Set value of ${setting}`,
                `**Old value:** ${oldValue.toLocaleString()}`
                + `\n**New value:** ${value.toLocaleString()}`
            );
        } catch (err) {
            if (err.name === 'ValidationError') {
                return interaction.reply({
                    content: `The value must be one of the following: ${userData.schema.paths[setting].enumValues.join(', ')}`,
                    ephemeral: true
                });
            }
        }
    }
}