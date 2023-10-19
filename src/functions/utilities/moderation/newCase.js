const guildModel = require('../../../models/guildModel');
const { getModLogChannel, getModLogIgnore, getCaseCount } = require('./modlogUtils.js');
const {logMessage} = require("../core/loggingUtils");

const actionType = {
    MUTE: 'mute',
    MUTE_EXPIRE: 'mute_expire',
    UNMUTE: 'unmute',

    WARN: 'warn',
    WARN_REMOVE: 'warn_remove',

    BAN: 'ban',
    BAN_EXPIRE: 'ban_expire',
    UNBAN: 'unban',

    KICK: 'kick'



};


/**
 * @name newCase
 * @description Creates a new case
 * @param {String} guildID The ID of the guild
 * @param {Object} actionData The data of the action
 * @param {String} actionData.moderator The ID of the moderator
 * @param {String} actionData.target The ID of the target
 * @param {String} actionData.reason The reason for the action
 * @param {String} actionData.type The type of the action
 * @param {String} actionData.duration The duration of the action
 */

async function newCase(guildID, actionData) {

    const guild = await guildModel.findOne({guildID: guildID});
    actionData.case = await getCaseCount(guildID) + 1;
    logMessage(`New case created for ${actionData.target} in ${guildID} by ${actionData.moderator} for ${actionData.reason}. Case #${actionData.case}`, "INFO");

    guild.cases.push(actionData);
    guild.save();
    return actionData.case;

}


module.exports = { newCase, actionType };