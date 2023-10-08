const Guild = require('../../models/guildModel');
const {logMessage} = require("./core/loggingUtils");
const {workCooldowns, robCooldowns, gambleCooldowns} = { workCooldowns: {}, robCooldowns: {}, gambleCooldowns: {} }


/**
 * @function getCooldown
 * @description Gets the cooldown for a user in a guild for a specific type.
 * @param {string} userId - The user ID.
 * @param {string} guildId - The guild ID.
 * @param {string} type - The type of cooldown ('work', 'rob', or 'gamble').
 * @returns {Promise<number|boolean>} - The cooldown time in milliseconds, or `false` if no cooldown exists.
 */
const getCooldown = async (userId, guildId, type) => {
    const cooldowns = {work: workCooldowns, rob: robCooldowns, gamble: gambleCooldowns};
    if (cooldowns[type] && cooldowns[type][guildId] && cooldowns[type][guildId][userId] && cooldowns[type][guildId][userId].cooldown < Date.now()) {
        delete cooldowns[type][guildId][userId];
        return Promise.resolve(false);
    }
    if (!cooldowns[type] || !cooldowns[type][guildId] || !cooldowns[type][guildId][userId]) return Promise.resolve(false);
    return Promise.resolve(cooldowns[type][guildId][userId].cooldown);
}

/**
 * @function setCooldown
 * @description Sets the cooldown for a user in a guild for a specific type.
 * @param {string} userId - The user ID.
 * @param {string} guildId - The guild ID.
 * @param {string} type - The type of cooldown ('work', 'rob', or 'gamble').
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the cooldown is successfully set, or `false` otherwise.
 * @throws Will throw an error if an error occurs during the process.
 */
const setCooldown = async (userId, guildId, type) => {
    const cooldowns = {work: workCooldowns, rob: robCooldowns, gamble: gambleCooldowns};
    try {
        if (!cooldowns[type]) return false;
        if (!cooldowns[type][guildId]) cooldowns[type][guildId] = {};
        if (!cooldowns[type][guildId][userId]) cooldowns[type][guildId][userId] = {};
        cooldowns[type][guildId][userId].cooldown = Date.now() + (await Guild.findOne({guildID: guildId})).get(`${type}Cooldown`);
        return Promise.resolve(true);
    } catch (e) {
        logMessage("ERROR", e);
        throw e;
    }
}

module.exports = {getCooldown, setCooldown};

