require('dotenv').config();
const {logMessage} = require('../../functions/utilities/core/loggingUtils');
const guildModel = require('../../models/guildModel');
const userModel = require('../../models/userModel');
const {EmbedBuilder} = require("discord.js");
logMessage(`Hello, world! From handleCommands.js`, `INFO`);

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

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        logMessage('Interaction received', 'INFO');

        if (interaction.user.bot) return;

        if (interaction.isModalSubmit()) {
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
        } else if (interaction.isCommand()) {
            logMessage('Command interaction received', 'INFO');

            const guild = await guildModel.findOne({guildID: interaction.guild.id});
            if (!guild) await createGuildIfNotFound(interaction);

            const user = await userModel.findOne({userID: interaction.user.id, guildID: interaction.guild.id});
            if (!user) await createUserIfNotFound(interaction);

            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

            try {
                logMessage(`Running command ${command.data.name}`, 'INFO');
                await command.execute(interaction, client);
            } catch (error) {
                logMessage(`Error running command ${command.data.name}: ${error.stack}`, 'ERROR');
                await interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
            }
        } else if (interaction.isAutocomplete()) {
            logMessage('Autocomplete interaction received', 'INFO');
            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

            try {
                logMessage(`Running autocomplete for ${command.data.name}`, 'INFO');
                await command.autocomplete(interaction, client);
            } catch (error) {
                logMessage(`Error running autocomplete for ${command.data.name}: ${error.stack}`, 'ERROR');
                await interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
            }
        }
    }
}
