const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const {logMessage} = require('../../functions/utilities/loggingUtils');
logMessage(`Hello, world! From leaderboard.js`, `INFO`);

const {getLeaderboard, calculateXPUntilLevel} = require('../../functions/utilities/levelUtils');
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Get the leaderboard.'),
    async execute(interaction) {

        const leaderboard = await getLeaderboard(interaction.guild.id, 10);
        let leaderboardString = ``;

        for (let i = 0; i < leaderboard.length; i++) {
            const user = await interaction.client.users.fetch(leaderboard[i].userID);
            const level = leaderboard[i].level;
            const xp = (leaderboard[i].xp + calculateXPUntilLevel(level)).toFixed(0).toLocaleString();
            // Check if the user is still in the server
            if (!interaction.guild.members.cache.has(user.id)) leaderboardString += `${i + 1}. **${i === 0 ? `:trophy: ` : ``}~~${user.username}~~** - Level ${level} (${xp} XP)\n`;
            else leaderboardString += `${i + 1}. **${i === 0 ? `:trophy: ` : ``}<@${user.id}>** - Level ${level} (${xp} XP)\n`;
        }

        const leaderboardNavigation = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('leaderboard_previous-1')
                    .setLabel('Previous')
                    .setDisabled(true)
                    .setStyle(2),
                new ButtonBuilder()
                    .setCustomId('leaderboard_next-1')
                    .setLabel('Next')
                    .setDisabled(leaderboard.length < 10)
                    .setStyle(2)
            );

        await sendEmbed(interaction, EmbedType.INFO, `Leaderboard`, `${leaderboardString}`, true, [leaderboardNavigation]);
    }
}
