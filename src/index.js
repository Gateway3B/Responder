const { Client, Intents, Collection} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
client.commands = new Collection();

const { discordBotToken, ATLASUSER, ATLASPASS } = require('../config.json');
const commandFunctions = require('./Helpers/CommandFunctions');


const mongoose = require('mongoose');
var conn;

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

    const uri = `mongodb+srv://${ATLASUSER}:${ATLASPASS}@g3-cluster.8tlri.mongodb.net/RESPONDER?retryWrites=true&w=majority`;
    mongoose.connect(uri, {useNewUrlParser: true});
    conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));

    commandFunctions.registerCommands(client, 'CommandJSONs');
    commandFunctions.fetchCommands(client, 'Commands');
});

// On interaction execute the command and setup any interactive elements.
client.on('interactionCreate', async interaction => {
    Response = mongoose.model('Response', responseSchema, interaction.guild.id);

    // Guards
    if(!interaction.isCommand()) return;
    if(!client.commands.has(interaction.commandName)) return;

    // Try executing command
    try {
        await client.commands.get(interaction.commandName).execute(interaction, Response);
    } catch(err) {
        console.error(err);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// When a message is sent that isn't from responder send it to the response function.
client.on('messageCreate', msg => {
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

client.login(discordBotToken);

process.on('SIGINT', async () => {
    console.log('Bot Shutdown');
    await commandFunctions.deleteCommands(client, 'CommandJSONs');
    await client.destroy();
    process.exit(1);
})
