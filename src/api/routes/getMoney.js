const express = require('express');
const {getMoney} = require("../../functions/utilities/moneyUtils");
const router = express.Router();

router.get('/:serverId/:userId/money', async (req, res) => {
    const {serverId, userId} = req.params;
    if (!serverId || !userId) res.json({message: 'Missing parameters!'});

    // Get the guild
    try {
        const guildModel = require('../../models/guildModel');
        const guild = await guildModel.findOne({guildId: serverId});
        if (!guild) return res.json({message: 'Guild not found'});
        if (guild.miscSettings.private === true) return res.json({message: 'Guild not found'});
    } catch (err) {
        return res.json({message: 'Error getting guild!'});
    }

    getMoney(userId, serverId).then(money => {
        res.json({money});
    }).catch(err => {
        res.json({message: `Error getting money.`});
    });

});

module.exports = router;