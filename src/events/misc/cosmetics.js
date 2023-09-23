const {EmbedBuilder} = require("discord.js");
const {getResponsibleUser, getLogChannel} = require("../../functions/utilities/otherUtils");

/**
 * @fileoverview cosmeticLogs
 * @description Logs cosmetic changes (emojis [Done], stickers [Done], etc.) to the mod log channel
 */


const eventInfo = [


    // Emoji
    {
        name: "emojiCreate",
        eventType: "EMOJI CREATED",
        description: "Emoji Created",
        getDescription: async (emoji, client) => {
            return `**\`[EVENT TYPE]\`** | ` +
                `**${emoji.name}** (<:${emoji.name}:${emoji.id}>) | ` +
                `**By:** ${await getResponsibleUser(client, emoji.guild, 'EMOJI_CREATE', emoji.id)}`;
        }
    },
    {
        name: "emojiDelete",
        eventType: "EMOJI DELETED",
        description: "Emoji Deleted",
        getDescription: async (emoji, client) => {
            // get img url
            console.log(emoji)
            return `**\`[EVENT TYPE]\`** | ` +
                `**${emoji.name}** ([View Image](${emoji.url})) | ` +
                `**By:** ${await getResponsibleUser(client, emoji.guild, 'EMOJI_DELETE', emoji.id)}`;
        }
    },
    {
        name: "emojiUpdate",
        eventType: "EMOJI UPDATED",
        description: "Emoji Updated",
        getDescription: async (oldEmoji, newEmoji, client) => {
            return `**\`[EVENT TYPE]\`** | ` +
                `**${newEmoji.name}** (<:${newEmoji.name}:${newEmoji.id}>)` +
                `${oldEmoji.name !== newEmoji.name ? `\n**Name:** ${oldEmoji.name} -> ${newEmoji.name}` : ''}` +
                ` | **By:** ${await getResponsibleUser(client, newEmoji.guild, 'EMOJI_UPDATE', newEmoji.id)}`;
        }
    },

    // Sticker
    {
        name: "stickerCreate",
        eventType: "STICKER CREATED",
        description: "Sticker Created",
        getDescription: async (sticker, client) => {
            return `**\`[EVENT TYPE]\`** | ` +
                `**${sticker.name}** ([View Image](${sticker.url})) | ` +
                `**By:** ${await getResponsibleUser(client, sticker.guild, 'STICKER_CREATE', sticker.id)}`;
        }
    },
    {
        name: "stickerDelete",
        eventType: "STICKER DELETED",
        description: "Sticker Deleted",
        getDescription: async (sticker, client) => {
            return `**\`[EVENT TYPE]\`** | ` +
                `**${sticker.name}** ([View Image](${sticker.url})) | ` +
                `**By:** ${await getResponsibleUser(client, sticker.guild, 'STICKER_DELETE', sticker.id)}`;
        }
    },
    {
        name: "stickerUpdate",
        eventType: "STICKER UPDATED",
        description: "Sticker Updated",
        getDescription: async (oldSticker, newSticker, client) => {
            return `**\`[EVENT TYPE]\`** | ` +
                `**${newSticker.name}** ([View Image](${newSticker.url}))` +
                `${oldSticker.name !== newSticker.name ? `\n**Name:** ${oldSticker.name} -> ${newSticker.name}` : ''}` +
                ` | **By:** ${await getResponsibleUser(client, newSticker.guild, 'STICKER_UPDATE', newSticker.id)}`;
        }
    }
];

module.exports = eventInfo.map(event => ({
    name: event.name,
    async execute(client, ...args) {
        const logChannel = await getLogChannel(args[0].guild);
        if (!logChannel) return;

        const content = await event.getDescription(...args, client)
        await logChannel.send({embeds: [new EmbedBuilder().setDescription(content.replace('[EVENT TYPE]', event.eventType))]})
    }
}));