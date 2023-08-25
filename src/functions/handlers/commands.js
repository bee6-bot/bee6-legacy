require('dotenv').config();
const {logMessage} = require('../utilities/loggingUtils');
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

    client.on('interactionCreate', async interaction => {

        // Check if the user is a bot
        if (interaction.user.bot) return;

        // Check if both the user and guild are in the database
        const userModel = require(`../../models/userModel`);
        const guildModel = require(`../../models/guildModel`);

        async function createUser() {
            logMessage(`User ${interaction.user.id} not found in database.`, `WARNING`);
            try {
                const newUser = await new userModel({
                    userID: interaction.user.id,
                    guildID: interaction.guild.id
                });
                await newUser.save();
            } catch (error) {
                logMessage(`Error creating user ${interaction.user.id}: ${error.stack}`, `ERROR`);
                await interaction.reply({
                    content: 'Whoops! Something went wrong. The user could not be created.',
                    ephemeral: true
                });
            }

        }

        async function createGuild() {
            logMessage(`Guild ${interaction.guild.id} not found in database.`, `WARNING`);
            try {
                const newGuild = await new guildModel({
                    guildID: interaction.guild.id,
                    welcomeChannel: interaction.guild.systemChannelId,
                    welcomeMessage: `Welcome to the server, {{user}}!`,
                    leaveChannel: interaction.guild.systemChannelId,
                    leaveMessage: `{{user}} has left the server.`
                });
                await newGuild.save();
            } catch (error) {
                logMessage(`Error creating guild ${interaction.guild.id}: ${error.stack}`, `ERROR`);
                await interaction.reply({
                    content: 'Whoops! Something went wrong. The guild could not be created.',
                    ephemeral: true
                });
            }
        }

        // Check if the guild is in the database
        const guild = await guildModel.findOne({guildID: interaction.guild.id});
        if (guild === null) await createGuild();

        // Check if the user is in the database
        const user = await userModel.findOne({userID: interaction.user.id, guildID: interaction.guild.id});
        if (user === null) await createUser();

        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

        try {
            logMessage(`Running command ${command.data.name}`, `INFO`);
            await command.execute(interaction, client);
        } catch (error) {
            logMessage(`Error running command ${command.data.name}: ${error.stack}`, `ERROR`);
            await interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
        }
    });
}
