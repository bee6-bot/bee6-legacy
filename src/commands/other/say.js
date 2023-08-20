const {SlashCommandBuilder} = require('discord.js');
const {logMessage} = require('../../functions/utilities/loggingUtils');
logMessage(`Hello, world! From level.js`, `INFO`);


module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something.')
        .addStringOption(option => option.setName('message').setDescription('The message to say.').setRequired(true))
        .addStringOption(option => option.setName('reply').setDescription('Message ID to reply to.').setRequired(false)),

    async execute(interaction) {

        let message = interaction.options.getString('message')
        const reply = interaction.options.getString('reply')
        message = `\`USER GENERATED\` | ${message}`

        if (reply) {
            const replyMessage = await interaction.channel.messages.fetch(reply)
            await replyMessage.reply(message)
        }
        else await interaction.channel.send(message)
        return await interaction.reply({content: `Message sent!`, ephemeral: true});

    }
}
