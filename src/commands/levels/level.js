const {SlashCommandBuilder} = require('discord.js');
const {logMessage} = require('../../functions/helpers/logging');
logMessage(`Hello, world! From level.js`, `INFO`);

const {getLevelData} = require('../../functions/helpers/leveling');
const {sendEmbed, EmbedType} = require('../../functions/helpers/sendEmbed');
const {drawProgressBar} = require('../../functions/helpers/draw');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Get your current level.')
        .addUserOption(option => option.setName('user').setDescription('The user to get the level of.')),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const {level, xp, xpNeeded} = await getLevelData(user.id, interaction.guild.id);

        const percentage = Math.round((xp / xpNeeded) * 100);
        const progressBar = drawProgressBar(percentage, 20);
        await sendEmbed(interaction, EmbedType.INFO, `Level`, `Level: ${level.toFixed(0)}\nXP: ${xp.toFixed(0)} / ${xpNeeded.toFixed(0)}\n${progressBar}`);
    }
}