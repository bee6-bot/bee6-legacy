const mongoose = require('mongoose');

const loggingSchema = new mongoose.Schema({

    /*
     * This model records important events and actions in different servers
     * for moderation and auditing purposes.
     */

    // General
    guildID: {type: String, required: true},
    moderatorID: {type: String, required: true},
    target: {type: String, required: true}, // Could be a user, channel, role, etc.

    // Action
    action: {type: String, required: true},
    actionType: {type: String, required: true},
    actionReason: {type: String, required: true},
    actionDate: {type: Date, required: true}
});

module.exports = mongoose.model('logging', loggingSchema);
