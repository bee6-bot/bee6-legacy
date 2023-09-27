require(`dotenv`).config()
const fs = require(`fs`)
const readFromConsole = require(`./inputUtils.js`)

const {logMessage} = require('./loggingUtils.js')

/**
 * @name envSetup
 * @type {module}
 * @description Check if .env variables for the bot exist. If not, create them.
 */


async function setupEnv() {

    const fileExists = fs.existsSync(`./.env`)

    if (!fileExists) {
        logMessage(`.env file not found! Creating one...`, `WARNING`)
        await fs.writeFileSync(`./.env`,
            `TOKEN="" # Get your token from https://discord.com/developers/applications"\n`
            + `CLIENT_ID="" # Get your client ID from https://discord.com/developers/applications"\n`
            + `MONGO_URI=""# Get your MongoDB URI from https://www.mongodb.com/cloud/atlas, or use a local MongoDB instance"\n`
            + `DEBUG=false`
        )

        logMessage(`.env file created!`, `INFO`)
    } else logMessage(`.env file found!`, `INFO`)


    if (!process.env.TOKEN) {
        logMessage(`No token provided.`, `WARNING`)
        const token = await readFromConsole(`Please enter your bot's token: `)
        fs.writeFileSync(`./.env`, fs.readFileSync(`./.env`).toString().replace(`TOKEN=""`, `TOKEN="${token}"`))
        logMessage(`Token added to .env file.`, `INFO`)
    }
    else logMessage(`Token found!`, `INFO`)


    if (!process.env.CLIENT_ID) {
        logMessage(`No client ID provided.`, `WARNING`)
        const clientId = await readFromConsole(`Please enter your bot's client ID: `)
        fs.writeFileSync(`./.env`, fs.readFileSync(`./.env`).toString().replace(`CLIENT_ID=""`, `CLIENT_ID="${clientId}"`))
        logMessage(`Client ID added to .env file.`, `INFO`)
    } else logMessage(`Client ID found!`, `INFO`)


    if (!process.env.MONGO_URI) {
        logMessage(`No MongoDB URI provided.`, `WARNING`)
        const mongoURI = await readFromConsole(`Please enter your MongoDB URI: `)
        fs.writeFileSync(`./.env`, fs.readFileSync(`./.env`).toString().replace(`MONGO_URI=""`, `MONGO_URI="${mongoURI}"`))
        logMessage(`MongoDB URI added to .env file.`, `INFO`)
    } else logMessage(`MongoDB URI found!`, `INFO`)


    if (!process.env.DEBUG) {
        logMessage(`Debug mode not found!`, `WARNING`)
        const debug = await readFromConsole(`    Do you want to enable debug mode? (y/n): `)
        fs.writeFileSync(`./.env`, fs.readFileSync(`./.env`).toString().replace(`DEBUG=false`, `DEBUG=${debug === `y` ? `true` : `false`}`))
        logMessage(`Debug mode added to .env file.`, `INFO`)
    } else logMessage(`Debug mode found!`, `INFO`)

    logMessage(`.env setup complete!`, `INFO`)
}

module.exports = setupEnv

if (require.main === module) setupEnv()
