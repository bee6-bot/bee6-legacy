const { formatMoney, setMoney, getMoney } = require('../../functions/helpers/money');
const {sendEmbed, EmbedType} = require('../../functions/helpers/sendEmbed')
const {SlashCommandBuilder} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Withdraw money from your bank')
        .addIntegerOption(option => option.setName('amount').setDescription('Amount to deposit').setRequired(false)),
    async execute(interaction) {


        const { cash, bank } = await getMoney(interaction.user.id, interaction.guild.id);
        const amount = interaction.options.getInteger('amount') || bank;
        if (amount > bank) return await sendEmbed(
            interaction,
            EmbedType.WARNING,
            `Withdraw`,
            `You don't have enough cash to withdraw that much.`,
            true
        );
        await setMoney(interaction.user.id, interaction.guild.id, cash + amount, false);
        await setMoney(interaction.user.id, interaction.guild.id, bank - amount, true);
        await sendEmbed(
            interaction,
            EmbedType.SUCCESS,
            `Withdraw`,
            `You withdrew ${formatMoney(amount)} from your bank.`,
            true
        );
    }
}