const {logMessage} = require('../../functions/utilities/loggingUtils');

require('dotenv').config();
const bcrypt = require('bcrypt');
const {AI_ENABLED, AI_URL, FLUENT_AI} = process.env;
const {addXP} = require('../../functions/utilities/levelUtils');
const {Snowflake, EmbedBuilder} = require('discord.js');
const {checkUser} = require('../../functions/utilities/makerSurerExister');
const User = require('../../models/userModel');
const fs = require('fs');
const {levenshteinDistance} = require('../../functions/utilities/comparisonUtils');
const {getLevelData} = require('../../functions/utilities/levelUtils');
const guildModel = require("../../models/guildModel");

const cooldowns = {'xp': { /* userID, guildID, timestamp */}}
let lastAIResponseTime = 0;

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {

        // If the message contains "mee6"
        if (message.content.toLowerCase().includes('mee6')) {
            message.react('🤓');
            message.react('🛡️');
        }


        const guildModel = require('../../models/guildModel');
        const guildData = await guildModel.findOne({guildID: message.guild.id});
        const channelIDs = {
            'welcome': guildData.welcomeChannelID,
            'leave': guildData.leaveChannelID,
            'continuousMessageLogging': guildData.continuousMessageLoggingChannelID,
        }

        /**
         * @name awardXP
         * @description Award XP to a user
         * @param {Snowflake} userID User ID
         * @param {string} guildID Guild ID
         * @param {number} message Message
         * @returns {Promise<void>}
         * @throws {Error} If an error occurs while adding XP
         */

        async function awardXP(userID, guildID, message) {

            await checkUser(userID, guildID);
            const user = await User.findOne({userID: userID, guildID: guildID});
            const last10Messages = user.last10Messages;

            if (last10Messages.length >= 10) last10Messages.shift();
            user.last10Messages.push(bcrypt.hashSync(message.content.toLowerCase(), 10));

            for (const msg of last10Messages) {

                // If they're the exact same message
                if (msg === bcrypt.hashSync(message.content.toLowerCase(), 10)) {
                    if (process.env.DEBUG === true) logMessage(`Not awarding XP to ${userID} in ${guildID} because of exact match`, `INFO`);
                    return;
                }

                // TODO: Appropriate technique for hashed values
                //       Fun fact: bcrypt hashes are different every time!
                // if (levenshteinDistance(msg, bcrypt.hashSync(message.content.toLowerCase(), 10)) <= 5) {
                //     if (process.env.DEBUG === "true") logMessage(`Not awarding XP to ${userID} in ${guildID} because of similarity`, `INFO`);
                //     return;
                // }
            }

            await user.save();

            if (cooldowns.xp[userID] && cooldowns.xp[userID][guildID]) {
                if (cooldowns.xp[userID][guildID] > Date.now()) return;
                cooldowns.xp[userID][guildID] = Date.now() + 60000;
            } else {
                cooldowns.xp[userID] = {};
                cooldowns.xp[userID][guildID] = Date.now() + 60000;
            }

            if (process.env.DEBUG === "true") logMessage(`Awarding XP to ${userID} in ${guildID}`, `INFO`);
            const messageLength = message.content.length > 100 ? 100 : message.content.length;
            await addXP(message.author.id, message.guild.id, messageLength, message);
        }

        /**
         * @name continuousLogging
         * @description Log messages to a channel if guild.continuousMessageLogging is true
         * @param {string} message Message
         * @returns {Promise<void>}
         */

        async function continuousLogging(message) {

            const clChannel = message.guild.channels.cache.get(channelIDs.continuousMessageLogging);
            if (message.author.bot) return;
            if (!clChannel) return;
            if (message.author.id === client.user.id) return;

            let content = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id} | ` +
                `**${message.author.username}** (${message.author.id}) | ` +
                `${message.content}`;

            if (message.attachments.size > 0) {
                content += '\n**Attachments:** ';
                let attachmentNumber = 1;
                // [attachment #1](url) [attachment #2](url)
                message.attachments.forEach(attachment => {
                    content += `[Attachment #${attachmentNumber}](${attachment.url}) `;
                    attachmentNumber++;
                });
            }

            await clChannel.send({content: content});
        }

        continuousLogging(message).then(() => {
            awardXP(message.author.id, message.guild.id, message)
        });

        /**
         * @name aiReply
         * @description Reply to a message using the AI
         * @param {string} message Message
         * @param {string} context Context
         * @returns {Promise<void>}
         */

        async function aiReply(message, context = "") {
            // Uses https://github.com/BeauTheBeau/ai-api
            const response = await fetch(`${AI_URL}/generate/v2/?prompt=${encodeURIComponent(message)}`);
            return await response.json();
        }

        const author = message.author;

        // If the message was sent in a logging channel, ignore it
        if (message.channel.id !== channelIDs.continuousMessageLogging) {
            if (message.mentions.has(client.user.id) || message.content.toLowerCase().includes('bee6')) {

                if (AI_ENABLED !== "true") return;
                let responseSent = false;

                let context = fs.readFileSync('./context.txt', 'utf8');
                context = context
                    .replace("[Channel List]", message.guild.channels.cache.map(channel => {
                        const categoryName = channel.parent ? ` (${channel.parent.name})` : '';
                        return `${channel.name}${categoryName}`;
                    }).join(", "))
                    .replace("[Server Name]", message.guild.name)
                    .replace("[Server Owner]", message.guild.memberCount)
                    .replace("[Channel Name]", `<#${message.channel.id}>`)
                    .replace("[User]", `<@${message.author.id}>`)
                    .replace("[Roles]", message.member.roles.cache.map(role => role.name).join(", "))
                    .replace("[Joined]", message.member.joinedAt.toLocaleDateString())
                    .replace("[Level]", await getLevelData(message.author.id, message.guild.id).level)
                    .replace("[XP]", await getLevelData(message.author.id, message.guild.id).xp)
                    .replace("[Time]", new Date().toLocaleTimeString())


                let prompt = message.content;
                if (prompt.includes(`<@${client.user.id}>`)) prompt = prompt.replace(`<@${client.user.id}>`, '');
                prompt = `u/${author.username}: ${prompt}`;

                await message.channel.sendTyping()
                const response = await aiReply(prompt, context);

                // Check if the last message in the channel isn't from the author
                if (message.channel.lastMessage.author.id !== author.id || message.channel.lastMessage.author.id === client.user.id) {
                    await message.reply({
                        content: `${response.text}`,
                        allowedMentions: {repliedUser: true}
                    });
                } else {
                    await message.channel.send({
                        content: `${response.text}`
                    });
                }
                responseSent = true;
                lastAIResponseTime = Date.now();

            } else if (AI_ENABLED === "true" && Date.now() - lastAIResponseTime <= 10000 && FLUENT_AI === "true") {

                if (message.author.id === client.user.id) return;
                const prompt = message.content;
                const response = await aiReply(prompt);

                // Send the AI response
                await message.channel.send({
                    content: `${response.text}`
                });

                lastAIResponseTime = Date.now(); // Update the last AI response time
            }
        }
    }
}
