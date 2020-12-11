const Discord = require('discord.js');
const dotenv = require('dotenv');
const client = new Discord.Client();
const fs = require('fs');
var responses;

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
    if(msg.author.username != "Responder") {
        console.log(msg.toString());
        let message = msg.toString();
        
        if(message.startsWith("/addresp")) {
            addResp(message.slice(9));
        } else {
            respond(message, msg.channel);
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

function respond(message, channel) {   
    var resps = responses.responses.filter(function(response) {
        return response.trigger === message;
    });
    resps.forEach(resp => {
        console.log(resp.toString());
        client.channels.get(channel.id).send(resp.response);
    });
}

client.login(process.env.TOKEN);
