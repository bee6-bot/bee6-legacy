const express = require('express');
const {getLeaderboard} = require("../../functions/utilities/levelUtils");
const router = express.Router();

// serverId/leaderboard/limit/page
// limit/page optional
router.get('/:serverId/leaderboard/:limit?/:page?', async (req, res) => {
    let {serverId, limit, page} = req.params;
    if (!limit) limit = 10;
    if (!page) page = 1;
    if (!serverId) res.json({message: 'Missing parameters!'});

    // Get the guild
    try {
        const guildModel = require('../../models/guildModel');
        const guild = await guildModel.findOne({guildId: serverId});
        console.log(guild.miscSettings.private)
        if (!guild) return res.json({message: 'Guild not found'});
        if (guild.miscSettings.private) return res.json({message: 'Guild is private'});
    } catch (err) {
        return res.json({message: 'Error getting guild!'});
    }

    getLeaderboard(serverId, limit, page).then(leaderboard => {
        res.json({leaderboard});
    }).catch(err => {
        res.json({message: `Error getting leaderboard.`});
    });

});

module.exports = router;