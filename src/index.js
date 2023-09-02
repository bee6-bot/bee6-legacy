// ===============================================
// 1. Importing modules
// ===============================================

// 1.1: Config files and environment variables
require('dotenv').config()
const envSetup = require('./functions/utilities/envSetup.js');

// 1.2: Discord.js
const {Client, GatewayIntentBits, Collection} = require('discord.js')

// 1.3: Misc.
const process = require(`node:process`)
const {logMessage} = require('./functions/utilities/loggingUtils.js')
console.log()
logMessage(`Hello, world! From index.js`, `INFO`)

// 1.4: Database
const mongoose = require('mongoose')
const Models = {
    User: require('./models/userModel.js'),
    Guild: require('./models/guildModel.js'),
    Poll: require('./models/pollModel.js'),
    customCommand: require('./models/customCommandModel.js'),
    moderation: require('./models/moderationModel.js'),
    economyTransaction: require('./models/economyTransactionModel.js'),
    reactionRole: require('./models/reactionRoleModel.js'),
    logging: require('./models/loggingModel.js'),
    reminder: require('./models/reminderModel.js') // accounts for birthdays as well as other reminders
}

// 1.5: Functions
// const {replyWithEmbed} = require('./functions/helpers/embedResponse.js')
// const {getGuildData} = require('./functions/helpers/guildData.js')
// const {getMemberData} = require('./functions/helpers/memberData.js')

// 1.6: Debugging
let debug = process.env.DEBUG === 'true'
let debugGuild = process.env.DEBUG_GUILD

// 1.7: Client
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b, 0),
})

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

// 2.1: Command and button handlers
async function initializeHandlers() {
    logMessage(`Initializing command handlers...`, `INFO`)
    await require('./functions/handlers/commands.js')(client)

    logMessage(`Initializing event handlers...`, `INFO`)
    await require('./functions/handlers/events.js')(client)

    logMessage(`Initializing button handlers...`, `INFO`)
    await require('./functions/handlers/buttons.js')(client)

}

// 2.1: Initialize client
async function initializeClient() {
    logMessage(`Initializing client...`, `INFO`)
    try {
        await client.login(process.env.TOKEN);
        logMessage(`Client initialized!`, `INFO`);
        logMessage(`Logged in as ${client.user.tag}!`, `INFO`);
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
    const mongoURI = process.env.MONGO_URI;
    mongoose.set(`strictQuery`, true);

    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logMessage(`Connected to MongoDB!`, `INFO`);

    } catch (err) {
        logMessage(`Error connecting to MongoDB: ${err.stack}`, `ERROR`)
        throw new Error('Database initialization failed.');
    }

    mongoose.connection.on('error', (err) => {
        logMessage(`Error connecting to MongoDB: ${err.stack}`, `ERROR`)
    });

    mongoose.connection.on('disconnected', () => {
        logMessage(`Disconnected from MongoDB!`, `INFO`)
    });

    mongoose.connection.on('reconnected', () => {
        logMessage(`Reconnected to MongoDB!`, `INFO`)
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
            logMessage(`Database initialized!`, `INFO`)
            initializeClient().then(() => {
                logMessage(`Initialization complete!`, `INFO`)
                logMessage(`Ready to go!`, `INFO`)
            })
        })
        .catch((err) => {
            logMessage(`Error initializing database: ${err.stack}`, `ERROR`)
            process.exit(1)
        });
})

// ===============================================
// 3. Error handling
// ===============================================

// 3.1: Unhandled rejections
process.on('unhandledRejection', (err) => logMessage(err.stack, 'ERROR'));

// 3.2: Uncaught exceptions
process.on('uncaughtException', (err) => logMessage(err.stack, 'ERROR'));

// 3.3: Process exit
process.on('exit', (code) => {
    logMessage(`Process exited with code ${code}`, 'INFO');
    mongoose.connection.close();
});