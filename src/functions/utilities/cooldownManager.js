const Guild = require('../../models/guildModel');
const {logMessage} = require("./core/loggingUtils");
const {workCooldowns, robCooldowns, gambleCooldowns} = { workCooldowns: {}, robCooldowns: {}, gambleCooldowns: {} }

/**
 * @name getCooldown
 * @description Get the cooldown for a user in a guild for a specific type
 * @param userId
 * @param guildId
 * @param type
 * @returns {Promise<*|boolean>}
 */
const getCooldown = async (userId, guildId, type) => {
    const cooldowns = {work: workCooldowns, rob: robCooldowns, gamble: gambleCooldowns};
    if (!cooldowns[type]) return false;
    if (!cooldowns[type][guildId]) return false;
    if (!cooldowns[type][guildId][userId]) return false;
    return Promise.resolve(cooldowns[type][guildId][userId].cooldown);
}

/**
 * @name setCooldown
 * @description Set the cooldown for a user in a guild for a specific type
 * @param userId
 * @param guildId
 * @param type
 * @returns {Promise<boolean>}
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

