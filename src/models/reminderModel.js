const mongoose = require('mongoose');

const reminderModel = new mongoose.Schema({

    // General
    guildID: {type: String, required: true},
    userID: {type: String, required: true},
    isBirthday: {type: Boolean, required: true},

    // Reminder
    reminderID: {type: String, required: true},
    reminderDate: {type: Date, required: true},
    reminderMessage: {type: String, required: true},
    reminderActive: {type: Boolean, required: true}
});

module.exports = mongoose.model('reminder', reminderModel);
