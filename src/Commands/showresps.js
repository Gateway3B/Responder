const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {PrimaryColor} = require('../../config.json')

// Bot Add URL:
// https://discord.com/oauth2/authorize?client_id=787058315782782977&scope=bot&permissions=2147626048

module.exports = {
    name: 'showresps',
    async execute(interaction, Response) { displayList(interaction, Response); },
}

// Generate initial Responses and Details embeds.
async function displayList(interaction, Response) {

    var triggers = '';
    var responses = '';
    var others = '';
    const triggerCharLimit = 15;
    const responseCharLimit = 28;
    var empty = false;

    var details;

    const checkMark = String.fromCodePoint(0x2705);
    const crossMark = String.fromCodePoint(0x274c);

    const resps = await Response.find({});
    if(resps.length == 0)
        empty = true;

    for(var i = 0; i < resps.length; i++) {
        const resp = resps[i];
        if(i == 0) {
            details = new MessageEmbed()
                .setTitle("Details")
                .setDescription(String.fromCodePoint(0x1F1E6))
                .setColor(PrimaryColor)
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

        triggers += String.fromCodePoint(0x1F1E6 + i) + (resp.trigger.replace(/<([^>]*)/g, "AAA").length < triggerCharLimit ? resp.trigger : resp.trigger.substring(0, responseCharLimit + (resp.response.length - resp.response.replace(/<([^>]*)/g, "AAA").length)) + "...") + "\n";
        responses += ':grey_exclamation:' + (resp.response.replace(/<([^>]*)/g, "AAA").length < responseCharLimit ? resp.response : resp.response.substring(0, responseCharLimit + (resp.response.length - resp.response.replace(/<([^>]*)/g, "AAA").length)) + "...") + "\n";
        others += (resp.ignoreCase?checkMark:crossMark) + "|";
        others += (resp.messageListen?checkMark:crossMark) + "|";
        others += (resp.userListen?checkMark:crossMark) + "|";
        others += (resp.roleListen?checkMark:crossMark) + "|";
        others += (resp.channelListen?checkMark:crossMark) + "|";
        others += (resp.channelRespond?checkMark:crossMark) + "\n";
    }

    if(empty) {
        const empty = new MessageEmbed()
                .setTitle("No Responses To Show")
                .setColor(PrimaryColor);

        interaction.reply({embeds: [empty]});
    } else {
        const embed = new MessageEmbed()
            .setColor(PrimaryColor)
            .setTitle("Responses")
            .addFields(
                { name: 'Trigger', value: triggers, inline: true },
                { name: 'Response', value: responses, inline: true },
                { name: 'Others', value: others, inline: true },
                { name: 'Others Guide', value: "Ignore Case|Msg Listen|User Listen|Role Listen|Channel Listen|Channel Respond", inline: false },
            );

        const followUp = {object: null};
        const buttonRows = createButtons(followUp, interaction, resps);

        setTimeout(() => {
            buttonRows.forEach(x => x.components.forEach(x => x.setDisabled(true)));
            interaction.editReply({embeds: [embed], components: buttonRows});
            followUp.object.delete();
        }, 60000);

        interaction.reply({embeds: [embed], components: buttonRows});
        followUp.object = await interaction.followUp({embeds: [details]});

    }
}

function createButtons(followUp, interaction, resps)
{
    const buttonRows = [];
    buttonRows.push(new MessageActionRow());

    resps.forEach((resp, index) => {
        if(buttonRows[buttonRows.length - 1].components.length === 5)
            buttonRows.push(new MessageActionRow());

        const emoji = String.fromCodePoint(0x1F1E6 + index);

        const buttonId = `${interaction.guild.id}${emoji.toString()}${Math.floor(Math.random * 1000)}`;

        buttonRows[buttonRows.length - 1]
            .addComponents(
                new MessageButton()
                    .setCustomId(buttonId)
                    .setLabel(emoji)
                    .setStyle('PRIMARY')
            );

        const filter = i => i.customId === buttonId && i.member.id === interaction.member.id;

        const collector = interaction.channel.createMessageComponentCollector({filter, time: 60000});
    
        collector.on('collect', async i => {
            const details = new MessageEmbed()
                    .setTitle("Details")
                    .setDescription(emoji)
                    .setColor(PrimaryColor)
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
            
            followUp.object.edit({embeds: [details]});
            i.deferUpdate();
        });
    });

    return buttonRows;
}