const {MessageEmbed} = require('discord.js');
const {PrimaryColor} = require('../../config.json')

module.exports = {
    name: 'respond',
    async execute(msg, Response){
        // Get all documents. For each, check if the message passes all checks of userListen, channelListen, and trigger. Reply or send message to channelRespond.
        await Response.find({}).then(async (resp) => {
            resp.forEach(async(resp) => {
                var shouldRespond = true;
                var message = msg.content;
                var trigger = resp.trigger;

                // Determine if responder should respond.
                if(msg.channel.displayName === 'general' || msg.channel.id === '216420597255634944')
                    shouldRespond = false;
                else
                if(resp.userListen && resp.userListen !== msg.author.id)
                    shouldRespond = false;
                else
                if(resp.channelListen && resp.channelListen !== msg.channel.id)
                    shouldRespond = false;
                else
                if(resp.roleListen && resp.roleListen !== msg.member.roles.cache.some(role => role.id === resp.roleListen))
                    shouldRespond = false;
                else
                if(resp.ignoreCase) {
                    message = message.toLowerCase();
                    trigger = trigger.toLowerCase();
                }
                
                if(shouldRespond) {
                    if(resp.messageListen) {
                        if(!message.includes(trigger))
                            shouldRespond = false;
                    } else {
                        if(!(message === trigger))
                            shouldRespond = false;
                    }
                }


                if(shouldRespond) {
                    // Create embed.
                    const embed = new MessageEmbed()
                        .setColor(PrimaryColor)
                        .setTitle(resp.response);

                    if(resp.userCreate) {
                        const user = await msg.client.users.fetch(resp.userCreate);
                        embed.setFooter(`Created By: ${user.username}`);
                    }

                    if(resp.channelRespond) {
                        embed.setDescription(`Responding From: ${msg.channel.name}`);
                        msg.client.channels.fetch(resp.channelRespond).then(channel => channel.send({embeds: [embed]}));
                    } else {
                        msg.client.channels.fetch(msg.channel.id).then(channel => channel.send({embeds: [embed], message_reference: {message_id: msg.id}}));
                    }
                }
            });
        });
    }
}