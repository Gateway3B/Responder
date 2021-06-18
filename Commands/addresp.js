const Discord = require('discord.js');

module.exports = {
    name: 'addresp',
    async execute(interaction, Response) {
        const options = interaction.data.options;

        // Create a new response from the parameters.
        const resp = new Response({
            trigger: option(options, 'trigger'),
            response: option(options, 'response'),
            ignoreCase: option(options, 'ignore_case') || false,
            messageListen: option(options, 'message_listen') || false,
            userListen: option(options, 'user_listen'),
            roleListen: option(options, 'role_listen'),
            channelListen: option(options, 'channel_listen'),
            channelRespond: option(options, 'channel_respond'),
            userCreate: interaction.member.user.id
        });

        await resp.save();

        const embed = new Discord.MessageEmbed()
                    .setTitle("Response Added")
                    .setColor(0x30972D)
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
                    )

        return [embed];
    }
}

function option(options, name) {
    const option = options.find(option => option.name === name);
    return option?option.value:null;
}
