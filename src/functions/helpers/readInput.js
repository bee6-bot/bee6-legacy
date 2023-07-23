
const readline = require('readline');

/**
 * @function readInputFromConsole
 * @description Reads input from the console and returns it
 * @param {String} prompt - The prompt to display
 * @returns {Promise<String>} - The input from the console
 */

function readInputFromConsole(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(prompt, (input) => {
            rl.close();
            resolve(input.trim());
        });
    });
}

module.exports = readInputFromConsole;
