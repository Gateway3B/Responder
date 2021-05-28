const Discord = require('discord.js');
const client = require('./../index.js').client;

module.exports = {
    name: 'showresps',
    async execute(interaction, Response) { return displayList(interaction, Response); },
    interactive: true,
    async interaction(interaction, Response) { interactionCreate(interaction, Response); }
}

// Generate initial Responses and Details embeds.
async function displayList(interaction, Response) {
    // const guild = client.guilds.cache.find(guild => guild.id === interaction.guild_id);

    var triggers = '';
    var responses = '';
    var others = '';
    const triggerCharLimit = 15;
    const responseCharLimit = 34;
    var empty = false;

    var details;
    await Response.find({}).then(async(resps) => {
        if(resps.length == 0)
            empty = true;

        for(var i = 0; i < resps.length; i++) {
            const resp = resps[i];
            if(i == 0) {
                details = new Discord.MessageEmbed()
                    .setTitle("Details")
                    .setDescription(String.fromCodePoint(0x1F1E6))
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
            }

            triggers += String.fromCodePoint(0x1F1E6 + i) + (resp.trigger.length < triggerCharLimit ? resp.trigger : resp.trigger.substring(0, triggerCharLimit) + "...") + "\n";
            responses += (resp.response.length < responseCharLimit ? resp.response : resp.response.substring(0, responseCharLimit) + "...") + "\n";
            others += (resp.ignoreCase?"Y":"N") + "|";
            others += (resp.messageListen?"Y":"N") + "|";
            others += (resp.userListen?"Y":"N") + "|";
            others += (resp.roleListen?"Y":"N") + "|";
            others += (resp.channelListen?"Y":"N") + "|";
            others += (resp.channelRespond?"Y":"N") + "\n";
        }
    })

    if(empty) {
        const empty = new Discord.MessageEmbed()
                .setTitle("No Responses To Show")
                .setColor(0x30972D);

        return [empty];
    } else {
        const embed = new Discord.MessageEmbed()
            .setColor(0x30972D)
            .setTitle("Responses")
            .addFields(
                { name: 'Trigger', value: triggers, inline: true },
                { name: 'Response', value: responses, inline: true },
                { name: 'Others', value: others, inline: true },
                { name: 'Others Guide', value: "Ignore Case|Msg Listen|User Listen|Role Listen|Channel Listen|Channel Respond", inline: false },
            )
        return [embed, details];
    }
}

// Setup interaction. Addes emojis responseCollectors for each.
async function interactionCreate(interaction, Response) {
    const plainMessage = await client.api.webhooks(client.user.id, interaction.token).messages('@original').patch({data: {}});
    const message = new Discord.Message(client, plainMessage, client.channels.cache.get(plainMessage.channel_id));

    await Response.find({}).then(async(resps) => {
        for(var i = 0; i < resps.length; i++) {
            const resp = resps[i];
            const emoji = String.fromCodePoint(0x1F1E6 + i);
            await message.react(emoji);
            const filter = (reaction, user) => {
                return reaction.emoji.name === emoji && interaction.member.user.id === user.id;
            }
            const collector = message.createReactionCollector(filter, { time: 60000 });
            collector.on('collect', async collected => {
                const details = new Discord.MessageEmbed()
                    .setTitle("Details")
                    .setDescription(emoji)
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
                await client.api.webhooks(client.user.id, interaction.token).messages('@original').patch({data: {embeds: [message.embeds[0], details]}});
            });
        }
    })
}