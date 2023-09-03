const guildModel = require("../../models/guildModel");
const userModel = require("../../models/userModel");
const {EmbedBuilder} = require("discord.js");
const {getResponsibleUser, getLogChannel} = require("../../functions/utilities/otherUtils");
const {sendWelcomeLeaveMessage} = require("../../functions/utilities/memberEventUtility");

/**
 * @fileoverview memberLogs
 * @description Logs member changes (join, leave, ban, etc.) to the mod log channel
 */

const eventInfo = [

    // Member
    {
        name: "guildMemberAdd",
        eventType: "MEMBER JOINED",
        description: "Member Joined",
        function: async (member, client) => {
            console.log('guildMemberAdd')
            await sendWelcomeLeaveMessage(member, 'welcome');
        }
    },
    {
        name: "guildMemberRemove",
        eventType: "MEMBER LEFT",
        description: "Member Left",
        function: async (member, client) => {
            await sendWelcomeLeaveMessage(member, 'leave');
        }
    },
    {
        name: "guildBanAdd",
        eventType: "MEMBER BANNED",
        description: "Member Banned",
        getDescription: async (ban, client) => {
            const auditLog = await ban.guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first());
            return `**\`[EVENT TYPE]\`** | ` +
                `**${ban.user.tag}** (<@${ban.user.id}>) | ` +
                `**By:** ${auditLog.executor} (<@${auditLog.executor.id}>) | ` +
                `**Reason:** ${auditLog.reason || 'No reason provided'}`;
        }
    },
    {
        name: "guildBanRemove",
        eventType: "MEMBER UNBANNED",
        description: "Member Unbanned",
        getDescription: async (ban, client) => {
            const auditLog = await ban.guild.fetchAuditLogs({type: 'MEMBER_BAN_REMOVE'}).then(audit => audit.entries.first());
            return `**\`[EVENT TYPE]\`** | ` +
                `**${ban.user.tag}** (<@${ban.user.id}>) | ` +
                `**By:** ${auditLog.executor.tag} (<@${auditLog.executor.id}>)`;
        }
    }
]

module.exports = eventInfo.map(event => ({
    name: event.name,
    async execute(client, ...args) {
        const logChannel = await getLogChannel(args[0].guild);
        if (!logChannel) return;

        if (event.function) {
            await event.function(...args, client);
            return;
        }

        const content = await event.getDescription(...args, client)
        await logChannel.send({embeds: [new EmbedBuilder().setDescription(content.replace('[EVENT TYPE]', event.eventType))]})
    }
}));