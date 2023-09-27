const mongoose = require('mongoose')

const guildSchema = new mongoose.Schema({

    // General
    guildID: {type: String, required: true, index: true},
    language: {type: String, default: 'en'}, // Unused
    disabledCommands: {type: Array, default: []},

    // Moderation
    mutedRoleID: {type: String, default: ''},
    modLogChannelID: {type: String, default: ''},
    modLog: {type: Boolean, default: false},
    continuousMessageLogging: {type: Boolean, default: false},
    continuousMessageLoggingChannelID: {type: String, default: ''},
    modLogIgnore: {
        channels: {type: Array, default: []},
        roles: {type: Array, default: []},
        users: {type: Array, default: []},
        events: {type: Array, default: []}
    },

    // Cooldowns
    workCooldown: {type: Number, default: 180000}, // 3 minutes
    robCooldown: {type: Number, default: 300000}, // 5 minute
    gambleCooldown: {type: Number, default: 300000}, // 5 minutes

    // XP
    xp: {type: Boolean, default: true},
    lastMee6Sync: {type: Number, default: 0},
    mee6Syncing: {type: Boolean, default: false},
    xpIgnore: {
        channels: {type: Array, default: []},
        roles: {type: Array, default: []},
        users: {type: Array, default: []}
    },
    xpCooldown: {type: Number, default: 60}, // Intended for dynamic XP cooldown (based on guild activity), yet to be implemented


    // Welcome
    welcome: {type: Boolean, default: false},
    welcomeChannelID: {type: String, default: ''},
    welcomeMessage: {
        type: String,
        default: 'Hey, {{user}}! Welcome to **{{guild}}**! You are the **{{memberCount}}th** member!'
    },
    welcomeEmbed: {type: Boolean, default: false},
    welcomeImage: {type: String, default: ''},

    // Leave
    leave: {type: Boolean, default: false},
    leaveChannelID: {type: String, default: ''},
    leaveMessage: {
        type: String,
        default: `Oh no, **{{user}}** left {{guild}! We're down to **{{memberCount}}** members!`
    },
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
