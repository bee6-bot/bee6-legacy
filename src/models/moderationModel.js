const mongoose = require('mongoose');

const moderationSchema = new mongoose.Schema({

    // General
    guildID: {type: String, required: true},
    userID: {type: String, required: true},
    moderatorID: {type: String, required: true},

    // Punishment
    punishmentType: {type: String, required: true, enum: [`warn`, `kick`, `ban`, `mute`]},
    punishmentID: {type: String, required: true},
    punishmentReason: {type: String, required: true},
    punishmentDate: {type: Date, required: true, default: Date.now},
    punishmentDuration: {type: String, required: true},
    punishmentActive: {type: Boolean, required: true}
});

module.exports = mongoose.model('moderation', moderationSchema);
