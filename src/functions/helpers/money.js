/**
 * @name money
 * @description Helper functions to add, remove, get and format money.
 */



// ===============================================
// 1. Imports
// ===============================================

const userModel = require('../../models/userModel');

// ===============================================
// 2. Functions
// ===============================================

/**
 * @name addMoney
 * @description Add money to a user's balance
 * @param {string} userID User ID
 * @param {string} guildID Guild ID
 * @param {number} amount Amount to add
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while adding money
 * @throws {Error} If the amount is not positive
 * @throws {Error} If the user does not exist
 */

async function addMoney(userID, guildID, amount) {
    // Check if the amount is positive
    if (amount < 0) throw new Error(`Amount must be positive.`);

    // Get the user
    const user = await userModel.findOne({ userID, guildID });
    if (!user) throw new Error(`User does not exist.`);

    // Add the money
    user.cash += amount.toFixed(2);
    await user.save();
}

/**
 * @name removeMoney
 * @description Remove money from a user's balance
 * @param {string} userID User ID
 * @param {string} guildID Guild ID
 * @param {number} amount Amount to remove
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while removing money
 * @throws {Error} If the amount is not positive
 * @throws {Error} If the user does not exist
 */

async function removeMoney(userID, guildID, amount) {
    // Check if the amount is positive
    if (amount < 0) throw new Error(`Amount must be positive.`);

    // Get the user
    const user = await userModel.findOne({ userID, guildID });
    if (!user) throw new Error(`User does not exist.`);

    // Remove the money
    user.cash -= amount.toFixed(2);
    await user.save();
}

/**
 * @name setMoney
 * @description Set a user's balance
 * @param {string} userID User ID
 * @param {string} guildID Guild ID
 * @param {number} amount Amount to set
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while setting money
 * @throws {Error} If the user does not exist
 */

async function setMoney(userID, guildID, amount) {
    // Get the user
    const user = await userModel.findOne({ userID, guildID });
    if (!user) throw new Error(`User does not exist.`);

    // Set the money
    user.cash = amount.toFixed(2);
    await user.save();
}

/**
 * @name getMoney
 * @description Get a user's balance
 * @param {} userID User ID
 * @param {string} guildID Guild ID
 * @returns {Promise<number>} User's balance
 * @throws {Error} If an error occurs while getting money
 * @throws {Error} If the user does not exist
 */

async function getMoney(userID, guildID) {
    // Get the user
    const user = await userModel.findOne({ userID, guildID });
    if (!user) throw new Error(`User does not exist.`);

    // Return the money
    return { cash: user.cash, bank: user.bank };
}

/**
 * @name formatMoney
 * @description Format a number as money
 * @param {number} amount Amount to format
 * @returns {string} Formatted amount
 * @throws {Error} If an error occurs while formatting money
 * @throws {Error} If the amount is not a number
 */

function formatMoney(amount) {
    // Check if the amount is a number
    if (typeof amount !== 'number') throw new Error(`Amount must be a number.`);

    // Format the money
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'GBP' });
}

// ===============================================
// 3. Exports
// ===============================================

module.exports = { addMoney, removeMoney, setMoney, getMoney, formatMoney }