const express = require('express');
const {getMoney} = require("../../functions/utilities/moneyUtils");
const router = express.Router();

router.get('/:serverId/:userId/money', async (req, res) => {
    const { serverId, userId } = req.params;

    if (!serverId || !userId) res.json({ message: 'Missing parameters!' });
    else {
        getMoney(userId, serverId).then(money => {
            res.json({ money });
        }).catch(err => {
            res.json({ message: `Error getting money.`});
        });
    }
});

module.exports = router;