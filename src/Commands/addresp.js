const {MessageEmbed} = require('discord.js');
const {PrimaryColor} = require('../../config.json')

module.exports = {
    name: 'addresp',
    async execute(interaction, Response) {
        const options = interaction.options;

        const resps = await Response.find({});

        const embed = new MessageEmbed().setColor(PrimaryColor);

        if(resps.length === 25)
        {
            embed.setTitle("Limit of 25 Responses Hit. Response Not Added.")
        } else {
            // Create a new response from the parameters.
            const resp = new Response({
                trigger: options.getString('trigger').trim(),
                response: options.getString('response'),
                ignoreCase: options.getString('ignore_case') || false,
                messageListen: options.getString('message_listen') || false,
                userListen: options.getString('user_listen'),
                roleListen: options.getString('role_listen'),
                channelListen: options.getString('channel_listen'),
                channelRespond: options.getString('channel_respond'),
                userCreate: interaction.member.user.id
            });
    
            await resp.save();
    
            embed.setTitle("Response Added")
                .addFields(
                    { name: 'Trigger', value: resp.trigger, inline: true },
                    { name: 'Response', value: resp.response, inline: true },
                    { name: 'Ignore Case', value: resp.ignoreCase?"Yes":"No", inline: true },
                    { name: 'Message Listen', value: resp.messageListen?"Yes":"No", inline: true },
                    { name: 'User Listen', value: resp.userListen?`<@${resp.userListen}>`:"None", inline: true },
                    { name: 'Role Listen', value: resp.roleListen?`<@&${resp.roleListen}>`:"None", inline: true },
                    { name: 'Channel Listen', value: resp.channelListen?`<#${resp.channelListen}>`:"None", inline: true },
                    { name: 'Channel Respond', value: resp.channelRespond?`<#${resp.channelRespond}>`:"None", inline: true },
                    { name: 'Created By', value: resp.userCreate?`<@${resp.userCreate}>`:"None", inline: true },
                );
        }

        interaction.reply({embeds: [embed]});
    }
}
