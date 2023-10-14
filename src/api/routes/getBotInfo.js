const express = require('express');
const router = express.Router();

require('dotenv').config();

/**
 * @fileoverview API routes for general bot info
 */

router.get('/botInfo', async (req, res) => {
    const { client } = require('../../index.js');

    const serverStats = {
        guilds: client.guilds.cache.size,
        users: client.users.cache.size,
        channels: client.channels.cache.size
    };

    const botStats = { uptime: client.uptime / 1000, ping: client.ws.ping }
    const botFeatures = {fluentAI: process.env.FLUENT_AI, aiEnabled: process.env.AI_ENABLED, }

    const gitBranch = require('child_process').execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const gitRemote = require('child_process').execSync('git config --get remote.origin.url').toString().trim();
    const gitRemoteMin = gitRemote.replace(/.*github.com\//, '').replace(/\.git$/, '');
    const lastCommit = require('child_process').execSync('git rev-parse HEAD').toString().trim();
    const botVersion = { branch: gitBranch, remote: gitRemote, remoteMin: gitRemoteMin, lastCommit: lastCommit }

    const botInfo = { serverStats, botStats, botFeatures, botVersion }
    res.json(botInfo);
});

module.exports = router;