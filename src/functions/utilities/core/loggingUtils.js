const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

let currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
let currentTime = new Date().toLocaleTimeString().replace(/:/g, '-');
const logFileName = `${currentDate}_${currentTime}.log`;


/**
 * Ensures that the "logs" folder exists in the root directory of the project.
 * If the folder does not exist, it will be created.
 */
function createLogsFolder() {
    const logsFolderPath = path.join(__dirname, '../../../logs');
    if (!fs.existsSync(logsFolderPath)) {
        fs.mkdirSync(logsFolderPath);
    }
}

/**
 * Writes logs to a file in the "logs" folder.
 * @param {string} logText - The text to be written to the log file.
 * @param {string} logFileName - The name of the log file.
 */
function writeToFile(logText, logFileName) {
    const logPath = path.join(__dirname, '../../../logs', logFileName);
    fs.appendFile(logPath, logText + '\n', (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
}

/**
 * Logs messages with timestamp to the console and writes them to a log file.
 * @param {string} message - The log message to be displayed.
 * @param {("ERROR"|"WARNING"|"INFO"|"SUCCESS")} [logLevel=INFO] - The log level. Possible values: "ERROR", "WARNING", "INFO".
 */
function logMessage(message, logLevel = 'INFO') {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${logLevel}] ${message}`;

    // Log to the console with different colors based on the log level
    switch (logLevel) {
        case 'ERROR':
            console.error(chalk.red(formattedMessage));
            break;
        case 'WARNING':
            console.warn(chalk.yellow(formattedMessage));
            break;
        case 'SUCCESS':
            console.log(chalk.green(formattedMessage));
            break;
        case 'INFO':
            console.log(chalk.blue(formattedMessage));
            break;
        default:
            console.log(formattedMessage);
    }

    // Generate a log file name using the current date and time
    currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
    currentTime = new Date().toLocaleTimeString().replace(/:/g, '-');

    // Write to the log file
    writeToFile(formattedMessage, logFileName);
}

// Create the "logs" folder if it doesn't exist
createLogsFolder();
logMessage('Hello, world, from logging.js!', 'INFO');

// Example usage:
// logMessage('This is an info message.', 'INFO');
// logMessage('This is a warning message.', 'WARNING');
// logMessage('This is an error message.', 'ERROR');
// logMessage('This is a message with the default log level.');

module.exports = { logMessage };