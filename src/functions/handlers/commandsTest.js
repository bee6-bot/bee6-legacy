const {readdirSync} = require("fs");
const {join} = require("path");

require('dotenv').config();
const {logMessage} = require('../utilities/core/loggingUtils');

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

    client.on('interactionCreate', async interaction => {
        if (interaction.user.bot) return;
        console.log(`Interaction received`);

        if (interaction.isCommand()) {

            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error.stack);
                await interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
            }
        }
    });
}
