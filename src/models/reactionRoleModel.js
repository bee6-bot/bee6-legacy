const mongoose = require('mongoose');

const reactionRoleSchema = new mongoose.Schema({

    // General
    guildID: {type: String, required: true},
    messageID: {type: String, required: true},
    channelID: {type: String, required: true},
    roleID: {type: String, required: true},
    emojiID: {type: String, required: true},
    emojiName: {type: String, required: true},
    roleType: {type: String, required: true}

});

module.exports = mongoose.model('reactionRole', reactionRoleSchema);

