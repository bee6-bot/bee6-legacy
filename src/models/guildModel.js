const mongoose = require('mongoose')

// Extra fields:
// - protected bool: Whether the field should be protected from being edited by users, won't be shown in autocomplete
// - notes str: Extra notes about the field, shown in autocomplete
// - description str: The description of the field, shown in the help command
// - categories arr: The categories of the field, shown in the help command

const guildSchema = new mongoose.Schema({
    // General
    guildID: {type: String, required: true, index: true, protected: true, categories: ['general']},
    language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh-CN', 'zh-TW'],
        categories: ['general']
    },
    disabledCommands: {type: Array, default: [], categories: ['general']},
    miscSettings: {
        private: {type: Boolean, default: true, categories: ['general']}, // Whether to hide the guild from the API
    },
    tags: {type: Array, categories: ['general']},

    // Cooldowns
    workCooldown: {type: Number, default: 180000, categories: ['cooldowns']},
    robCooldown: {type: Number, default: 300000, categories: ['cooldowns']},
    gambleCooldown: {type: Number, default: 300000, categories: ['cooldowns']},

    // XP
    xp: {type: Boolean, default: true, categories: ['xp']},
    lastMee6Sync: {type: Number, default: 0, protected: true, categories: ['xp']},
    mee6Syncing: {type: Boolean, default: false, protected: true, categories: ['xp']},
    xpIgnore: {
        channels: {type: Array, default: []},
        roles: {type: Array, default: []},
        users: {type: Array, default: []}
    },
    xpCooldown: {
        type: Number,
        default: 60000,
        categories: ['xp'],
        notes: 'The cooldown between XP gain (in milliseconds)'
    }, // Intended for dynamic XP cooldown (based on guild activity), yet to be implemented, in ms


    // Welcome
    welcome: {type: Boolean, default: false, categories: ['welcome', 'member_events']},
    welcomeChannelID: {type: String, default: '', categories: ['welcome', 'member_events']},
    welcomeMessage: {
        type: String,
        default: 'Hey, {{user}}! Welcome to **{{guild}}**! You are the **{{memberCount}}th** member!',
        categories: ['welcome', 'member_events'],
    },
    welcomeEmbed: {type: Boolean, default: false, categories: ['welcome', 'member_events']},
    welcomeImage: {type: String, default: '', categories: ['welcome', 'member_events']},

    // Leave
    leave: {type: Boolean, default: false, categories: ['leave', 'member_events']},
    leaveChannelID: {type: String, default: '', categories: ['leave', 'member_events']},
    leaveMessage: {
        type: String,
        default: `Oh no, **{{user}}** left {{guild}}! We're down to **{{memberCount}}** members!`,
        categories: ['leave', 'member_events']
    },
    leaveEmbed: {type: Boolean, default: false, categories: ['leave', 'member_events']},
    leaveImage: {type: String, default: '', categories: ['leave', 'member_events']},

    // Moderation
    mutedRoleID: {type: String, default: '', categories: ['moderation']},
    modLogChannelID: {type: String, default: '', categories: ['moderation', 'logs']},
    modLog: {type: Boolean, default: false, categories: ['moderation', 'logs']},
    continuousMessageLogging: {
        type: Boolean,
        default: false,
        categories: ['moderation', 'continuous_message_logging', 'logs'],
        notes: 'Whether to log messages continuously',
        description: 'Continuous Message Logging will log every message sent in the server to the Continuous Message' +
            'Logging Channel. This may be useful in large servers with a lot of threads/posts.'
    },

    continuousMessageLoggingChannelID: {
        type: String,
        default: '',
        categories: ['moderation', 'continuous_message_logging', 'logs'],
        notes: 'The channel to log messages to',
    },

    modLogIgnore: {
        channels: {type: Array, default: []},
        roles: {type: Array, default: []},
        users: {type: Array, default: []},
        events: {type: Array, default: []}
    },

    // AutoMod - Kind of redundant due to Discord adding their own auto-mod system.
    //           This functionality likely won't be implemented
    autoMod: {type: Boolean, default: false, categories: ['auto_mod']},
    autoModIgnore: {
        channels: {type: Array, default: [], categories: ['auto_mod']},
        roles: {type: Array, default: [], categories: ['auto_mod']},
        users: {type: Array, default: [], categories: ['auto_mod']}
    },
    autoModTrigger: {
        swearWords: {type: Array, default: [], categories: ['auto_mod']},
        links: {type: Array, default: [], categories: ['auto_mod']},
    },

    // Polls
    polls: {type: Boolean, default: false, categories: ['polls']},
    pollChannelID: {type: String, default: '', categories: ['polls']},
    pollPermissions: {type: Array, default: [], categories: ['polls']},
    pollCooldown: {type: Number, default: 0, categories: ['polls']},
});


guildSchema.index({guildID: 1}, {unique: true})
module.exports = mongoose.model('Guild', guildSchema)
