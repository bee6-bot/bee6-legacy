const mongoose = require('mongoose');

const economyTransactionSchema = new mongoose.Schema({

    // General
    guildID: {type: String, required: true},
    userID: {type: String, required: true},
    targetID: {type: String, required: false},

    // Transaction
    transactionType: {type: String, required: true},
    transactionAmount: {type: Number, required: true},
    transactionDate: {type: Date, required: true},
    transactionReason: {type: String, required: true}
});

module.exports = mongoose.model('economyTransaction', economyTransactionSchema);

