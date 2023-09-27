const express = require('express');
const {getLeaderboard} = require("../../functions/utilities/levelUtils");
const router = express.Router();

// serverId/leaderboard/limit/page
// limit/page optional
router.get('/:serverId/leaderboard/:limit?/:page?', async (req, res) => {
    let { serverId, limit, page } = req.params;
    if (!limit) limit = 10;
    if (!page) page = 1;

    if (!serverId) res.json({ message: 'Missing parameters!' });
    else {
        getLeaderboard(serverId, limit, page).then(leaderboard => {
            res.json({ leaderboard });
        }).catch(err => {
            res.json({ message: `Error getting leaderboard.`});
        });
    }
});

module.exports = router;