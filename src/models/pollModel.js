const mongoose = require('mongoose')

const pollModel = new mongoose.Schema({

    // General
    guildID: {type: String, required: true, index: true},
    pollID: {type: String, required: true, index: true},
    pollMessageID: {type: String, required: true, index: true},
    pollChannelID: {type: String, required: true, index: true},

    // Poll Settings
    pollTitle: {type: String, required: true},
    pollDescription: {type: String, required: true},
    pollOptions: {type: Array, required: true},

    // Poll Results
    pollVotes: {type: Array, required: true},
    pollVotesCount: {type: Number, required: true},

    // Poll Author

    // Poll Timestamps
    pollCreatedAt: {type: Number, required: true},
    pollExpiresAt: {type: Number, required: true},

    // Misc.
    pollAuthorID: {type: String, required: true},
    pollStatus: {type: String, required: true}
})

module.exports = mongoose.model('poll', pollModel)
