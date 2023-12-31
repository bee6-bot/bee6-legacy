const {SlashCommandBuilder} = require('discord.js');
const {logMessage} = require('../../functions/utilities/core/loggingUtils');
logMessage(`Hello, world! From level.js`, `INFO`);

const {getLevelData} = require('../../functions/utilities/levelUtils');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');
const {drawProgressBar} = require('../../functions/utilities/draw');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Get your current level.')
        .addUserOption(option => option.setName('user').setDescription('The user to get the level of.')),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const {level, xp, xpNeeded, xpTotal} = await getLevelData(user.id, interaction.guild.id);

        const percentage = Math.floor((xp / (xpNeeded + xp)) * 100);
        const progressBar = drawProgressBar(percentage, 20);
        await sendEmbed(interaction, EmbedType.INFO, `${user.displayName}'s Level`, `Level: ${level.toFixed(0)}\nXP: ${xp.toFixed(0)} / ${xpTotal.toFixed(0)}\n${progressBar}`);
    }
}