// handleEvents.js
// For things like message created etc

const {logMessage} = require('../utilities/loggingUtils');
logMessage(`Hello, world! From handleEvents.js`, `INFO`);

const { readdirSync } = require('fs');
const { join } = require('path');
const eventDirs = readdirSync(join(__dirname, '../../events'));

module.exports = async (client) => {
    for (const dir of eventDirs) {
        const events = readdirSync(join(__dirname, '../../events', dir)).filter(file => file.endsWith('.js'));

        for (const file of events) {
            const eventArray = require(`../../events/${dir}/${file}`);

            if (Array.isArray(eventArray)) {
                for (const eventObj of eventArray) {
                    client.on(eventObj.name, eventObj.execute.bind(null, client));
                }
            } else client.on(eventArray.name, eventArray.execute.bind(null, client)); // Handle when a single event object is exported
        }
    }
}
