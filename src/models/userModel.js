const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    // General
    userID: {type: String, required: true, index: true},
    guildID: {type: String, required: true, index: true},
    joinedAt: {type: Date, default: Date.now(), index: true},
    lastSeen: {type: Date, default: Date.now()},
    muted: {type: Boolean, default: false},
    mutedData: {type: Object, default: {}},

    // Bot
    isBotDeveloper: {type: Boolean, default: false},
    isBotContributor: {type: Boolean, default: false},
    isBotDonater: {type: Boolean, default: false},

    // Leveling
    level: {type: Number, default: 0},
    totalXP: {type: Number, default: 0}, // Total XP ever earned
    xp: {type: Number, default: 0}, // Total XP at current level
    xpNeeded: {type: Number, default: 110}, // XP needed to level up

    // Economy
    cash: {type: Number, default: 0},
    bank: {type: Number, default: 5000.00},
    inventory: {type: Array, default: []},

    // Stats
    messages: {type: Number, default: 0},
    commands: {type: Number, default: 0},
    polls: {type: Number, default: 0},
    moneyEarned: {type: Number, default: 0},
    moneySpent: {type: Number, default: 0},
    moneyGambled: {type: Number, default: 0},
    moneyRobbed: {type: Number, default: 0}, // How much money the user has robbed from others
    moneyRobbedFrom: {type: Number, default: 0}, // How much money the user has been robbed for
    moneyGiven: {type: Number, default: 0},

    // Moderation
    isModerator: {type: Boolean, default: false},
    isAdministrator: {type: Boolean, default: false},
    isOwner: {type: Boolean, default: false},
    warnings: {type: Array, default: []},
    kicks: {type: Array, default: []},
    bans: {type: Array, default: []},
    mutes: {type: Array, default: []},
    infractions: {type: Array, default: 0},

    // Fun
    favoriteColour: {type: String, default: 'None'},
    favoriteAnimal: {type: String, default: 'None'},
    favoriteFood: {type: String, default: 'None'},
    favoriteGame: {type: String, default: 'None'},
    favoriteMovie: {type: String, default: 'None'},
    favoriteShow: {type: String, default: 'None'},

    // Preferences
    preferences: {
        // General
        compactMode: {type: Boolean, default: false}, // Whether to use compact mode or not (typically uses plain messages instead of embeds, not yet implemented)
        moderationDMs: {type: Boolean, default: true}, // Get DMs when you are warned, kicked, banned, etc.

        // Leveling
        levelUpMessages: {type: Boolean, default: true},
        levelUpDMs: {type: Boolean, default: false}, // Send level up message in DMs
    },

    // Social Media
    socialNotifications: {
        twitterNotifications: {type: Boolean, default: false},
        twitterUsers: {type: Array, default: []},
        youtubeNotifications: {type: Boolean, default: false},
        youtubeUsers: {type: Array, default: []},
        twitchNotifications: {type: Boolean, default: false},
        twitchUsers: {type: Array, default: []},
        redditNotifications: {type: Boolean, default: false},
        redditUsers: {type: Array, default: []}
    },
    socialUsernames: {
        twitter: {type: String, default: 'None'},
        youtube: {type: String, default: 'None'},
        twitch: {type: String, default: 'None'},
        reddit: {type: String, default: 'None'},

        instagram: {type: String, default: 'None'},
        facebook: {type: String, default: 'None'},
        tiktok: {type: String, default: 'None'},
        snapchat: {type: String, default: 'None'},
        linkedin: {type: String, default: 'None'},
        github: {type: String, default: 'None'},
        pinterest: {type: String, default: 'None'},
        soundcloud: {type: String, default: 'None'},
        spotify: {type: String, default: 'None'},
        steam: {type: String, default: 'None'},
        xbox: {type: String, default: 'None'},
        playstation: {type: String, default: 'None'},
        nintendo: {type: String, default: 'None'},
        epicgames: {type: String, default: 'None'}
    }
})

userSchema.index({userID: 1, guildID: 1}, {unique: true})
module.exports = mongoose.model('User', userSchema)
