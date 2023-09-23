const {logMessage} = require('../../functions/utilities/core/loggingUtils');

require('dotenv').config();
const {AI_ENABLED, AI_URL, FLUENT_AI} = process.env;
const {addXP} = require('../../functions/utilities/levelUtils');
const {Snowflake, EmbedBuilder} = require('discord.js');
const {checkUser} = require('../../functions/utilities/makerSurerExister');
const User = require('../../models/userModel');
const fs = require('fs');

const cooldowns = {'xp': { /* userID, guildID, timestamp */}}
let lastAIResponseTime = 0;

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {
        const bcrypt = require('bcrypt');
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
                message.attachments.forEach(attachment => {
                    content += `[Attachment #${attachmentNumber}](${attachment.url}) `;
                    attachmentNumber++;
                });
            }

            // If the message is a reply
            if (message.reference) {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                content = `- **Replying to:** https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.reference.messageId} | ` +
                    `**${referencedMessage.author.username}** (${referencedMessage.author.id}) | ` +
                    `${referencedMessage.content}\n - ` + content;
            }

            await clChannel.send({embeds: [new EmbedBuilder().setDescription(content)]});
        }

        continuousLogging(message).then(() => {
            awardXP(message.author.id, message.guild.id, message)
        });

        async function isLoggingChannel(channelID) {
            for (const channelID of Object.values(channelIDs)) {
                if (message.channel.id === channelID) return true;
            }
            return false;
        }

        /**
         * @name aiReply
         * @description Reply to a message using the AI
         * @param {string} message Message
         * @param {string} replyTo Message to reply to
         * @param {string} context Context
         * @param {number} version Version
         * @returns {Promise<{text: string}>}
         */

        async function aiReply(message, replyTo = "", context = "", version = 3) {

            // Uses https://github.com/BeauTheBeau/ai-api
            const start = Date.now();
            let url = `${AI_URL}/generate/v${version.toString()}/`
            let args = `?prompt=${encodeURIComponent(message)}`;
            if (version === 3 && replyTo !== "") {
                url += "conversation/";
                args += `&preprompt=${encodeURIComponent(replyTo)}&context=${encodeURIComponent(context)}`;
            } else if (version === 3 && replyTo === "") {
                if (context !== "") args += `&context=${encodeURIComponent(context)}`;
            } else if (version === 2) {
                args += `&context=${encodeURIComponent(context)}`;
            } else {
                return {text: "Invalid version"};
            }

            let response = await fetch(url + args)
            response = await response.json();
            console.log(response)
            return {text: response.text, time: Date.now() - start};
        }

        if (await isLoggingChannel(message.channel.id)) return;
        if (message.channel.id === "1146117922310344864") return;
        if (message.mentions.has(client.user.id) || message.content.toLowerCase().includes('bee6')) {

            if (message.content.toLowerCase().includes('bee6') && message.author.id === client.user.id) return;
            if (AI_ENABLED !== "true") return;

            let prompt = message.content.replace("`AI`", '');
            if (prompt.includes(`<@${client.user.id}>`)) prompt = prompt.replace(`<@${client.user.id}>`, '');
            prompt = `${prompt}`;

            await message.channel.sendTyping()
            let context = fs.readFileSync('./context.txt', 'utf8');
            context = context
                .replace(`[Server Name]`, message.guild.name)
                .replace(`[Server Owner]`, null)
                .replace(`[Channel Name]`, message.channel.name)
                .replace(`[Channel List]`, message.guild.channels.cache.map(channel => `${channel.name} (${channel.parent ? channel.parent.name : 'No Category'})`).join(', '))
                .replace(`[Member List]`, message.guild.members.cache.map(member => member.user.username).join(', '))
                .replace(`[User]`, message.author.username)
                .replace(`[Roles]`, message.guild.roles.cache.map(role => role.name).join(', '))
                .replace(`[Date]`, message.member.joinedAt)
                .replace(`[Time]`, new Date().toLocaleTimeString());

            let response;
            let version = 3;
            if (message.author.bot) version = 2;
            else version = 3;

            if (message.reference) {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                response = await aiReply(prompt, referencedMessage.content, context, version);
            }

            if (!response) response = await aiReply(prompt, "", context, version);
            console.log(response)

            await message.reply({
                content: `\`V${version}\` \`Took at least 0.0001ms\` ${response.text}`,
                allowedMentions: {repliedUser: true}
            });

            lastAIResponseTime = Date.now();

        } else if (AI_ENABLED === "true" && Date.now() - lastAIResponseTime <= 10000 && FLUENT_AI === "true") {

            if (message.author.id === client.user.id) return;
            const prompt = message.content;
            const response = await aiReply(prompt);

            // Send the AI response
            await message.channel.send({
                content: `\`V2\` ${response.text}`
            });

            lastAIResponseTime = Date.now();
        }
    }
}
