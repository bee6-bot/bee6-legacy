const {formatMoney, setMoney, getMoney} = require('../../functions/helpers/money');
const {sendEmbed, EmbedType} = require('../../functions/helpers/sendEmbed')
const {SlashCommandBuilder} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Roll the hive dice')

        .addSubcommand(subcommand => subcommand
            .setName('dice')
            .setDescription('Roll the hive dice')
            .addIntegerOption(option => option.setName('amount').setDescription('Amount to gamble').setRequired(true))
            .addIntegerOption(option => option.setName('number').setDescription('Number to bet on').setRequired(true))
        )

        .addSubcommand(subcommand => subcommand
            .setName('coin')
            .setDescription('Flip a coin')
            .addIntegerOption(option => option.setName('amount').setDescription('Amount to gamble').setRequired(true))
            .addStringOption(option => option.setName('side').setDescription('Side to bet on').setRequired(true)
                .addChoices({ name: 'Heads', value: 'heads' }, { name: 'Tails', value: 'tails' }))
        )


        .addSubcommand(subcommand => subcommand
            .setName('races')
            .setDescription('Join the Bee Races')
            .addIntegerOption(option => option.setName('amount').setDescription('Amount to bet').setRequired(true))
            .addStringOption(option => option.setName('bee').setDescription('Bet on a bee').setRequired(true)
                .addChoices({ name: 'Speedy Bee', value: 'speedy' }, { name: 'Lucky Bee', value: 'lucky' }, { name: 'Daring Bee', value: 'daring' }))
        ),


    async execute(interaction) {
        const { cash } = await getMoney(interaction.user.id, interaction.guild.id);
        const amount = interaction.options.getInteger('amount');
        const subcommand = interaction.options.getSubcommand();

        if (amount > cash) return await sendEmbed(interaction, EmbedType.WARNING, `Bee Gamble`, `Buzz off! You don't have enough money to wager that much.`, false);


        if (subcommand === 'dice') {
            const number = interaction.options.getInteger('number');
            if (number < 1 || number > 6) {
                return await sendEmbed(interaction, EmbedType.WARNING, `Bee Gamble`, `Only bet on numbers between 1 and 6, bee-friend.`, true);
            }

            const roll = Math.floor(Math.random() * 6) + 1;
            if (number === roll) {
                await setMoney(interaction.user.id, interaction.guild.id, cash + amount, false);
                await sendEmbed(interaction, EmbedType.SUCCESS, `Bee Gamble`, `You rolled a ${roll} and collected ${formatMoney(amount)}! Your hive is buzzing with joy! 🐝🎲`, false);
            } else {
                await setMoney(interaction.user.id, interaction.guild.id, cash - amount, false);
                await sendEmbed(interaction, EmbedType.ERROR, `Bee Gamble`, `Alas! You rolled a ${roll} and lost ${formatMoney(amount)}. The winds of fortune are fickle!`, false);
            }
        }
        if (subcommand === 'coin') {
            const side = interaction.options.getString('side');
            const roll = Math.random() < 0.5 ? 'heads' : 'tails';

            if (side === roll) {
                await setMoney(interaction.user.id, interaction.guild.id, cash + amount, false);
                await sendEmbed(interaction, EmbedType.SUCCESS, `Bee Gamble`, `You flipped a coin and got ${roll}! You won ${formatMoney(amount)}, lucky bee! 🪙🐝`, false);
            } else {
                await setMoney(interaction.user.id, interaction.guild.id, cash - amount, false);
                await sendEmbed(interaction, EmbedType.ERROR, `Bee Gamble`, `Your coin landed on ${roll}. You lost ${formatMoney(amount)}. Fortunes can be fickle in the bee-world! 🪙🐝`, false);
            }
        }

    }
}