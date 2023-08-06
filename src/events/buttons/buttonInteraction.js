// buttonInteraction

const { sendEmbed, EmbedType } = require("../../functions/helpers/sendEmbed");
const {ActionRowBuilder, ButtonBuilder} = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(client) {

        client.on('interactionCreate', async interaction => {

            if (!interaction.isButton()) return;
            if (interaction.customId.startsWith('leaderboard')) {

                await interaction.deferUpdate();
                const {getLeaderboard, calculateXPUntilLevel} = require('../../functions/helpers/leveling');

                let leaderboardPage = interaction.customId.split('-')[1];
                let leaderboard;

                if (interaction.customId.split('-')[0] === 'leaderboard_previous') {
                    leaderboard = await getLeaderboard(interaction.guild.id, leaderboardPage - 1);
                    leaderboardPage--;
                } else if (interaction.customId.split('-')[0] === 'leaderboard_next') {
                    leaderboard = await getLeaderboard(interaction.guild.id, leaderboardPage + 1);
                    leaderboardPage++;
                }

                let leaderboardString = ``;
                for (let i = 0; i < leaderboard.length; i++) {
                    const {userID, level, xp, totalXP} = leaderboard[i];
                    const xpNeeded = calculateXPUntilLevel(level, xp);
                    leaderboardString += `${i + 1}. **${i === 0 ? `:trophy: ` : ``}<@${userID}>** - Level ${level} (${xp} XP)\n`;
                }

                const leaderboardNavigation = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`leaderboard_previous-${leaderboardPage}`)
                            .setLabel('Previous')
                            .setDisabled(leaderboardPage === 1)
                            .setStyle(2),
                        new ButtonBuilder()
                            .setCustomId(`leaderboard_next-${leaderboardPage}`)
                            .setLabel('Next')
                            .setDisabled(leaderboard.length < 10)
                            .setStyle(2)
                    );

                await interaction.update({embeds: [await sendEmbed(interaction, EmbedType.INFO, `Leaderboard`, `${leaderboardString}`, true, [leaderboardNavigation])]});
            }
        });
    }
}

