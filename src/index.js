// ===============================================
// 1. Importing modules
// ===============================================

// 1.1: Config files and environment variables
require('dotenv').config()
const envSetup = require('./functions/utilities/core/envSetup.js');

// 1.2: Discord.js + other main deps
const {Client, GatewayIntentBits, Collection} = require('discord.js')

// 1.3: Misc.
const process = require(`node:process`)
const {logMessage} = require('./functions/utilities/core/loggingUtils.js')
const fs = require('fs');
const path = require('path');
console.log()

logMessage(`Running in ${process.env.NODE_ENV} mode.`, `INFO`)
logMessage(`Node version: ${process.version}`, `INFO`)
logMessage(`Discord.js version: ${require('discord.js').version}`, `INFO`)
console.log()

// 1.4: Database
const mongoose = require('mongoose')
// const Models = {
//     User: require('./models/userModel.js'),
//     Guild: require('./models/guildModel.js'),
//     Poll: require('./models/pollModel.js'),
//     customCommand: require('./models/customCommandModel.js'),
//     moderation: require('./models/moderationModel.js'),
//     economyTransaction: require('./models/economyTransactionModel.js'),
//     reactionRole: require('./models/reactionRoleModel.js'),
//     logging: require('./models/loggingModel.js'),
//     reminder: require('./models/reminderModel.js') // accounts for birthdays as well as other reminders
// }

// 1.5: Functions
// const {replyWithEmbed} = require('./functions/helpers/embedResponse.js')
// const {getGuildData} = require('./functions/helpers/guildData.js')
// const {getMemberData} = require('./functions/helpers/memberData.js')

// 1.6: Debugging
let debug = process.env.DEBUG === 'true'

// 1.7: Client & API
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b, 0),
})

const { startApiServer } = require('./api');


// 1.8: Handlers
client.commands = new Collection()
client.buttons = new Collection()
client.commandArray = []
client.buttonArray = []

// ===============================================
// 2. Initialization
// ===============================================

logMessage(`Readying up...`, `INFO`)
logMessage(`Debug mode: ${debug}`, `INFO`)

// 2.05 Check if there is a new commit

async function checkForUpdates() {
    logMessage(`Checking for updates...`, `INFO`)
    // Get the current commit hash
    const currentCommit = require('child_process').execSync('git rev-parse HEAD').toString().trim();
    const currentCommitMessage = require('child_process').execSync('git log -1 --pretty=%B').toString().trim();

    // Get the last commit hash
    const lastCommit = require('child_process').execSync('git rev-parse HEAD@{1}').toString().trim();
    const lastCommitMessage = require('child_process').execSync('git log -1 --pretty=%B HEAD@{1}').toString().trim();

    // Check the date of the last commit and the current commit
    const lastCommitDate = require('child_process').execSync('git show -s --format=%ci HEAD@{1}').toString().trim();
    const currentCommitDate = require('child_process').execSync('git show -s --format=%ci HEAD').toString().trim();

    // If the last commit is older than the current commit, there is a new commit
    if (lastCommitDate > currentCommitDate) {

        const readInputFromConsole = require('./functions/utilities/core/inputUtils.js')

        logMessage(`    New commit found!`, `INFO`)
        logMessage(`    Last commit: ${lastCommit} ${lastCommitMessage}`, `INFO`)
        logMessage(`    Current commit: ${currentCommit} ${currentCommitMessage}`, `INFO`)
        const input = await readInputFromConsole(`    Would you like to update? (y/N) `)
        if (input.toLowerCase() === 'y') {
            logMessage(`    Updating...`, `INFO`)
            require('child_process').execSync('git pull').toString().trim();
            logMessage(`    Updated!`, `INFO`)
            process.exit(0)
        } else {
            logMessage(`    Not updating.`, `INFO`)
        }
    } else {
        logMessage(`    No updates found, you're up to date!`, `INFO`)
    }

}


