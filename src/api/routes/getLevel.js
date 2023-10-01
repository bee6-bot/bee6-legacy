const express = require('express');
const {getLevelData} = require('../../functions/utilities/levelUtils');
const guildModel = require("../../models/guildModel");
const router = express.Router();

router.get('/:serverId/:userId/level', async (req, res) => {
    const { serverId, userId } = req.params;

    if (!serverId || !userId) res.json({ message: 'Missing parameters!' });

    // Get the guild
    try {
        const guildModel = require('../../models/guildModel');
        const guild = await guildModel.findOne({guildId: serverId});
        if (!guild) return res.json({message: 'Guild not found'});
        if (guild.miscSettings.private === true) return res.json({message: 'Guild not found'});
    } catch (err) {
        return res.json({message: 'Error getting guild!'});
    }

        getLevelData(userId, serverId).then(levelData => {
            res.json({ levelData });
        }).catch(err => {
            res.json({ message: `Error getting level data.`});
        });
});

module.exports = router;