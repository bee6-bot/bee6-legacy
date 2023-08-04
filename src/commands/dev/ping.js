const {SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/helpers/sendEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with bot latency and other stats.'),
    async execute(interaction) {

        const githubButton = new ButtonBuilder()
            .setLabel('Contribute on GitHub')
            .setStyle(5)
            .setEmoji(`<:GitHub:1136707695659978773>`)
            .setURL('https://github.com/beauthebeau/bee6')

        const inviteButton = new ButtonBuilder()
            .setLabel('Invite me to your server')
            .setStyle(5)
            .setURL('https://bee6.beauthebeau.pro/invite')

        const row = new ActionRowBuilder()
            .addComponents(githubButton, inviteButton)

        await sendEmbed(
            interaction,
            EmbedType.INFO,
            ':ping_pong: Pong!',
            `## Bot Stats\n`
            + `**Client Latency** is ${Date.now() - interaction.createdTimestamp}ms\n`
            + `**API Latency** is ${Math.round(interaction.client.ws.ping)}ms\n`
            + `**Uptime:** ${Math.floor(interaction.client.uptime / 1000 / 60 / 60)} hours, ${Math.floor(interaction.client.uptime / 1000 / 60) % 60} minutes, ${Math.floor(interaction.client.uptime / 1000) % 60} seconds\n`

            + `## Server Stats\n`
            + `**Guilds:** ${interaction.client.guilds.cache.size}\n`
            + `**Users:** ${interaction.client.users.cache.size}\n`
            + `**Channels:** ${interaction.client.channels.cache.size}\n`,
            true, [row]
        )
    }
}

