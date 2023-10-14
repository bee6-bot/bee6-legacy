/**
 * @fileoverview This file handles the registration of slash commands.
 */

require('dotenv').config();
const {logMessage} = require('../utilities/core/loggingUtils');
logMessage(`Hello, world! From handleCommands.js`, `INFO`);


const {REST, Routes, EmbedBuilder} = require('discord.js');
const guildModel = require("../../models/guildModel");
const userModel = require("../../models/userModel");
const token = process.env.DEV_MODE === 'true' ? process.env.DEV_TOKEN : process.env.TOKEN;
const clientId = process.env.DEV_MODE === 'true' ? process.env.DEV_CLIENT_ID : process.env.CLIENT_ID;
const rest = new REST({version: '9'}).setToken(token);

require('dotenv').config();

/**
 * @name Registers slash commands for a Discord client.
 * @param {Object} client - The Discord client object.
 * @param {Array} commands - An array of commands to register.
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
 * @name Handles executing the provided code in a specified programming language.
 * @param {string} language - The programming language for code execution.
 * @param {string} code - The code to be executed.
 * @returns {Promise<Object>} - A promise that resolves to the execution response.
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

/**
 * @name Creates a user if not found in the database.
 * @param {Object} interaction - The interaction object.
 */
async function createUserIfNotFound(interaction) {
    const userModel = require('../../models/userModel');

    try {
        await userModel.create({
            userID: interaction.user.id,
            guildID: interaction.guild.id
        });
    } catch (error) {
        logMessage(`Error creating user: ${error.stack}`, 'ERROR');
        return interaction.reply({ content: 'Whoops! Something went wrong.', ephemeral: true });
    }
}


/**
 * @name Creates a guild if not found in the database.
 * @param {Object} interaction - The interaction object.
 */

async function createGuildIfNotFound(interaction) {
    const guildModel = require('../../models/guildModel');

    try {
        await guildModel.create({
            guildID: interaction.guild.id,
            welcomeChannel: interaction.guild.systemChannelId,
            welcomeMessage: 'Welcome to the server, {{user}}!',
            leaveChannel: interaction.guild.systemChannelId,
            leaveMessage: '{{user}} has left the server.'
        });
    } catch (error) {
        logMessage(`Error creating guild: ${error.stack}`, 'ERROR');
        return interaction.reply({ content: 'Whoops! Something went wrong.', ephemeral: true });
    }
}

module.exports = async (client) => {

    const {readdirSync} = require('fs');
    const {join} = require('path');
    const commandDirs = readdirSync(join(__dirname, '../../commands'));

    for (const dir of commandDirs) {
        const commands = readdirSync(join(__dirname, '../../commands', dir)).filter(file => file.endsWith('.js'));
        for (const file of commands) {
            const command = require(`../../commands/${dir}/${file}`);
            const commandName = process.env.DEV_MODE === 'true' ? `${process.env.DEV_CMD_PREFIX}${command.data.name}` : `${process.env.CMD_PREFIX}${command.data.name}`;
            command.data.name = commandName;
            logMessage(`    Registered command ${commandName}`, 'INFO');
            await client.commands.set(commandName, command);
            client.commandArray.push(command.data.toJSON());
        }
    }

    await registerSlashCommands(client, client.commands.map(command => command.data.toJSON()));
    logMessage(`Registered slash commands`, `INFO`);

    client.on('interactionCreate', async interaction => {

        if (interaction.user.bot) return;

        if (interaction.isChatInputCommand()) {
            logMessage('Command interaction received', 'INFO');

            // Check if X exists
            const guild = await guildModel.findOne({guildID: interaction.guild.id});
            if (!guild) await createGuildIfNotFound(interaction);

            const user = await userModel.findOne({userID: interaction.user.id, guildID: interaction.guild.id});
            if (!user) await createUserIfNotFound(interaction);

            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({content: 'Whoops! That command doesn\'t seem to exist.', ephemeral: true});

            try {
                logMessage(`    Running command ${command.data.name}`, 'INFO');
                await command.execute(interaction, client);
            } catch (error) {
                logMessage(`    Error running command ${command.data.name}`, 'ERROR');
                logMessage(`    ${error.stack}`, 'ERROR');
                await interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
            }
        }
        else if (interaction.isModalSubmit()) {
            const id = interaction.customId;

            if (!id.startsWith('run-code_')) return;

            const language = id.split('_')[1];
            const code = interaction.fields.getTextInputValue('run-code-input');
            const output = await runCode(language, code);

            // noinspection JSCheckFunctionSignatures
            const embed = new EmbedBuilder()
                .setAuthor({name: 'Made possible by Piston', url: 'https://github.com/engineer-man/piston'})
                .setTitle(`${output.language} ${output.version} | Your code`)
                .setDescription(`\`\`\`js\n${code}\`\`\``)
                .setColor('#00ff00');

            const outputEmbed = new EmbedBuilder()
                .setTitle('Output')
                .setDescription(output.run.output || 'No output')
                .setColor('#00ff00');

            await interaction.reply({embeds: [embed, outputEmbed], ephemeral: false});
        }
        else if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

            try {
                await command.autocomplete(interaction, client);
            } catch (error) {
                await interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
            }
        }
        else if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);
            if (!button) return interaction.reply({ content: 'Whoops! Something went wrong.', ephemeral: true });

            try {
                logMessage(`Running button ${button.name}`, `INFO`)
                await button.execute(interaction, client);
            } catch (error) {
                logMessage(`Error running button ${button.name}: ${error}`, `ERROR`)
                await interaction.reply({ content: 'Whoops! Something went wrong.', ephemeral: true });
            }
        }
        else {
            logMessage(`Unhandled interaction type: ${interaction.type}`, 'WARNING');
            return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
        }
    });
}

