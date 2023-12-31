const {EmbedBuilder} = require("discord.js");

module.exports = {
    name: 'messageUpdate',
    async execute(client, newMessage, oldMessage) {

        const guildModel = require("../../models/guildModel");
        if (newMessage.content === oldMessage.content) return;
        if (newMessage.author.bot) return;

        let content = `**\`EDITED\`** | ` +
            `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id} | ` +
            `**${newMessage.author.tag}** (${newMessage.author.id})` +
            `\n**Before:** ${newMessage.content} | ` +
            `\n**After:** ${oldMessage.content}`;

        if (newMessage.attachments.size > 0) {
            content += '\n**Attachments:** ';
            let attachmentNumber = 1;
            newMessage.attachments.forEach(attachment => {
                content += `[Attachment #${attachmentNumber}](${attachment.url}) `;
                attachmentNumber++;
            });
        }

        const guildData = await guildModel.findOne({guildID: newMessage.guild.id});
        const logChannelID = guildData.modLogChannelID;
        const logChannel = newMessage.guild.channels.cache.get(logChannelID);

        if (!logChannel) return;

        await logChannel.send({embeds: [new EmbedBuilder().setDescription(content)]});

    }
}