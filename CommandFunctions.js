const fs = require('fs');

function registerCommands(client, directory) {
    const commandJSONFiles = fs.readdirSync(`./${directory}`).filter(file => file.endsWith('.json'));
    for(const file of commandJSONFiles) {
        const commandJSON = require(`./${directory}/${file}`);
        client.api.applications(client.user.id).commands.post({data: commandJSON})
    }
}

function fetchCommands(client, directory) {
    const commandFiles = fs.readdirSync(`./${directory}`).filter(file => file.endsWith('.js'));
    for(const file of commandFiles) {
        const command = require(`./${directory}/${file}`);
        client.commands.set(command.name, command);
    }
}

module.exports = { registerCommands, fetchCommands }