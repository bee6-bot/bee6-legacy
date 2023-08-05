// handleEvents.js
// For things like message created etc

const {logMessage} = require('../helpers/logging');
logMessage(`Hello, world! From handleEvents.js`, `INFO`);

const { readdirSync } = require('fs');
const { join } = require('path');
const eventDirs = readdirSync(join(__dirname, '../../events'));

module.exports = async (client) => {

    for (const dir of eventDirs) {
        const events = readdirSync(join(__dirname, '../../events', dir)).filter(file => file.endsWith('.js'));
        logMessage(`Loading ${events.length} events from ${dir}`, `INFO`);
        for (const file of events) {
            const event = require(`../../events/${dir}/${file}`);
            client.on(event.name, event.execute.bind(null, client));
            logMessage(`Loaded event ${event.name}`, `INFO`);
        }
    }
}

