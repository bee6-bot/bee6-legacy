const express = require('express');
const {getLevelData} = require('../../functions/utilities/levelUtils');
const router = express.Router();

router.get('/:serverId/:userId/level', async (req, res) => {
    const { serverId, userId } = req.params;

    if (!serverId || !userId) res.json({ message: 'Missing parameters!' });
    else {
        getLevelData(userId, serverId).then(levelData => {
            res.json({ levelData });
        }).catch(err => {
            res.json({ message: `Error getting level data.`});
        });
    }
});

module.exports = router;