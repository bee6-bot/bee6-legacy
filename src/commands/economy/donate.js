const {formatMoney, setMoney, getMoney} = require('../../functions/helpers/money');
const {sendEmbed, EmbedType} = require('../../functions/helpers/sendEmbed')
const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('Donate your hard-earned money to another user')
        .addUserOption(option => option.setName('user').setDescription('User to donate to').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Amount to donate').setRequired(true)),
    async execute(interaction) {
        const {cash} = await getMoney(interaction.user.id, interaction.guild.id);
        const {cash: targetCash} = await getMoney(interaction.options.getUser('user').id, interaction.guild.id);
        const amount = interaction.options.getInteger('amount');
        if (amount > cash) return await sendEmbed(interaction, EmbedType.WARNING, `Bee Donate`, `Buzz off! You don't have enough money to donate that much.`, false);
        await setMoney(interaction.user.id, interaction.guild.id, cash - amount, false);
        await setMoney(interaction.options.getUser('user').id, interaction.guild.id, targetCash + amount, false);
        await sendEmbed(interaction, EmbedType.SUCCESS, `Bee Donate`, `You donated ${formatMoney(amount)} to ${interaction.options.getUser('user').username}!`, false);
    }
}