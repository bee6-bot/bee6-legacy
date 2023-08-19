const {SlashCommandBuilder} = require('discord.js');
const {logMessage} = require('../../functions/helpers/logging');
logMessage(`Hello, world! From syncLevels.js`, `INFO`);

const UserModel = require('../../models/userModel');
const guildModel = require('../../models/guildModel');
const {calculateXPUntilNextLevel} = require('../../functions/helpers/leveling');
const {sendEmbed, EmbedType} = require('../../functions/helpers/sendEmbed');
const {checkUser} = require('../../functions/helpers/makerSurerExister');

const apiUrl = "https://mee6.xyz/api/plugins/levels/leaderboard/"
let batchSize = 10; // Number of players to process in a single batch
const syncCooldown =  86400 * 1000; // 24 hours

function calculateBatchSize(totalPlayers) {
    const baseBatchSize = 10; // Default batch size
    const batchSizeMultiplier = 0.2; // Adjust this value as needed
    return Math.floor(baseBatchSize + batchSizeMultiplier * totalPlayers);
}

async function updateUserLevelDataBatch(usersData, UserModel, calculateXPUntilNextLevel) {

    const bulkWriteOperations = usersData.map(userData => {
        return {
            updateOne: {
                filter: {userID: userData.id, guildID: userData.guild_id},
                update: {
                    level: userData.level,
                    totalXP: userData.detailed_xp[2],
                    xp: userData.detailed_xp[0],
                    xpNeeded: calculateXPUntilNextLevel(userData.level, userData.xp)
                }
            }
        }
    });

    await UserModel.bulkWrite(bulkWriteOperations);
}

async function parallelCheckUsers(usersData, guildID) {
    const promises = usersData.map(userData => checkUser(userData.id, guildID));
    await Promise.all(promises);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('synclevels')
        .setDescription('Sync your levels from MEE6 to BEE6 easily!'),

    async execute(interaction) {
        const guildID = interaction.guild.id;
        const userID = interaction.user.id;

        const guild = await guildModel.findOne({guildID});
        if (guild === null) {
            return await interaction.reply({content: `We couldn't access your leaderboard. Make sure that you `
                    + `have the MEE6 bot in your server, or contact the server owner.`, ephemeral: true});
        }
        if (guild.mee6Syncing) return await interaction.reply({content: `We're already syncing your levels!`, ephemeral: true});
        if (Date.now() - guild.lastMee6Sync < syncCooldown) return await interaction.reply({content: `You can only sync your levels once every 24 hours.`
            + ` You last synced <t:${Math.round(guild.lastMee6Sync / 1000)}:R>.`, ephemeral: true});
        guild.mee6Syncing = true;

        try {

            // Check if there is a user with ID "159985870458322944" (MEE6)
            if (!interaction.guild.members.cache.has("159985870458322944")) {
                return await interaction.editReply({content: `We couldn't access your leaderboard. Make sure that you `
                + `have the MEE6 bot in your server. Not the case? [File a bug report](https://github.com/bee6-bot/bee6)`
                + ` and we'll look into it.`, ephemeral: true});
            }

            const response = await fetch(apiUrl + guildID)
            const data = await response.json();

            if (data.status_code === "401") {
                return await interaction.editReply({content: `We couldn't access your leaderboard. Make sure that you `
                + `have enabled the "Public Leaderboard" option in your MEE6 settings, or contact the server owner.`, ephemeral: true});
            }
            else if (data.status_code !== undefined) {
                return await interaction.editReply({content: `We couldn't access your leaderboard. Make sure that you `
                + `have the MEE6 bot in your server, or contact the server owner.`, ephemeral: true});
            }

            const totalPlayers = data.players.length; let completedPlayers = 0; let startTime = Date.now();
            if (totalPlayers > 100) {
                await interaction.editReply({content: `Your server has more than 100 members in the MEE6 leaderboard. `
                + `This may take a while.`, ephemeral: true});
            }

            // Change batch size depending on the number of players using a formula
            batchSize = calculateBatchSize(totalPlayers);
            let timeApproximation = ((totalPlayers / batchSize) * 0.5).toFixed(2);

            await interaction.reply({content: `Syncing levels (0/${totalPlayers}) with a batch size of ${batchSize}...`
                + ` This may take a while. Approximate time: ${timeApproximation} seconds.`, ephemeral: true});

            for (let i = 0; i < totalPlayers; i += batchSize) {
                const batch = data.players.slice(i, i + batchSize);
                await parallelCheckUsers(batch, guildID);
                await updateUserLevelDataBatch(batch, UserModel, calculateXPUntilNextLevel);
                completedPlayers += batch.length;

                timeApproximation = ((totalPlayers - completedPlayers) / batchSize * 0.5).toFixed(2);
                await interaction.editReply({
                    content: `Syncing levels (${completedPlayers}/${totalPlayers}) with a batch size of ${batchSize}...`
                    + ` This may take a while. Approximate time: ${timeApproximation} seconds.`,
                    ephemeral: true
                });
            }

            await interaction.editReply({content: `Successfully synced levels! This took`
                + ` ${((Date.now() - startTime) / 1000).toFixed(2)} seconds, and synced ${totalPlayers} players.`, ephemeral: true});
            guild.lastMee6Sync = new Date().getTime();
            guild.mee6Syncing = false;
            await guild.save();

        } catch (error) {
            guild.mee6Syncing = false;
            logMessage(`Error syncing levels: ${error.stack}`, `ERROR`);
            await guild.save();
            await interaction.editReply({content: `An error occurred while syncing levels.`, ephemeral: true});
        }
    }
}
