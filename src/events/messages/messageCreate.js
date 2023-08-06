const {logMessage} = require('../../functions/helpers/logging');
logMessage(`Hello, world! From messageCreate.js`, `INFO`);

const {addXP} = require('../../functions/helpers/leveling');
const {addMoney} = require('../../functions/helpers/money');
const {Snowflake} = require('discord.js');

const calldowns = { 'xp': { /* userID, guildID, timestamp */ }}

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

            if (calldowns.xp[userID] && calldowns.xp[userID][guildID]) {
                if (calldowns.xp[userID][guildID] > Date.now()) return;
                calldowns.xp[userID][guildID] = Date.now() + 60000;
            } else {
                calldowns.xp[userID] = {};
                calldowns.xp[userID][guildID] = Date.now() + 60000;
            }

            const messageLength = message.content.length > 100 ? 100 : message.content.length;
            await addXP(message.author.id, message.guild.id, messageLength, message);
        }

        await awardXP(message.author.id, message.guild.id, message);
    }
}


