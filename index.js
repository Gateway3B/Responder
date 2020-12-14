const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose');
var conn;
const dotenv = require('dotenv').config();

// Commands
const add = "!addresp ";
const show = "!showresps";
const helpresp = "!helpresp";
const del = "!delresps ";

// Response Schema
const responseSchema = new mongoose.Schema({
    trigger : String,
    response : String,
    userListen : String,
    channelListen : String,
    channelRespond : String,
});
var Response;

// Connects to MongoDB Atlas with mongoose on connection with discord.
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const uri =  "mongodb+srv://" + process.env.ATLASUSER + ":" + process.env.ATLASPASS + "@g3-cluster.8tlri.mongodb.net/RESPONDER?retryWrites=true&w=majority";
    mongoose.connect(uri, {useNewUrlParser: true});
    conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));
});

// When a message is sent that isn't from responder, determine if it is a command, or a trigger, and call the associated function.
client.on('message', msg => {
    collection(msg);

    if(msg.author.username != 'Responder') {

        let message = msg.content;
        
        if(message.startsWith(add)) {
            addResp(msg);

        } else if(message === show) {
            showResps(msg);

        } else if(message.startsWith(del)) {
            delResp(msg)

        } else if(message === helpresp) {
            help(msg);

        } else {
            respond(msg);
        }
    }
});

// Get collection for the message guild or create one if it doesn't exist. Update model to use this collection.
function collection(msg) {
    conn.collection(msg.guild.id);
    Response = mongoose.model('Response', responseSchema, msg.guild.id);
}

async function addResp(msg) {
    // Get the | seperated parameters. Clean means mentions won't be converted to their ID numbers.
    const segments = msg.content.slice(add.length).split("|");
    const segmentsClean = msg.cleanContent.slice(add.length).split("|");

    // Create a new response from the parameters. Channels and user are verified to be propper mentions and to exist before saving as ID numbers.
    const response = new Response({
        trigger: segmentsClean[0],
        response: segmentsClean[1],
        channelListen: segments[2] && msg.guild.channels.cache.get(segments[2].slice(3, -2)) ? segments[2].slice(3, -2) : null,
        channelRespond: segments[3] && msg.guild.channels.cache.get(segments[3].slice(3, -2)) ? segments[3].slice(3, -2) : null,
        userListen: segments[4] && msg.guild.members.cache.get(segments[4].slice(4, -1)) ? segments[4].slice(4, -1) : null,
    });

    await response.save();

    // Embed creation. Uses segmentsClean so names instead of ID numbers are displayed.
    const channelListen = response.channelListen ? segmentsClean[2].slice(2, -1) : 'N/A';
    const channelRespond =  response.channelRespond ? segmentsClean[3].slice(2, -1): 'N/A';
    const channel = channelListen + ' | ' + channelRespond;
    
    const embed = new Discord.MessageEmbed()
        .setColor(0x30972D)
        .setTitle("Response Added")
        .addFields(
            { name: 'Trigger | Response', value: response.trigger + ' | ' + response.response, inline: true },
            { name: 'Channel Listen | Respond', value: channel, inline: true },
            { name: 'User Listen', value: response.userListen ? segmentsClean[4].slice(3) : 'N/A', inline: true },
        );
    msg.reply(embed);
}

async function delResp(msg) {
    // Get the | seperated parameters.
    const segments = msg.content.slice(del.length).split('|');

    // Create filter depending if there are 1 or 2 parameters.
    const filter = segments.length > 1 ? { trigger: segments[0], response: segments[1]} : { trigger: segments[0] };
    
    // Delete all documents that pass the filter.
    const num = await Response.deleteMany(filter);

    // Create embed.
    const embed = new Discord.MessageEmbed()
        .setColor(0x30972D)
        .setTitle(num.deletedCount + " Responses Deleted");
    
    msg.reply(embed);
}

async function showResps(msg) {
    var trigResps = '';
    var channels = '';
    var users = '';

    // Get all documents. For each, create strings seperated by \n with each response info. Lookup channel and user names from IDs stored in docs.
    await Response.find({}).then(async(resps) => {
        for(var i = 0; i < resps.length; i++) {
            const resp = resps[i];
            const trigResp = resp.trigger + ' | ' + resp.response + '\n';
            trigResps += trigResp;

            const channelListen = resp.channelListen ? msg.guild.channels.cache.get(resp.channelListen).name : 'N/A';
            const channelRespond =  resp.channelRespond ? msg.guild.client.channels.cache.get(resp.channelRespond).name: 'N/A';
            channels += channelListen + ' | ' + channelRespond + '\n';
            if(resp.userListen) {
                await msg.guild.members.fetch(resp.userListen).then((member) => {
                    users += member.displayName + '\n';
                });
            } else {
                users += 'N/A\n';
            }

            // Add line breaks for long trigger reponse pairs to keep everything inline.
            for(var j = 0; j < Math.floor(trigResp.length/process.env.LINELENGTH); j++) {
                channels += '\n';
                users += '\n';
            }
        }
    });

    // Cover no documents case because embeds don't allow empty values in fields.
    trigResps = trigResps ? trigResps : 'None';
    channels = channels ? channels : 'None';
    users = users ? users : 'None';

    // Create embed.
    const embed = new Discord.MessageEmbed()
        .setColor(0x30972D)
        .setTitle("Responses")
        .addFields(
            { name: 'Trigger | Response', value: trigResps, inline: true },
            { name: 'Channel Listen | Respond', value: channels, inline: true },
            { name: 'User Listen', value: users, inline: true },
        )
    msg.reply(embed);
}

function help(msg) {
    // Create embed.
    const embed = new Discord.MessageEmbed()
        .setColor(0x30972D)
        .setTitle("Commands")
        .addFields( 
            { name: '!addresp trigger|response| ?#channelListen | ?#channelRespond | ?@userListen', value: 'Add response with trigger and response and optional channelListen, channelRespond, and userListen.\nEx. !addresp When I say.|Respond with||| When sent by @userListen\n Ex. !addresp When I say.|Respond with| When said in #channelListen | And respond in #channelRespond |'},
            { name: '!delresps trigger|?response', value: 'Delete all responses with trigger or trigger and optional response.'},
            { name: '!helpresp', value: 'Show this message.'},
            { name: '!showresps', value: 'Show all reponses set for this server.'},
        )
    msg.reply(embed);
}

async function respond(msg) {
    // Get all documents. For each, check if the message passes all checks of userListen, channelListen, and trigger. Reply or send message to channelRespond.
    await Response.find({}).then((resp) => {
        resp.forEach((resp) => {
            var shouldRespond = true;

            if(resp.userListen && resp.userListen !== msg.author.id)
                shouldRespond = false;

            if(resp.channelListen && resp.channelListen !== msg.channel.id)
                shouldRespond = false;

            if(msg.content.includes(resp.trigger) && shouldRespond) {
                // Create embed.
                const embed = new Discord.MessageEmbed()
                    .setColor(0x30972D)
                    .setTitle(resp.response);
                if(resp.channelRespond) {
                    client.channels.cache.get(resp.channelRespond).send(embed);
                } else {
                    msg.reply(embed);
                }
            }
        });
    });
}

client.login(process.env.TOKEN);