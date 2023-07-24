// ===============================================
// 1. Importing modules
// ===============================================

// 1.1: Config files and environment variables
require('dotenv').config()
const envSetup = require('./functions/helpers/envSetup.js');
envSetup();

// 1.2: Discord.js
const {Client, GatewayIntentBits, Collection, Events, EmbedBuilder} = require('discord.js')

// 1.3: Misc.
const process = require(`node:process`)
const fs = require('fs')
const chalk = require('chalk')

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
const debug = process.env.DEBUG === 'true'
const debugGuild = process.env.DEBUG_GUILD

// 1.7: Client
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b, 0),
})

// 1.8: Handlers
client.commands = new Collection()
client.buttons = new Collection()
client.commandArray = []
client.buttonArray = []
// require('./functions/handlers/handleCommands.js')(client)
// require('./functions/handlers/handleButtons.js')(client)
// require('./functions/handlers/handleEvents.js')(client)
// require('./functions/handlers/handleSlashCommands.js')(client)

// ===============================================
// 2. Initialization
// ===============================================

// 2.1: Initialize client
async function initializeClient() {
    console.log(`${chalk.yellow(`Initializing client...`)}`);
    try {
        await client.login(process.env.TOKEN);
        console.log(`${chalk.green(`  Logged in as ${client.user.tag}!`)}`);
    } catch (err) {
        console.log(`${chalk.red(`  Error logging in: ${err}`)}`);
        throw new Error('Client initialization failed.');
    }
}

// ===============================================
// 2.2. Database
// ===============================================

// 2.2.1: Connect to MongoDB
async function connectToDatabase() {
    console.log(`${chalk.yellow(`Connecting to MongoDB...`)}`);
    const mongoURI = process.env.MONGO_URI;
    mongoose.set(`strictQuery`, true);

    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`${chalk.green(`  Connected to MongoDB!`)}`);
        await initializeClient();
        console.log(`${chalk.green(`  Client initialized!\n`)}`);
    } catch (err) {
        console.log(`${chalk.red(`  Error connecting to MongoDB: ${err}`)}`);
        throw new Error('Database initialization failed.');
    }

    mongoose.connection.on('error', (err) => {
        console.log(`${chalk.red(`Error with MongoDB: ${err}`)}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.log(`${chalk.red(`Disconnected from MongoDB.`)}`);
    });

    mongoose.connection.on('reconnected', () => {
        console.log(`${chalk.green(`Reconnected to MongoDB!`)}`);
    });

    mongoose.connection.on('connecting', () => {
        console.log(`${chalk.yellow(`Connecting to MongoDB...`)}`);
    });
}

// ===============================================
// 2.3: Initialize client
// ===============================================

// 2.3.1: Initialize client
connectToDatabase()
    .then(() => {
        console.log(`${chalk.green(`  Database initialized!`)}`);
    })
    .catch((err) => {
        console.log(`${chalk.red(`  Error initializing: ${err.message}`)}`);
    });