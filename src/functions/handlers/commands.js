require('dotenv').config();
const {logMessage} = require('../utilities/core/loggingUtils');
logMessage(`Hello, world! From handleCommands.js`, `INFO`);

const {REST, Routes, EmbedBuilder} = require('discord.js');
const token = process.env.TOKEN, clientId = process.env.CLIENT_ID;
const rest = new REST({version: '9'}).setToken(token);

/**
 * @name registerSlashCommands
 * @type {module}
 * @description Register slash commands
 * @param {Object} client Discord client
 * @param {Array} commands Array of commands to register
 */

async function registerSlashCommands(client, commands) {
    try {
        logMessage(`Started refreshing application (/) commands.`, `INFO`);
        await rest.put(
            Routes.applicationCommands(clientId),
            {body: commands},
        );
        logMessage(`Successfully reloaded application (/) commands.`, `INFO`);
    } catch (error) {
        logMessage(`Error refreshing application (/) commands: ${error}`, `ERROR`);
    }
}

/**
 * @name handleCommandInteractions
 * @type {module}
 * @description Handle command interactions and register slash commands
 * @param language
 * @param code
 */

async function runCode(language, code) {

    const url = 'https://emkc.org/api/v2/piston/execute';

    const body = {
        language: language,
        version: '*',
        stdin: '',
        files: [{name: 'code.js', content: code}]
    }

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return await response.json()

}

module.exports = async (client) => {

    const {readdirSync} = require('fs');
    const {join} = require('path');
    const commandDirs = readdirSync(join(__dirname, '../../commands'));

    for (const dir of commandDirs) {
        const commands = readdirSync(join(__dirname, '../../commands', dir)).filter(file => file.endsWith('.js'));
        for (const file of commands) {
            const command = require(`../../commands/${dir}/${file}`);
            await client.commands.set(command.data.name, command);
            client.commandArray.push(command.data.toJSON());
        }
    }

    await registerSlashCommands(client, client.commands.map(command => command.data.toJSON()));
    logMessage(`Registered slash commands`, `INFO`);
}

