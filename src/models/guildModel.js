const mongoose = require('mongoose')

const guildSchema = new mongoose.Schema({

    // General
    guildID: {type: String, required: true, index: true},
    language: {type: String, default: 'en'},
    disabledCommands: {type: Array, default: []},

    // Moderation
    mutedRoleID: {type: String, default: ''},
    modLogChannelID: {type: String, default: ''},
    modLog: {type: Boolean, default: false},
    modLogIgnore: {
        channels: {type: Array, default: []},
        roles: {type: Array, default: []},
        users: {type: Array, default: []},
        events: {type: Array, default: []}
    },

    // Welcome
    welcome: {type: Boolean, default: false},
    welcomeChannelID: {type: String, default: ''},
    welcomeMessage: {type: String, default: ''},
    welcomeEmbed: {type: Boolean, default: false},
    welcomeImage: {type: String, default: ''},

    // Leave
    leave: {type: Boolean, default: false},
    leaveChannelID: {type: String, default: ''},
    leaveMessage: {type: String, default: ''},
    leaveEmbed: {type: Boolean, default: false},
    leaveImage: {type: String, default: ''},

    // AutoMod - Kind of redundant due to Discord adding their own auto-mod system.
    //           This functionality likely won't be implemented
    autoMod: {type: Boolean, default: false},
    autoModIgnore: {
        channels: {type: Array, default: []},
        roles: {type: Array, default: []},
        users: {type: Array, default: []}
    },
    autoModTrigger: {
        swearWords: {type: Array, default: []},
        links: {type: Array, default: []},
    },

    // Polls
    polls: {type: Boolean, default: false},
    pollChannelID: {type: String, default: ''},
    pollPermissions: {type: Array, default: []},
    pollCooldown: {type: Number, default: 0},
})

guildSchema.index({guildID: 1}, {unique: true})
module.exports = mongoose.model('Guild', guildSchema)