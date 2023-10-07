
const readline = require('readline');

const chalk = require('chalk');

let currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
let currentTime = new Date().toLocaleTimeString().replace(/:/g, '-');

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

    const timestamp = new Date().toISOString();
    let formattedPrompt = `[${timestamp}] [INPT] ${prompt}`;
    // Attention grabber - bg: yellow, fg: black
    formattedPrompt = chalk.cyan(formattedPrompt);

    return new Promise((resolve) => {
        rl.question(formattedPrompt, (input) => {
            rl.close();
            resolve(input.trim());
        });
    });
}

module.exports = readInputFromConsole;
