const guildModel = require("../../models/guildModel");
const {EmbedBuilder} = require("discord.js");

module.exports = {
    name: 'messageDelete',
    async execute(client, message) {

        let content = `**\`DELETED\`** | ` +
            `<#${message.channel.id}> | ` +
            `**${message.author.tag}** (${message.author.id}) | ` +
            `${message.content}`;

        if (message.attachments.size > 0) {
            content += '\n**Attachments:** ';
            let attachmentNumber = 1;
            message.attachments.forEach(attachment => {
                content += `[Attachment #${attachmentNumber}](${attachment.url}) `;
                attachmentNumber++;
            });
        }

        const guildData = await guildModel.findOne({guildID: message.guild.id});
        const logChannelID = guildData.modLogChannelID;
        const logChannel = message.guild.channels.cache.get(logChannelID);

        if (!logChannel) return;

        await logChannel.send({embeds: [new EmbedBuilder().setDescription(content)]});

    }
}