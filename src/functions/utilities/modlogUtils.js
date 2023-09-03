const guildModel = require("../../models/guildModel");


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

module.exports = {shouldLogEvent}