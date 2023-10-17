const guildModel = require("../../../models/guildModel");


/**
 * @name shouldLogEvent
 * @description Checks if an event should be ignored by the mod log
 * @param event
 * @param channelId
 * @param memberRoles
 * @param memberId
 * @returns {Promise<boolean>}
 */
async function shouldLogEvent(event, channelId, memberRoles, memberId) {
    const guildData = await guildModel.findOne({guildID: event.guild.id});

    if (guildData.modLogIgnore.events.includes(event.name)) return false;
    if (guildData.modLogIgnore.channels.includes(channelId)) return false;
    if (guildData.modLogIgnore.roles.some(role => memberRoles.cache.has(role))) return false;
    if (guildData.modLogIgnore.users.includes(memberId)) return false;

    return true;
}

/**
 * @name getModLogChannel
 * @description Gets a guild's mod log channels
 * @param guildId
 * @returns {Promise<{embed: *, normal: *}>}
 */
async function getModLogChannel(guildId) {

    const guildData = await guildModel.findOne({guildID: guildId});

    return {
        normal: guildData.modLogChannelID,
        continuousLogging: guildData.continuousMessageLoggingChannelID
    }
}

/**
 * @name getModLogIgnore
 * @description Gets a guild's mod log ignore settings
 * @param guildId
 * @returns {Promise<{channels: *, events: *, roles: *, users: *}>}
 */

async function getModLogIgnore(guildId) {
    const guildData = await guildModel.findOne({guildID: guildId});

    return {
        channels: guildData.modLogIgnore.channels,
        events: guildData.modLogIgnore.events,
        roles: guildData.modLogIgnore.roles,
        users: guildData.modLogIgnore.users
    }
}

// TODO: Add function to log events in a consistent way 

module.exports = {shouldLogEvent}