const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    // General
    userID: {type: String, required: true, index: true},
    guildID: {type: String, required: true, index: true},
    joinedAt: {type: Date, default: Date.now(), index: true},
    lastSeen: {type: Date, default: Date.now()},
    muted: {type: Boolean, default: false},
    mutedData: {type: Object, default: {}},

    // Leveling
    xp: {type: Number, default: 0},
    level: {type: Number, default: 0},

    // Economy
    cash: {type: BigInt, default: 0},
    bank: {type: BigInt, default: 0},

    // Stats
    messages: {type: Number, default: 0},
    commands: {type: Number, default: 0},
    polls: {type: Number, default: 0},
    moneyEarned: {type: BigInt, default: 0},
    moneySpent: {type: BigInt, default: 0},
    moneyGambled: {type: BigInt, default: 0},
    moneyRobbed: {type: BigInt, default: 0}, // How much money the user has robbed from others
    moneyRobbedFrom: {type: BigInt, default: 0}, // How much money the user has been robbed for
    moneyGiven: {type: BigInt, default: 0},

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
    favoriteColour: {type: String, default: '#ffffff'},
    favoriteAnimal: {type: String, default: 'None'},
    favoriteFood: {type: String, default: 'None'},
    favoriteGame: {type: String, default: 'None'},
    favoriteMovie: {type: String, default: 'None'},
    favoriteShow: {type: String, default: 'None'},

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