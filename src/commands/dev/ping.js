const {SlashCommandBuilder, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bee6')
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

        // run git command to get branch
        const gitBranch = require('child_process').execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        const gitRemote = require('child_process').execSync('git config --get remote.origin.url').toString().trim();
        const gitRemoteMin = gitRemote.replace(/.*github.com\//, '').replace(/\.git$/, '');

        await sendEmbed(
            interaction,
            EmbedType.INFO,
            ':ping_pong: Pong!',
            `## Bot Stats\n`
            + `**Client Latency** is ${Date.now() - interaction.createdTimestamp}ms\n`
            + `**API Latency** is ${Math.round(interaction.client.ws.ping)}ms\n`
            + `**Uptime:** ${Math.floor(interaction.client.uptime / 1000 / 60 / 60)} hours, ${Math.floor(interaction.client.uptime / 1000 / 60) % 60} minutes, ${Math.floor(interaction.client.uptime / 1000) % 60} seconds\n`

            + `## Bot Features\n`
            + `**Fluent AI:** ${process.env.FLUENT_AI === 'true' ? 'Yes' : 'No'}\n`
            + `**AI Enabled:** ${process.env.AI_ENABLED === 'true' ? 'Yes' : 'No'}\n`

            + `## Bot Version\n`
            + `**Branch:** ${gitBranch}\n`
            + `**Remote:** [${gitRemoteMin}](${gitRemote})\n`
            + `**Last Commit:** \`${require('child_process').execSync('git rev-parse HEAD').toString().trim()} ${require('child_process').execSync('git log -1 --pretty=%B').toString().trim()}\`\n`

            + `## Server Stats\n`
            + `**Guilds:** ${interaction.client.guilds.cache.size}\n`
            + `**Users:** ${interaction.client.users.cache.size}\n`
            + `**Channels:** ${interaction.client.channels.cache.size}\n`,
            false, [row]
        )
    }
}


