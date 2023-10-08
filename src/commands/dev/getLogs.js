const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const path = require("path");
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getlogs')
        .setDescription('Get the logs for the bot.')
        .addBooleanOption(option => option.setName('ephemeral').setDescription('Whether or not to send the logs as an ephemeral message.').setRequired(false)),
    async execute(interaction) {
        if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply('You are not the bot owner.');

        const logFiles = fs.readdirSync(path.join(__dirname, '../../logs'));
        const lastEditedLogFile = logFiles.reduce((prev, curr) => {
            const prevStat = fs.statSync(path.join(__dirname, '../../logs', prev));
            const currStat = fs.statSync(path.join(__dirname, '../../logs', curr));
            return prevStat.mtimeMs > currStat.mtimeMs ? prev : curr;
        });

        return interaction.reply({
            files: [path.join(__dirname, '../../logs', lastEditedLogFile)],
            ephemeral: interaction.options.getBoolean('ephemeral') || true
        });
    }
}