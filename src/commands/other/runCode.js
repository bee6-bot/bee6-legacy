const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    SlashCommandBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('run-code')
        .setDescription('Run code and get the output.')
        .addStringOption(option => option
            .setName('language')
            .setDescription('The language to run the code in.')
            .setRequired(true)
            .addChoices(
                {name: 'JavaScript', value: 'javascript'}
            )),

    async execute(interaction) {

        const language = interaction.options.getString('language');

        const modal = new ModalBuilder(interaction)
            .setCustomId(`run-code_${language}`)
            .setTitle('Run Code')

        const codeInput = new TextInputBuilder()
            .setCustomId('run-code-input')
            .setLabel(`Your ${language} code`)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)

        const actionRow = new ActionRowBuilder().addComponents(codeInput);
        modal.addComponents(actionRow);
        await interaction.showModal(modal);

    }
}