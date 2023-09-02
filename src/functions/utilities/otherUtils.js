/**
 * @name getLogChannel
 * @param {Guild} guild
 * @returns {Promise<Channel>}
 */
const {EmbedBuilder} = require("discord.js");
const guildModel = require("../../models/guildModel");

async function getLogChannel(guild) {
    const guildData = await guildModel.findOne({guildID: guild.id});
    const logChannelID = guildData.modLogChannelID;
    return guild.channels.cache.get(logChannelID);
}

/**
 * @name getChannelType
 * @param {Channel} channel
 * @returns {string}
 */

function getChannelTypeName(channel) {
    const channelTypeMapping = {
        '0': 'Text',
        '1': 'DM',
        '2': 'Voice',
        '3': 'Group DM',
        '4': 'Category',
        '5': 'Announcement',
        '10': 'News Thread',
        '11': 'Public Thread',
        '12': 'Private Thread',
        '13': 'Stage Voice',
        '14': 'Directory',
        '15': 'Forum',
        '16': 'Media'
    };

    if (!channel) return 'Unknown';

    const channelType = channel.type;
    return channelTypeMapping[channelType];
}

/**
 * @name getResponsibleUser
 * @description Parses the audit log to find the responsible user for an action
 * @param {Client} client
 * @param {Guild} guild
 * @param {string} event
 * @param {string} targetId
 */

// Action types: https://old.discordjs.dev/#/docs/main/stable/typedef/AuditLogAction
//               Also see: https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events
const ActionType = {
    "ALL": null,
    "GUILD_UPDATE": 1,
    "CHANNEL_CREATE": 10,
    "CHANNEL_UPDATE": 11,
    "CHANNEL_DELETE": 12,
    "CHANNEL_OVERWRITE_CREATE": 13,
    "CHANNEL_OVERWRITE_UPDATE": 14,
    "CHANNEL_OVERWRITE_DELETE": 15,
    "MEMBER_KICK": 20,
    "MEMBER_PRUNE": 21,
    "MEMBER_BAN_ADD": 22,
    "MEMBER_BAN_REMOVE": 23,
    "MEMBER_UPDATE": 24,
    "MEMBER_ROLE_UPDATE": 25,
    "MEMBER_MOVE": 26,
    "MEMBER_DISCONNECT": 27,
    "BOT_ADD": 28,
    "ROLE_CREATE": 30,
    "ROLE_UPDATE": 31,
    "ROLE_DELETE": 32,
    "INVITE_CREATE": 40,
    "INVITE_UPDATE": 41,
    "INVITE_DELETE": 42,
    "WEBHOOK_CREATE": 50,
    "WEBHOOK_UPDATE": 51,
    "WEBHOOK_DELETE": 52,
    "EMOJI_CREATE": 60,
    "EMOJI_UPDATE": 61,
    "EMOJI_DELETE": 62,
    "MESSAGE_DELETE": 72,
    "MESSAGE_BULK_DELETE": 73,
    "MESSAGE_PIN": 74,
    "MESSAGE_UNPIN": 75,
    "INTEGRATION_CREATE": 80,
    "INTEGRATION_UPDATE": 81,
    "INTEGRATION_DELETE": 82,
    "STAGE_INSTANCE_CREATE": 83,
    "STAGE_INSTANCE_UPDATE": 84,
    "STAGE_INSTANCE_DELETE": 85,
    "STICKER_CREATE": 90,
    "STICKER_UPDATE": 91,
    "STICKER_DELETE": 92,
    "GUILD_SCHEDULED_EVENT_CREATE": 100,
    "GUILD_SCHEDULED_EVENT_UPDATE": 101,
    "GUILD_SCHEDULED_EVENT_DELETE": 102,
    "THREAD_CREATE": 110,
    "THREAD_UPDATE": 111,
    "THREAD_DELETE": 112
};

async function getResponsibleUser(client, guild, event, targetId) {
    try {
        const logs = await guild.fetchAuditLogs({type: ActionType[event]});
        const entry = logs.entries.find((entry) => entry.target.id === targetId);

        if (entry) return entry.executor;
        else return null;
    } catch (error) {
        console.error(error); // TODO: Use logging utility
        return null;
    }
}

module.exports = {getLogChannel, getChannelTypeName, getResponsibleUser};