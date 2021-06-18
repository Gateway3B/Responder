const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFunctions = require('./CommandFunctions');
const mongoose = require('mongoose');
require('dotenv').config()
var conn;

module.exports = { client }

// Response Schema
const responseSchema = new mongoose.Schema({
    trigger: String,
    response: String,
    ignoreCase: Boolean,
    messageListen: Boolean,
    userListen: String,
    roleListen: String,
    channelListen: String,
    channelRespond: String,
    userCreate: String
});
var Response;

// Connects to MongoDB Atlas with mongoose and registers commands on connection with discord.
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const uri =  "mongodb+srv://" + process.env.ATLASUSER + ":" + process.env.ATLASPASS + "@g3-cluster.8tlri.mongodb.net/RESPONDER?retryWrites=true&w=majority";
    mongoose.connect(uri, {useNewUrlParser: true});
    conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));

    commandFunctions.registerCommands(client, 'CommandJSONS');
    commandFunctions.fetchCommands(client, 'Commands');

    client.guilds.cache.each(guild => guild.comma);
});

// On interaction execute the command and setup any interactive elements.
client.ws.on('INTERACTION_CREATE', async interaction => {
    Response = mongoose.model('Response', responseSchema, interaction.guild_id);

    try {
        // Get response from appropriate interaction's execute command.
        const response = await client.commands.get(interaction.data.name).execute(interaction, Response);
        // Send response to discord.
        client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 4, data: {embeds: response}}});

        // If the interaction is interactive run the interaction function.
        if(client.commands.get(interaction.data.name).interactive) {
            client.commands.get(interaction.data.name).interaction(interaction, Response);
        }
    } catch (error) {
        console.error(error);
        client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 4, data: {flags:64, content: `There was an error trying to execute that command. Our apologies.\n${error}`}}});
    }
});

// When a message is sent that isn't from responder send it to the response function.
client.on('message', msg => {
    collection(msg);

    if(msg.author.username != 'Responder') {
        client.commands.get('respond').execute(msg, Response);
    }
});

// Get collection for the message guild or create one if it doesn't exist. Update model to use this collection.
function collection(msg) {
    conn.collection(msg.guild.id);

    Response = mongoose.model('Response', responseSchema, msg.guild.id);

}

client.login(process.env.TOKEN);

process.on('SIGINT', async () => {
    console.log('Bot Shutdown');
    await client.destroy();
    process.exit(1);
})
