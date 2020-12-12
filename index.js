const Discord = require('discord.js');
const dotenv = require('dotenv');
const client = new Discord.Client();
const fs = require('fs');

var responses;
const add = "/addresps";
const show = "/showresps";
const helpConst = "/help";
const del = "/deleteresps";

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    try {
        var rawdata = fs.readFileSync('responses.json');
    } catch(err) {
        fs.writeFileSync('responses.json', '{"responses":[]}');
    }
    responses = JSON.parse(rawdata);
    dotenv.config();
});

client.on('message', msg => {
    if(msg.author.username != 'Responder') {
        console.log("Incoming Message: " + msg.toString());
        let message = msg.toString();
        
        if(message.startsWith(add)) {
            addResp(message.slice(add.length));

        } else if(message.startsWith(show)) {
            showResps(msg);

        } else if(message.startsWith(del)) {
            deleteResp(msg.slice(del.length))

        } else if(message.startsWith(helpConst)) {
            help();

        } else {
            respond(msg);
        }
    }
});

function addResp(message) {
    let segments = message.split("|");
    let response = {
        trigger: segments[0],
        response: segments[1],
    };
    responses.responses.push(response);
    fs.writeFileSync('responses.json', JSON.stringify(responses, null, 4));
}

function showResps(msg) {
    var show = 'Responses\n---------------------------------';
    responses.responses.forEach(response => {
        var line = response.trigger + "\t\t|\t\t" + response.response;
        show.concat('\n', line);
    });
    client.channels.get(msg.channel.id).send(show);
}

function help(msg) {
    var help = 'Help\n---------------------------------';
    help.concat('\t', '`/addresp trigger|response');
    help.concat('\t', '`/delresp trigger');
    help.concat('\t', '`/help');
    help.concat('\t', '`/showresps');
    
    client.channels.get(msg.channel.id).send(help);
}

function delResp(msg) {
    var response = responses.responses[msg.toString];
    var del = 'Delete\n---------------------------------';
    del.concat('\n', response.trigger + "\t\t|\t\t" + response.response)

    client.channels.get(msg.channel.id).send(del);

    delete responses.responses[msg.toString];
    fs.writeFileSync('responses.json', JSON.stringify(responses, null, 4));
}

function respond(msg) {   
    responses.responses.forEach(resp => {
        console.log(resp.trigger);
        console.log(msg.toString())
        if(resp.trigger === msg.toString()) {
            console.log("conrre");
            client.channels.get(msg.channel.id).send(resp.response);
            return;
        }
    });
}

client.login("Nzg3MDU4MzE1NzgyNzgyOTc3.X9PbLQ.fUWa49UAodJYp08ta5_415PDs2I");
