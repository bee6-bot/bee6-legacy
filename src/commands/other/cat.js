const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Get a random cat image'),
    async execute(interaction) {
        const response = await fetch(`https://api.thecatapi.com/v1/images/search`);
        const data = await response.json();
        await interaction.reply({content: data[0].url});
    }
}