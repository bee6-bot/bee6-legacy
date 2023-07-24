const mongoose = require('mongoose');

const customCommandSchema = new mongoose.Schema({

    // General
    guildID: { type: String, required: true },

    // Command Info
    commandName: { type: String, required: true },
    commandResponse: { type: String, required: true },
    commandDescription: { type: String, required: true },
    commandCategory: { type: String, required: true },
    commandEnabled: { type: Boolean, required: true },

    // Command Cooldown
    commandCooldownEnabled: { type: Boolean, required: true },
    commandCooldown: { type: Number, required: true },

    // Command Permissions
    commandPermissionLevel: { type: Number, required: true },
    commandPermissionRoles: { type: Array, required: true },
    commandPermissionUsers: { type: Array, required: true },

    // Command Channel Restrictions
    commandChannelRestrictionsEnabled: { type: Boolean, required: true },
    commandChannelRestrictions: { type: Array, required: true }
});

module.exports = mongoose.model('customCommand', customCommandSchema);
