const {MessageEmbed} = require('discord.js');
const {PrimaryColor} = require('../../config.json')

module.exports = {
    name: 'delresps',
    async execute(interaction, Response) {
        const options = interaction.options;
        // Create filter depending if there are 1 or 2 parameters.
        const filter = options.data.length > 1 ? { trigger: options.getString('trigger'), response: options.getString('response')} : { trigger: options.getString('trigger') };
        
        // Delete all documents that pass the filter.
        const num = await Response.deleteMany(filter);

        // Create embed.
        const embed = new MessageEmbed()
            .setColor(PrimaryColor)
            .setTitle(`${num.deletedCount} Response${num.deletedCount!=1?'s':''} Deleted`);

        for(var i = 0; i < options.length; i++) {
            if(options[i]) {
                embed.addField(format(options[i].name), options[i].value, true);
            }
        }
        
        interaction.reply({embeds: [embed]});
    }
}

function format(camelString) {
    return camelString.replace(/_/g, ' ').trim().replace(/^\w|\s\w/g, c => c.toUpperCase());
}