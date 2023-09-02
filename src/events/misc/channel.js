const guildModel = require("../../models/guildModel");
const {EmbedBuilder} = require("discord.js");


/**
 * @name getLogChannel
 * @param {Guild} guild
 * @returns {Promise<Channel>}
 */

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

const ActionType = {
    MESSAGE_DELETE: 72,
    MESSAGE_UPDATE: 73,
    MESSAGE_BULK_DELETE: 74,
    CHANNEL_DELETE: 12,
    CHANNEL_CREATE: 11,
    CHANNEL_UPDATE: 13,
    MEMBER_BAN_ADD: 22,
    MEMBER_BAN_REMOVE: 23,
    MEMBER_KICK: 20,
    MEMBER_PRUNE: 1,
    MEMBER_ROLE_UPDATE: 25,
    MEMBER_UPDATE: 24,
    ROLE_CREATE: 30,
    ROLE_DELETE: 31,
    ROLE_UPDATE: 32,
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

const eventInfo = [
    {
        name: "channelCreate",
        eventType: "CHANNEL CREATED",
        getDescription: async (channel, client) => {
            return `**\`[EVENT TYPE]\`** | ` +
                `**${channel.name}** (<#${channel.id}>)` +
                `\n**Type:** ${getChannelTypeName(channel)} | ` +
                `**NSFW:** ${channel.nsfw ? 'Yes' : 'No'} | ` +
                `**By:** ${await getResponsibleUser(client, channel.guild, 'CHANNEL_CREATE', channel.id)}`;
        },
    },
    {
        name: "channelDelete",
        eventType: "CHANNEL DELETED",
        getDescription: async (channel, client) => {
            return `**\`[EVENT TYPE]\`** | ` +
                `**${channel.name}** (<#${channel.id}>)` +
                `\n**Type:** ${getChannelTypeName(channel)} | ` +
                `**NSFW:** ${channel.nsfw ? 'Yes' : 'No'} | ` +
                `**By:** ${await getResponsibleUser(client, channel.guild, 'CHANNEL_DELETE', channel.id)}`;
        },
    },
    {
        name: "channelUpdate",
        eventType: "CHANNEL UPDATED",
        getDescription: async (oldChannel, newChannel, client) => {
            return `**\`[EVENT TYPE]\`** | ` +
                `**${newChannel.name}** (<#${newChannel.id}>)` +
                `${oldChannel.name !== newChannel.name ? `\n**Name:** ${oldChannel.name} -> ${newChannel.name}` : ''}` +
                `\n**Type:** ${getChannelTypeName(newChannel)} | ` +
                `**NSFW:** ${newChannel.nsfw ? 'Yes' : 'No'} | ` +
                `**By:** ${await getResponsibleUser(client, newChannel.guild, 'CHANNEL_UPDATE', newChannel.id)}`;
        },
    }
];

module.exports = eventInfo.map(event => ({
    name: event.name,
    async execute(client, ...args) {
        const logChannel = await getLogChannel(args[0].guild);
        if (!logChannel) return;

        const content = await event.getDescription(...args, client)
        await logChannel.send({embeds: [new EmbedBuilder().setDescription(content.replace('[EVENT TYPE]', event.eventType))]})
    }
}));