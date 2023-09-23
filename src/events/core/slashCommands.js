require('dotenv').config();
const {logMessage} = require('../../functions/utilities/core/loggingUtils');
logMessage(`Hello, world! From handleCommands.js`, `INFO`);

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {

        logMessage(`Interaction received`, `INFO`);

        // Check if the user is a bot
        console.log(interaction)
        if (interaction.user.bot) return;

        if (interaction.isModalSubmit()) {

            const id = interaction.customId;

            if (id.startsWith('run-code_')) {
                const language = id.split('_')[1];
                const code = interaction.fields.getTextInputValue(`run-code-input`)
                const output = await runCode(language, code);

                const embed = new EmbedBuilder()
                    .setAuthor({name: `Made possible by Piston`, url: `https://github.com/engineer-man/piston`})
                    .setTitle(`${output.language} ${output.version} | Your code`)
                    .setDescription(`\`\`\`js\n${code}\`\`\``)
                    .setColor('#00ff00')

                const outputEmbed = new EmbedBuilder()
                    .setTitle(`Output`)
                    .setDescription(`\`\`\`${output.run.output}\`\`\``)
                    .setColor('#00ff00')

                if (output.run.output === '') outputEmbed.setDescription(`\`\`\`No output\`\`\``)

                await interaction.reply({embeds: [embed, outputEmbed], ephemeral: false});

            }
        }
        else if (interaction.isCommand()) {

            logMessage(`Command interaction received`, `INFO`);

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

            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

            try {
                logMessage(`Running command ${command.data.name}`, `INFO`);
                await command.execute(interaction, client);
            } catch (error) {
                logMessage(`Error running command ${command.data.name}: ${error.stack}`, `ERROR`);
                await interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
            }

        }
    }
}
