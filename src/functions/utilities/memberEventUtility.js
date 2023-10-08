/**
 * @fileoverview welcomeLeaveLogs
 * @description Logs welcome/leave messages to the guild's welcome/leave channel
 */

const guildModel = require("../../models/guildModel");
const userModel = require("../../models/userModel");
const {EmbedBuilder} = require("discord.js");
const { checkUser } = require("./makerSurerExister");

let placeholders = {
    user: ``,
    guild: ``,
    server: ``,
    memberCount: ``,
    members: ``,
    username: ``,
    displayName: ``,
    tag: ``,
    xp: ``,
    level: ``,
    cash: ``,
    bank: ``,
};

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

    await checkUser(member.id, member.guild.id);
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

    placeholders = {
        user: `<@${member.id}>`,
        guild: member.guild.name,
        server: member.guild.name,
        memberCount: member.guild.memberCount.toString(),
        members: member.guild.memberCount.toString(),
        username: member.user.username,
        displayName: member.displayName,
        tag: member.user.tag,
        xp: userData.totalXP.toString(),
        level: userData.level.toString(),
        cash: userData.cash.toString(),
        bank: userData.bank.toString(),
    };

    let formattedMessage = message;

    for (const placeholder in placeholders) {
        const regex = new RegExp(`\\{\\{${placeholder}\\}\\}|\\[\\{${placeholder}\\}\\]`, 'g');
        formattedMessage = formattedMessage.replace(regex, placeholders[placeholder]);
    }

    const embed = new EmbedBuilder()
        .setDescription(formattedMessage)
        .setAuthor({name: member.user.username, iconURL: member.user.displayAvatarURL({dynamic: true})})
        .setColor(member.displayHexColor)

    await channel.send({embeds: [embed]});
}

module.exports = {getChannel, sendWelcomeLeaveMessage, placeholders};