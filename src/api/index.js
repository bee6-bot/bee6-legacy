const express = require('express');
const fs = require('fs');
const path = require('path');
const { logMessage } = require('../functions/utilities/core/loggingUtils.js');

const app = express();


function loadApiRoutes() {
    console.log()
    logMessage('Loading API routes...', 'INFO');
    const apiRoutesPath = path.join(__dirname, 'routes');

    fs.readdirSync(apiRoutesPath).forEach(file => {
        const routePath = path.join(apiRoutesPath, file);

        if (file.endsWith('.js')) {
            logMessage(`Loaded API route ${routePath.replace(__dirname, '')}`, 'INFO');
            const route = require(routePath);
            // noinspection JSCheckFunctionSignatures
            app.use('/api', route);
        }
    });

    logMessage('API routes loaded!', 'SUCCESS');

}

function startApiServer() {
    const port = process.env.PORT || 3000;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.listen(port, () => {
        logMessage(`API listening on port ${port}`, 'INFO');
    });

    loadApiRoutes();
}

module.exports = {
    startApiServer,
};
