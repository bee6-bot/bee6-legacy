/**
 * @fileoverview This file handles the registration of events.
 */

const {logMessage} = require('../utilities/core/loggingUtils');
logMessage(`Hello, world! From handleEvents.js`, `INFO`);

const {readdirSync} = require('fs');
const {join} = require('path');
const eventDirs = readdirSync(join(__dirname, '../../events'));

module.exports = async (client) => {
    // Iterate through event directories and register events.

    for (const dir of eventDirs) {
        const events = readdirSync(join(__dirname, '../../events', dir)).filter(file => file.endsWith('.js'));

        for (const file of events) {
            const eventArray = require(`../../events/${dir}/${file}`);

            // This is for when multiple events are exported from a single file.
            if (Array.isArray(eventArray)) {
                for (const eventObj of eventArray) {
                    /**
                     * @name Registers an event and binds its execution to the client.
                     * @param {Object} client - The Discord client object.
                     */
                    logMessage(`    Registered event ${eventObj.name}`, `INFO`);
                    client.on(eventObj.name, eventObj.execute.bind(null, client));
                }
            } else {
                /**
                 * @name Registers an event and binds its execution to the client (single event object).
                 * @param {Object} client - The Discord client object.
                 */
                client.on(eventArray.name, eventArray.execute.bind(null, client)); // Handle when a single event object is exported}
                logMessage(`    Registered event ${eventArray.name}`, `INFO`);
            }
        }

    }
}
