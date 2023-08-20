/**
 * @name makerSurerExister
 * @description Make sure users, guilds, etc. exist in the database
 */


const {logMessage} = require("./loggingUtils");

/**
 * @name checkGuild
 * @description Check if a guild exists in the database and create it if they don't
 * @param guildID
 * @returns {Promise<void>}
 */
async function checkGuild(guildID) {

    const guildModel = require(`../../models/guildModel`);
    const guild = await guildModel.findOne({guildID});
    if (guild === null) {
        logMessage(`Guild ${guildID} not found in database. Creating...`, `WARNING`);
        await new guildModel({guildID}).save();
        logMessage(`Guild ${guildID} created in database.`, `INFO`);
    }
}

/**
 * @name checkUser
 * @description Check if a user exists in the database and create them if they don't
 * @param userID
 * @param guildID
 * @returns {Promise<void>}
 */
async function checkUser(userID, guildID) {

    const userModel = require(`../../models/userModel`);
    const user = await userModel.findOne({userID, guildID});
    await checkGuild(guildID);
    if (user === null) {
        logMessage(`User ${userID} not found in database. Creating...`, `WARNING`);
        await new userModel({userID, guildID}).save();
        logMessage(`User ${userID} created in database.`, `INFO`);
    }
}

module.exports = { checkGuild, checkUser };