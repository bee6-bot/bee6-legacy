const {logMessage} = require('../../functions/utilities/loggingUtils');
logMessage(`Hello, world! From messageCreate.js`, `INFO`);

require('dotenv').config();
const bcrypt = require('bcrypt');
const {AI_ENABLED, AI_URL} = process.env;
const {addXP} = require('../../functions/utilities/levelUtils');
const {Snowflake} = require('discord.js');
const {checkUser} = require('../../functions/utilities/makerSurerExister');
const User = require('../../models/userModel');
const fs = require('fs');
const {levenshteinDistance} = require('../../functions/utilities/comparisonUtils');

const cooldowns = {'xp': { /* userID, guildID, timestamp */}}

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {

        if (message.author.bot) return;

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

        await awardXP(message.author.id, message.guild.id, message);

        /**
         * @name aiReply
         * @description Reply to a message using the AI
         * @param {string} message Message
         * @param {string} context Context
         * @returns {Promise<void>}
         */

        async function aiReply(message, context) {
            // Uses https://github.com/BeauTheBeau/ai-api
            const response = await fetch(`${AI_URL}/generate/${encodeURIComponent(message)}/${encodeURIComponent(context)}`);
            return await response.json();
        }

        const {getLevelData} = require('../../functions/utilities/levelUtils');

        // If the message was a reply to BEE6
        if (message.mentions.has(client.user.id)) {

            if (AI_ENABLED !== "true") return;
            let responseSent = false;

            let context = fs.readFileSync('./context.txt', 'utf8');
            context = context
                .replace("[Server Name]", message.guild.name)
                .replace("[Server Owner]", message.guild.memberCount)
                .replace("[Channel Name]", `<#${message.channel.name}>`)
                .replace("[User]", `@{message.author.id}>`)
                .replace("[Roles]", message.member.roles.cache.map(role => role.name).join(", "))
                .replace("[Joined]", message.member.joinedAt.toLocaleDateString())
                .replace("[Level]", await getLevelData(message.author.id, message.guild.id).level)
                .replace("[XP]", await getLevelData(message.author.id, message.guild.id).xp)
                .replace("[Time]", new Date().toLocaleTimeString())

            let startTime = Date.now();
            const prompt = message.content;
            await message.channel.sendTyping()
            setInterval(async () => {
                if (!responseSent) await message.channel.sendTyping();
            }, 5000);

            const response = await aiReply(prompt, context);
            let endTime = Date.now();
            console.log(`AI response time: ${endTime - startTime}ms`);
            await message.reply({
                content: `${response.text}\n\`[AI Response Time: ${endTime - startTime}ms]\``,
                allowedMentions: {repliedUser: true}
            });
            responseSent = true;
        }

    }
}