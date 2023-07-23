require(`dotenv`).config()
const fs = require(`fs`)
const readFromConsole = require(`../../functions/helpers/readInput.js`)
const chalk = require('chalk')

/**
 * @name envSetup
 * @type {module}
 * @description Check if .env variables for the bot exist. If not, create them.
 */


async function setupEnv() {

    const fileExists = fs.existsSync(`./.env`)

    if (!fileExists) {
        console.log(`${chalk.yellow(`.env file not found! Creating one.`)}`)
        await fs.writeFileSync(`./.env`,
            `TOKEN="" # Get your token from https://discord.com/developers/applications"\n`
            + `CLIENT_ID="" # Get your client ID from https://discord.com/developers/applications"\n`
            + `MONGO_URI=""# Get your MongoDB URI from https://www.mongodb.com/cloud/atlas, or use a local MongoDB instance"\n`
            + `DEBUG=false`
        )

        console.log(`${chalk.green(`.env file created.`)}`)
    } else {
        console.log(`${chalk.green(`.env file found!`)}`)
    }

    if (!process.env.TOKEN) {
        console.log(`${chalk.red(`  No token provided.`)}`)
        const token = await readFromConsole(`    Please enter your bot's token: `)
        fs.writeFileSync(`./.env`, fs.readFileSync(`./.env`).toString().replace(`TOKEN=""`, `TOKEN="${token}"`))
        console.log(`${chalk.green(`  Token added to .env file.`)}`)
    }
    else {
        console.log(`${chalk.green(`  Token found!`)}`)
    }

    if (!process.env.CLIENT_ID) {
        console.log(`${chalk.red(`  No client ID provided.`)}`)
        const clientId = await readFromConsole(`    Please enter your bot's client ID: `)
        fs.writeFileSync(`./.env`, fs.readFileSync(`./.env`).toString().replace(`CLIENT_ID=""`, `CLIENT_ID="${clientId}"`))
        console.log(`${chalk.green(`  Client ID added to .env file.`)}`)
    } else {
        console.log(`${chalk.green(`  Client ID found!`)}`)
    }

    if (!process.env.MONGO_URI) {
        console.log(`${chalk.red(`  No MongoDB URI provided.`)}`)
        const mongoURI = await readFromConsole(`    Please enter your MongoDB URI: `)
        fs.writeFileSync(`./.env`, fs.readFileSync(`./.env`).toString().replace(`MONGO_URI=""`, `MONGO_URI="${mongoURI}"`))
        console.log(`${chalk.green(`  MongoDB URI added to .env file.`)}`)
    } else {
        console.log(`${chalk.green(`  MongoDB URI found!`)}`)
    }

    if (!process.env.DEBUG) {
        console.log(`${chalk.red(`  No debug mode provided.`)}`)
        const debug = await readFromConsole(`    Do you want to enable debug mode? (y/n): `)
        fs.writeFileSync(`./.env`, fs.readFileSync(`./.env`).toString().replace(`DEBUG=false`, `DEBUG=${debug === `y` ? `true` : `false`}`))
        console.log(`${chalk.green(`  Debug mode added to .env file.`)}`)
    }  else {
        console.log(`${chalk.green(`  Debug mode found!`)}`)
    }
    
    

}

module.exports = setupEnv