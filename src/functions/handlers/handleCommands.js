require('dotenv').config();
const {logMessage} = require('../helpers/logging');
logMessage(`Hello, world! From handleCommands.js`, `INFO`);

const {REST, Routes} = require('discord.js');
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
 * @param {Object} client Discord client
 */

module.exports = async (client) => {

    const {readdirSync} = require('fs');
    const {join} = require('path');
    const commandFiles = readdirSync(join(__dirname, '../../commands')).filter(file => file.endsWith('.js'));

    await (async () => {
        for (const file of commandFiles) {
            const command = require(`../../commands/${file}`);
            await client.commands.set(command.data.name, command);
            logMessage(`Loaded command ${command.data.name}`, `INFO`);
        }

        await registerSlashCommands(client, client.commands.map(command => command.data.toJSON()));
        logMessage(`Registered slash commands`, `INFO`);
    })();

    client.on('interactionCreate', async interaction => {

        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

        try {
            logMessage(`Running command ${command.name}`, `INFO`);
            await command.execute(interaction, client);
        } catch (error) {
            logMessage(`Error running command ${command.name}: ${error.stack}`, `ERROR`);
            await interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
        }

    });

}