// 2.1: Command and button handlers
async function initializeHandlers() {
    await require('./functions/handlers/commands.js')(client)

    // Temporarily removed event handlers as they seem to cause interactions to be delayed
    logMessage(`Initializing event handlers...`, `INFO`)
    await require('./functions/handlers/events.js')(client)

    logMessage(`Initializing command handlers...`, `INFO`)

}

// 2.1: Initialize client
async function initializeClient() {
    logMessage(`Initializing client...`, `INFO`)
    try {
        if (process.env.DEV_MODE === 'true') await client.login(process.env.DEV_TOKEN);
        else await client.login(process.env.TOKEN);
        logMessage(`Client initialized!`, `SUCCESS`);
        logMessage(`Logged in as ${client.user.tag}!`, `SUCCESS`);

        // Check for updates
        await checkForUpdates()

        await initializeHandlers();
    } catch (err) {
        logMessage(`Error logging in: ${err.stack}`, `ERROR`)
        throw new Error('Client initialization failed.');
    }
}

// ===============================================
// 2.2. Database
// ===============================================

// 2.2.1: Connect to MongoDB
async function connectToDatabase() {
    logMessage(`Connecting to MongoDB...`, `INFO`)
    const mongoURI = process.env.DEV_MODE === 'true' ? process.env.DEV_MONGO_URI : process.env.MONGO_URI;
    mongoose.set(`strictQuery`, true);

    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logMessage(`Connected to MongoDB!`, `SUCCESS`);

    } catch (err) {
        logMessage(`Error connecting to MongoDB: ${err.stack}`, `ERROR`)
        throw new Error('Database initialization failed.');
    }

    mongoose.connection.on('error', (err) => {
        logMessage(`Error connecting to MongoDB: ${err.stack}`, `ERROR`)
    });

    mongoose.connection.on('disconnected', () => {
        logMessage(`Disconnected from MongoDB!`, `ERROR`)
    });

    mongoose.connection.on('reconnected', () => {
        logMessage(`Reconnected to MongoDB!`, `SUCCESS`)
    });

    mongoose.connection.on('connecting', () => {
        logMessage(`Connecting to MongoDB...`, `INFO`)
    });
}

// ===============================================
// 2.3: Initialize client
// ===============================================

// 2.3.1: Initialize client
envSetup().then(() => {
    connectToDatabase()
        .then(() => {
            logMessage(`Database initialized!`, `SUCCESS`);
            initializeClient().then(() => {
                logMessage(`Ready to go!`, `SUCCESS`)
                startApiServer(); // Start the API server
            })
        })
        .catch((err) => {
            logMessage(`Error initializing database: ${err.stack}`, `ERROR`)
            process.exit(1)
        });
});


// ===============================================
// 3. Error handling
// ===============================================

// 3.1: Unhandled rejections
process.on('unhandledRejection', (err) => logMessage(err.stack, 'ERROR'));

// 3.2: Uncaught exceptions
process.on('uncaughtException', (err) => logMessage(err.stack, 'ERROR'));

// 3.3: Process exit
process.stdin.resume();
let exited = false;
function exitHandler(exitCode) {
    if (exited) return;
    exited = true;
    console.log(`\n\n\n `)
    logMessage(`Process exited with code ${exitCode}`, 'SUCCESS');
    const logFiles = fs.readdirSync(path.join(__dirname, 'logs'));
    const lastEditedLogFile = logFiles.reduce((prev, curr) => {
        const prevStat = fs.statSync(path.join(__dirname, 'logs', prev));
        const currStat = fs.statSync(path.join(__dirname, 'logs', curr));
        return prevStat.mtimeMs > currStat.mtimeMs ? prev : curr;
    });
    logMessage(`View this session's logs at ${path.join(__dirname, 'logs', lastEditedLogFile)}`, 'INFO');
    process.exit();
}

process.on('exit', exitHandler.bind(null));
process.on('SIGINT', exitHandler.bind(null));
process.on('SIGUSR1', exitHandler.bind(null));
process.on('SIGUSR2', exitHandler.bind(null));

module.exports = {client, debug}