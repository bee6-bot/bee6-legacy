const {getMoney, formatMoney} = require('../../functions/helpers/money');
const {sendEmbed, EmbedType} = require('../../functions/helpers/sendEmbed');
const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance')
        .addUserOption(option => option.setName('user').setDescription('User to check the balance of').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const {cash, bank} = await getMoney(user.id, interaction.guild.id);
        await sendEmbed(
            interaction,
            EmbedType.INFO,
            `Balance`,
            `**:pound: Cash:** ${formatMoney(cash)}\n**:bank: Bank:** ${formatMoney(bank)}`,
            false
        );
    }
}