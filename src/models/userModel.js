const mongoose = require('mongoose')

// Extra fields:
// - protected bool: Whether the field should be protected from being edited by users, won't be shown in autocomplete
// - notes str: Extra notes about the field, shown in autocomplete
// - description str: The description of the field, shown in the help command
// - categories arr: The categories of the field, shown in the help command

const userSchema = new mongoose.Schema({
    // General
    userID: { type: String, required: true, index: true, protected: true, categories: ['general'] },
    guildID: { type: String, required: true, index: true, protected: true, categories: ['general'] },
    joinedAt: { type: Date, default: Date.now(), index: true, protected: true, categories: ['general'] },
    lastSeen: { type: Date, default: Date.now(), protected: true, categories: ['general'] },
    muted: { type: Boolean, default: false, protected: true, categories: ['general'] },
    mutedData: { type: Object, default: {}, protected: true, categories: ['general'] },

    // Bot
    isBotDeveloper: { type: Boolean, default: false, protected: true, categories: ['bot'] },
    isBotContributor: { type: Boolean, default: false, protected: true, categories: ['bot'] },
    isBotDonater: { type: Boolean, default: false, protected: true, categories: ['bot'] },

    // Leveling
    level: { type: Number, default: 0, protected: true, categories: ['leveling'] },
    totalXP: { type: Number, default: 0, protected: true, categories: ['leveling'] }, // Total XP ever earned
    xp: { type: Number, default: 0, protected: true, categories: ['leveling'] }, // Total XP at current level
    xpNeeded: { type: Number, default: 110, protected: true, categories: ['leveling'] }, // XP needed to level up

    // Economy
    cash: { type: Number, default: 0, protected: true, categories: ['economy'] },
    bank: { type: Number, default: 5000.00, protected: true, categories: ['economy'] },
    inventory: { type: Array, default: [], protected: true, categories: ['economy'] },

    // Stats
    last10Messages: { type: Array, default: [], protected: true, categories: ['stats'] }, // Array of their last 10 messages (salted and hashed) to prevent spamming for XP
    messages: { type: Number, default: 0, protected: true, categories: ['stats'] },
    commands: { type: Number, default: 0, protected: true, categories: ['stats'] },
    polls: { type: Number, default: 0, protected: true, categories: ['stats'] },
    moneyEarned: { type: Number, default: 0, protected: true, categories: ['stats'] },
    moneySpent: { type: Number, default: 0, protected: true, categories: ['stats'] },
    moneyGambled: { type: Number, default: 0, protected: true, categories: ['stats'] },
    moneyRobbed: { type: Number, default: 0, protected: true, categories: ['stats'] }, // How much money the user has robbed from others
    moneyRobbedFrom: { type: Number, default: 0, protected: true, categories: ['stats'] }, // How much money the user has been robbed for
    moneyGiven: { type: Number, default: 0, protected: true, categories: ['stats'] },

    // Moderation
    isModerator: { type: Boolean, default: false, protected: true, categories: ['moderation'] },
    isAdministrator: { type: Boolean, default: false, protected: true, categories: ['moderation'] },
    isOwner: { type: Boolean, default: false, protected: true, categories: ['moderation'] },
    warnings: { type: Array, default: [], protected: true, categories: ['moderation'] },
    kicks: { type: Array, default: [], protected: true, categories: ['moderation'] },
    bans: { type: Array, default: [], protected: true, categories: ['moderation'] },
    mutes: { type: Array, default: [], protected: true, categories: ['moderation'] },
    infractions: { type: Array, default: 0, protected: true, categories: ['moderation'] },

    // Fun
    favouriteColour: { type: String, default: 'None', categories: ['fun'] },
    favouriteAnimal: { type: String, default: 'None', categories: ['fun'] },
    favouriteFood: { type: String, default: 'None', categories: ['fun'] },
    favouriteGame: { type: String, default: 'None', categories: ['fun'] },
    favouriteMovie: { type: String, default: 'None', categories: ['fun'] },
    favouriteShow: { type: String, default: 'None', categories: ['fun'] },

    // Preferences
    preferences: {
        // General
        compactMode: { type: Boolean, default: false, categories: ['preferences'] }, // Whether to use compact mode or not (typically uses plain messages instead of embeds, not yet implemented)
        moderationDMs: { type: Boolean, default: true, categories: ['preferences'] }, // Get DMs when you are warned, kicked, banned, etc.

        // Leveling
        levelUpMessages: { type: Boolean, default: true, categories: ['preferences'] },
        levelUpDMs: { type: Boolean, default: false, categories: ['preferences'] }, // Send level up message in DMs
    },

    // Social Media
    socialNotifications: {
        twitterNotifications: { type: Boolean, default: false, categories: ['social_media'] },
        twitterUsers: { type: Array, default: [], categories: ['social_media'] },
        youtubeNotifications: { type: Boolean, default: false, categories: ['social_media'] },
        youtubeUsers: { type: Array, default: [], categories: ['social_media'] },
        twitchNotifications: { type: Boolean, default: false, categories: ['social_media'] },
        twitchUsers: { type: Array, default: [], categories: ['social_media'] },
        redditNotifications: { type: Boolean, default: false, categories: ['social_media'] },
        redditUsers: { type: Array, default: [], categories: ['social_media'] }
    },
    socialUsernames: {
        twitter: { type: String, default: 'None', categories: ['social_media'] },
        youtube: { type: String, default: 'None', categories: ['social_media'] },
        twitch: { type: String, default: 'None', categories: ['social_media'] },
        reddit: { type: String, default: 'None', categories: ['social_media'] },

        instagram: { type: String, default: 'None', categories: ['social_media'] },
        facebook: { type: String, default: 'None', categories: ['social_media'] },
        tiktok: { type: String, default: 'None', categories: ['social_media'] },
        snapchat: { type: String, default: 'None', categories: ['social_media'] },
        linkedin: { type: String, default: 'None', categories: ['social_media'] },
        github: { type: String, default: 'None', categories: ['social_media'] },
        pinterest: { type: String, default: 'None', categories: ['social_media'] },
        soundcloud: { type: String, default: 'None', categories: ['social_media'] },
        spotify: { type: String, default: 'None', categories: ['social_media'] },
        steam: { type: String, default: 'None', categories: ['social_media'] },
        xbox: { type: String, default: 'None', categories: ['social_media'] },
        playstation: { type: String, default: 'None', categories: ['social_media'] },
        nintendo: { type: String, default: 'None', categories: ['social_media'] },
        epicgames: { type: String, default: 'None', categories: ['social_media'] }
    }
});

userSchema.index({ userID: 1, guildID: 1 }, { unique: true });
module.exports = mongoose.model('User', userSchema)
