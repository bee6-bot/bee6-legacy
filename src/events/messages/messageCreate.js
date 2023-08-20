const {logMessage} = require('../../functions/utilities/loggingUtils');
logMessage(`Hello, world! From messageCreate.js`, `INFO`);

require('dotenv').config();

const {addXP} = require('../../functions/utilities/levelUtils');
const {Snowflake} = require('discord.js');
const {checkUser} = require('../../functions/utilities/makerSurerExister');
const fs = require('fs');

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
            const response = await fetch(`http://0.0.0.0:8000/generate/${encodeURIComponent(message)}/${encodeURIComponent(context)}`);
            return await response.json();
        }

        const {getLevelData} = require('../../functions/utilities/levelUtils');

        // If the message was a reply to BEE6
        if (message.mentions.has(client.user.id)) {

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
            await message.reply({ content: `${response.text}\n\`[AI Response Time: ${endTime - startTime}ms]\``, allowedMentions: { repliedUser: true } });
            responseSent = true;
        }

    }
}