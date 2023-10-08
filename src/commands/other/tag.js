const {SlashCommandBuilder} = require('discord.js');
const guildModel = require('../../models/guildModel');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Manage tags.')
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Add a tag.')
            .addStringOption(option => option.setName('name').setDescription('The name of the tag.').setRequired(true).setAutocomplete(true))
            .addStringOption(option => option.setName('content').setDescription('The content of the tag.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove a tag.')
            .addStringOption(option => option.setName('name').setDescription('The name of the tag.').setRequired(true).setAutocomplete(true))
        )
        .addSubcommand(subcommand => subcommand
            .setName('edit')
            .setDescription('Edit a tag.')
            .addStringOption(option => option.setName('name').setDescription('The name of the tag.').setRequired(true).setAutocomplete(true))
            .addStringOption(option => option.setName('content').setDescription('The content of the tag.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('List all tags.')
        )
        .addSubcommand(subcommand => subcommand
            .setName('get')
            .setDescription('Get a tag.')
            .addStringOption(option => option.setName('name').setDescription('The name of the tag.').setRequired(true).setAutocomplete(true))
        ),

    // autocomplete
    async autocomplete(interaction) {

        const subcommand = interaction.options.getSubcommand();
        const name = interaction.options.getString('name');

        if (subcommand === 'remove' || subcommand === 'edit' || subcommand === 'get') {
            const guild = await guildModel.findOne({guildID: interaction.guild.id});
            const tags = guild.tags;
            const tagNames = tags.map(tag => tag.name);
            const filtered = tagNames.filter(tagName => tagName.includes(name));
            await interaction.respond(
                filtered.map(tagName => ({name: tagName, value: tagName}))
            );
        }
    },

    async execute(interaction) {

        try {
            const subcommand = interaction.options.getSubcommand();
            const name = interaction.options.getString('name');
            const content = interaction.options.getString('content');

            const guild = await guildModel.findOne({guildID: interaction.guild.id});
            const tags = guild.tags;

            const tag = {
                name: name,
                content: content
            };

            if (subcommand === 'add') {
                if (tags.find(tag => tag.name === name)) {
                    return await interaction.reply({content: `A tag with that name already exists.`, ephemeral: true});
                } else {
                    tags.push(tag);
                    guild.tags = tags;
                    await guild.save();
                    return await interaction.reply({content: `Added tag \`${name}\`.`, ephemeral: true});
                }
            } else if (subcommand === 'remove') {
                if (tags.find(tag => tag.name === name)) {
                    const newTags = tags.filter(tag => tag.name !== name);
                    guild.tags = newTags;
                    await guild.save();
                    return await interaction.reply({content: `Removed tag \`${name}\`.`, ephemeral: true});
                } else {
                    return await interaction.reply({content: `A tag with that name does not exist.`, ephemeral: true});
                }
            } else if (subcommand === 'edit') {
                if (tags.find(tag => tag.name === name)) {
                    const newTags = tags.filter(tag => tag.name !== name);
                    newTags.push(tag);
                    guild.tags = newTags;
                    await guild.save();
                    return await interaction.reply({content: `Edited tag \`${name}\`.`, ephemeral: true});
                } else {
                    return await interaction.reply({content: `A tag with that name does not exist.`, ephemeral: true});
                }
            } else if (subcommand === 'list') {
                if (tags.length === 0) {
                    return await interaction.reply({content: `There are no tags.`, ephemeral: true});
                } else {
                    const tagNames = tags.map(tag => tag.name);
                    return await interaction.reply({content: `Tags: \`${tagNames.join(', ')}\``, ephemeral: true});
                }
            } else if (subcommand === 'get') {
                if (tags.find(tag => tag.name === name)) {
                    const tag = tags.find(tag => tag.name === name);
                    return await interaction.reply({
                        content: `# ${tag.name}\n>>> ${tag.content}`
                        , ephemeral: false});
                } else {
                    return await interaction.reply({content: `A tag with that name does not exist.`, ephemeral: true});
                }
            } else {
                return await interaction.reply({content: `An error occurred.`, ephemeral: true});
            }
        } catch (error) {
            console.log(error)
        }

    }
}