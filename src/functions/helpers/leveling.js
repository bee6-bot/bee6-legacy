/**
 * @name leveling
 * @description Helper functions to add, remove and get XP/levels.
 */


// ===============================================
// 1. Imports
// ===============================================

const {logMessage} = require('../../functions/helpers/logging');
logMessage(`Hello, world! From leveling.js`, `INFO`);
const userModel = require('../../models/userModel');

// ===============================================
// 2. Variables
// ===============================================

const baseXP = [10, 25] // Random number between min max
const maxLength = 150;
const maxBonusFactor = 1;

// ===============================================
// 3. Functions
// ===============================================

/**
 * @name calculateXPUntilNextLevel
 * @description Calculate the amount of XP until the next level
 * @param {number} level Level
 * @param {number} xp XP
 * @returns {number} XP until next level
 * @throws {Error} If an error occurs while calculating XP
 */

function calculateXPUntilNextLevel(level, xp) {
    // FORMULA 5 * (lvl ^ 2) + (50 * lvl) + 100 - xp
    if (level < 0) throw new Error(`Level must be positive.`);
    if (xp < 0) throw new Error(`XP must be positive.`);
    return 5 * (level ** 2) + (50 * level) + 100 - xp;
}

/**
 * @name calculateXPUntilLevel
 * @description Calculate the amount of XP until a certain level
 * @param {number} level Level
 * @returns {number} XP until next level
 * @throws {Error} If an error occurs while calculating XP
 */

function calculateXPUntilLevel(level) {
    if (level < 0) throw new Error(`Level must be positive.`);
    return 5 * (level ^ 2) + (50 * level) + 100;
}

/**
 * @name sendLevelUpMessage
 * @description Send a level up message to a channel
 * @param {string} userData User data
 * @param {string} message Message to send
 * @returns {Promise<void>}
 */

async function sendLevelUpMessage(userData, message) {
    if (userData.preferences.levelUpMessages === true) {
        if (userData.preferences.levelUpDMs === true) await message.author.send({content: `Congratulations, <@${userData.userID}>! You leveled up to level ${userData.level}!`,})
        else await message.channel.send({content: `Congratulations, <@${userData.userID}>! You leveled up to level ${userData.level}!`,})
    }
}

/**
 * @name addXP
 * @description Add XP to a user's balance
 * @param {} userID User ID
 * @param {string} guildID Guild ID
 * @param {number} length Length of the message (capped at 100)
 * @param message
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while adding XP
 * @throws {Error} If the amount is not positive
 */

async function addXP(userID, guildID, length, message) {

    // Check if the amount is positive
    if (length < 0) throw new Error(`Amount must be positive.`);

    // Get the user
    const user = await userModel.findOne({userID, guildID});
    if (!user) throw new Error(`User does not exist.`);

    const baseXPRandom = Math.floor(Math.random() * (baseXP[1] - baseXP[0] + 1)) + baseXP[0];
    const messageLength = Math.min(length, maxLength);
    const lengthBonusFactor = Math.min(messageLength / maxLength, maxBonusFactor);
    const xpGain = baseXPRandom + (baseXPRandom * lengthBonusFactor);

    user.xp += xpGain;
    user.totalXP += xpGain;
    user.xpNeeded = calculateXPUntilNextLevel(user.level, user.xp);
    const xpNeeded = calculateXPUntilNextLevel(user.level, user.xp);

    if (xpNeeded <= 0) {
        user.xp = -xpNeeded;
        user.level += 1;
        await sendLevelUpMessage(user, message);
    }

    await user.save();
}

/**
 * @name getLevelData
 * @description Get a user's XP and level
 * @param {} userID User ID
 * @param {string} guildID Guild ID
 * @returns {Promise<{level: number, xp: number, xpNeeded: number}>}
 * @throws {Error} If an error occurs while getting XP
 * @throws {Error} If the user does not exist
 */

async function getLevelData(userID, guildID) {
    let user;
    try {
        user = await userModel.findOne({userID, guildID});
        return {
            level: user.level,
            xp: user.xp,
            xpNeeded: calculateXPUntilNextLevel(user.level, user.xp),
            xpTotal: calculateXPUntilLevel(user.level) + user.xp
        };
    } catch (err) {
        throw new Error(`Error while getting user: ${err}`);
    }
}

/**
 * @name getLeaderboard
 * @description Get the leaderboard for a guild - sorted by total XP
 */

async function getLeaderboard(guildID, limit = 10, page, ascending = false) {
    const users = await userModel.find({guildID}).sort({
        level: ascending ? 1 : -1,
        xp: ascending ? 1 : -1
    }).limit(limit).skip((page - 1) * limit);
    return users.map((user, position) => {
        return {
            position: position + 1,
            userID: user.userID,
            level: user.level,
            xp: user.xp,
            totalXP: user.totalXP,
        };
    });
}


module.exports = {addXP, getLevelData, getLeaderboard, calculateXPUntilNextLevel, calculateXPUntilLevel};