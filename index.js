const { debug } = require('console');
const Discord = require('discord.js');
const dotenv = require('dotenv').config();
const client = new Discord.Client();
const fs = require('fs');

var responses;
const add = "/addresp";
const show = "/showresps";
const helpConst = "/help";
const del = "/deleteresp";
const spacer = "\n---------------------------------";

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Read responses.json file. If it doesn't exist, initialize it.
    try {
        var rawdata = fs.readFileSync('responses.json');
    } catch(err) {
        console.log("fildsync");
        fs.writeFileSync('responses.json', '{"responses":[]}');
        var rawdata = fs.readFileSync('responses.json');
    }
    responses = JSON.parse(rawdata);
});

// When a message is sent that isn't from responder, determine if it is a command, or a trigger, and call the associated function.
client.on('message', msg => {
    if(msg.author.username != 'Responder') {

        let message = msg.content;
        
        if(message.startsWith(add)) {
            addResp(msg);

        } else if(message.startsWith(show)) {
            showResps(msg);

        } else if(message.startsWith(del)) {
            delResp(msg)

        } else if(message.startsWith(helpConst)) {
            help(msg);

        } else {
            respond(msg);
        }
    }
});

function addResp(msg) {
    const segments = msg.content.slice(add.length + 1).split("|");
    const response = {
        trigger: segments[0],
        response: segments[1],
    };
    responses.responses.push(response);
    fs.writeFileSync('responses.json', JSON.stringify(responses, null, 4));
    
    var addLog = '`Response Added' + spacer;
    addLog = addLog.concat('\n', response.trigger + "\t\t|\t\t" + response.response + '`');
    client.channels.get(msg.channel.id).send(addLog);
}

function delResp(msg) {
    const message = msg.content.slice(del.length + 1);
    console.log(message);
    
    var delLog = '`Deleted' + spacer;
    const hit = responses.responses.filter(resp => resp.trigger === message);
    responses.responses = responses.responses.filter(resp => resp.trigger != message);
    delLog = delLog.concat('\n', hit[0].trigger + "\t\t|\t\t" + hit[0].response, '`');
    
    fs.writeFileSync('responses.json', JSON.stringify(responses, null, 4));
    
    client.channels.get(msg.channel.id).send(delLog);
}

function showResps(msg) {
    var showLog = '`Responses' + spacer;
    responses.responses.forEach(response => {
        var line = response.trigger + "\t\t|\t\t" + response.response;
        showLog = showLog.concat('\n', line);
    });
    showLog = showLog.concat('`');
    client.channels.get(msg.channel.id).send(showLog);
}

function help(msg) {
    var helpLog = '`helpLog' + spacer;
    helpLog = helpLog.concat('\n', '/addresp trigger|response');
    helpLog = helpLog.concat('\n', '/delresp trigger');
    helpLog = helpLog.concat('\n', '/helpLog');
    helpLog = helpLog.concat('\n', '/showresps');
    helpLog = helpLog.concat('`');
    client.channels.get(msg.channel.id).send(helpLog);
}

function respond(msg) {   
    responses.responses.forEach(resp => {
        if(resp.trigger === msg.toString()) {
            client.channels.get(msg.channel.id).send(resp.response);
            return;
        }
    });
}

client.login(process.env.TOKEN);