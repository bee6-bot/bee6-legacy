const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eventlisteners')
        .setDescription('Lists all event listeners'),
    async execute(interaction) {
        if (interaction.user.id !== process.env.OWNER_ID) return await interaction.reply('You do not have permission to use this command.')
        const listeners = interaction.client.eventNames()
        await interaction.reply(`Event listeners: ${listeners.join(', ')} | Took ${Date.now() - interaction.createdTimestamp}ms`)
    }
}