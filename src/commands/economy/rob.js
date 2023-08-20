const {formatMoney, setMoney, getMoney} = require('../../functions/utilities/moneyUtils');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils')
const {SlashCommandBuilder} = require('discord.js');
const {getCooldown, setCooldown} = require('../../functions/utilities/cooldownManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Rob a user')
        .addUserOption(option => option.setName('user').setDescription('User to rob').setRequired(true)),
    async execute(interaction) {

        const cooldown = await getCooldown(interaction.user.id, interaction.guild.id, 'rob');
        if (cooldown !== false) return await sendEmbed(interaction, EmbedType.ERROR, 'Rob', `You can rob again <t:${Math.floor(cooldown / 1000)}:R>`, false);
        if (await setCooldown(interaction.user.id, interaction.guild.id, 'rob') === false) return await sendEmbed(interaction, EmbedType.ERROR, 'Rob', 'An error occurred while setting your cooldown.', false);

        await interaction.deferReply()
        const {cash} = await getMoney(interaction.user.id, interaction.guild.id);
        const {cash: targetCash} = await getMoney(interaction.options.getUser('user').id, interaction.guild.id);

        try {
            const chance = Math.floor(Math.random() * 100);
            if (chance < 0) return await sendEmbed(
                interaction,
                EmbedType.ERROR,
                `Rob`, `You were caught and fined ${formatMoney(cash * 0.1)}!`,
                false
            );
        } catch (e) {
            console.log(e);
            await interaction.editReply('Whoops! Something went wrong.');
        }


        let amount;
        try {
            amount = Math.floor(Math.random() * (targetCash / 2));
            await setMoney(interaction.user.id, interaction.guild.id, cash + amount, false);
            await setMoney(interaction.options.getUser('user').id, interaction.guild.id, targetCash - amount, false);
        } catch (e) {
            console.log(e);
            await interaction.editReply('Whoops! Something went wrong.');
        }


        try {
            await sendEmbed(
                interaction, EmbedType.SUCCESS,
                `Rob`, `You robbed ${interaction.options.getUser('user').username} and got away with ${formatMoney(amount)}!`,
                false
            );
        } catch (e) {
            console.log(e);
            await interaction.editReply('Whoops! Something went wrong.');
        }

    }
}