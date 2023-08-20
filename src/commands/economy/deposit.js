const {formatMoney, setMoney, getMoney} = require('../../functions/utilities/moneyUtils');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils')
const {SlashCommandBuilder} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposit money to your bank')
        .addIntegerOption(option => option.setName('amount').setDescription('Amount to deposit').setRequired(false)),
    async execute(interaction) {


        const { cash, bank } = await getMoney(interaction.user.id, interaction.guild.id);
        const amount = interaction.options.getInteger('amount') || cash;
        if (amount > cash) return await sendEmbed(
            interaction,
            EmbedType.WARNING,
            `Deposit`,
            `You don't have enough cash to deposit that much.`,
            true
        );
        await setMoney(interaction.user.id, interaction.guild.id, cash - amount, false);
        await setMoney(interaction.user.id, interaction.guild.id, bank + amount, true);
        await sendEmbed(
            interaction,
            EmbedType.SUCCESS,
            `Deposit`,
            `You deposited ${formatMoney(amount)} to your bank.`,
            true
        );
    }
}