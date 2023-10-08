# About `src/functions/events`

## Files

```
handlers
├── commands.js
├── events.js
└── README.md
```

---

## `commands.js`

[(go to file)](./commands.js)

This file contains functions and logic to handle commands and interactions for a Discord bot. It manages the
registration of slash commands, handles command interactions, executes code, and ensures the creation of users and
guilds when necessary.

### How it works

The `commands.js` file contains code for handling Discord bot commands and interactions. It defines functions to
register slash commands, handle command interactions, run code, create users, and create guilds in the database.

The key functions defined in this file include:

- `registerSlashCommands`: Registers slash commands for the Discord bot.
- `handleCommandInteractions`: Handles interactions for chat input commands, modals, autocompletes, and buttons.
- `runCode`: Executes code in a specified language using the Piston API.
- `createUserIfNotFound`: Creates a user if they are not found in the database.
- `createGuildIfNotFound`: Creates a guild if it is not found in the database.

The code in this file integrates with the Discord API and various models to handle interactions, execute code, and
manage users and guilds.

## `events.js`

[(go to file)](./events.js)

This file handles various events, such as message creation and other interactions. It dynamically registers event
handlers based on the events defined in specific directories.

Events are stored in the [`src/events` directory](../../events).

### How it works

Key components of this file include:

- **Event Registration**: Events are dynamically registered by loading event files from predefined directories.
- **Event Handling**: Event handlers are registered for events such as message creation, allowing for custom behavior
  based on
  specific events.

We dynamically import event handlers based on the events present in the specified directories. Each event handler is
associated with specific actions to be executed upon the occurrence of a particular event.

### Example event file

```js
// Path: src/events/messages/messageCreate.js
// ...
module.exports = {
    name: "messageCreate",
    once: false,
    async execute(message, client) {
        // ...
    }
}
```

The event handler also supports multiple events per file. For example, the following file defines two events:
```js
// Path: src/events/channel.js
// ...

const eventInfo = [
    {
        name: "channelCreate",
        eventType: "CHANNEL CREATED",
        getDescription: async (channel, client) => {
            return `Channel ${channel} was created.`;
        }
    },
    {
        name: "channelDelete",
        eventType: "CHANNEL DELETED",
        getDescription: async (channel, client) => {
            return `Channel ${channel} was deleted.`;
        }
    }
]

module.exports = eventInfo.map(event => ({

    name: event.name,
    once: false,
    async execute(client, ...args) {
        // ...
        const content = await event.getDescription(...args, client)
        await logChannel.send({embeds: [new EmbedBuilder().setDescription(content.replace('[EVENT TYPE]', event.eventType))]})
    }
}));    
```