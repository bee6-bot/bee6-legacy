/**
 * @fileoverview welcomeLeaveLogs
 * @description Logs welcome/leave messages to the guild's welcome/leave channel
 */

const guildModel = require("../../models/guildModel");
const userModel = require("../../models/userModel");
const {EmbedBuilder} = require("discord.js");

/**
 * @name getChannel
 * @param {Guild} guild
 * @param {string} type - 'welcome' or 'leave'
 * @returns {Promise<Channel>}
 */

async function getChannel(guild, type) {
    const guildData = await guildModel.findOne({guildID: guild.id});
    const channelID = type === 'welcome' ? guildData.welcomeChannelID : guildData.leaveChannelID;
    return guild.channels.cache.get(channelID);
}

/**
 * @name sendWelcomeLeaveMessage
 * @param {GuildMember} member
 * @param {string} type - 'welcome' or 'leave'
 * @returns {Promise<void>}
 */

async function sendWelcomeLeaveMessage(member, type) {

    const guildData = await guildModel.findOne({guildID: member.guild.id});
    const channelID = type === 'welcome' ? guildData.welcomeChannelID : guildData.leaveChannelID;
    const channel = member.guild.channels.cache.get(channelID);
    if (!channel) return;

    const userData = await userModel.findOne({userID: member.id});
    let message;

    try {
        message = type === 'welcome' ? guildData.welcomeMessage : guildData.leaveMessage;
    } catch (error) {
        guildData.welcomeMessage = type === 'welcome' ? 'Hey, {user}! Welcome to **{guild}**! You are the **{memberCount}th** member!' : 'Oh no, **{user}** left {guild}! We now have **{memberCount}** members!';
    } finally {
        guildData.save();
    }

    if (message === '') return;
    const embed = new EmbedBuilder()
        .setDescription(message
            .replace('{{user}}', `<@${member.id}>`)
            .replace('{{guild}}', member.guild.name)
            .replace('{{memberCount}}', member.guild.memberCount.toString())
        )
        .setAuthor({name: member.user.username, iconURL: member.user.displayAvatarURL({dynamic: true})})
        .setColor(member.displayHexColor)

    await channel.send({embeds: [embed]});
}

module.exports = {getChannel, sendWelcomeLeaveMessage}