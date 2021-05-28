const Discord = require('discord.js');

module.exports = {
    name: 'delresps',
    async execute(interaction, Response) {
        const options = interaction.data.options;
        // Create filter depending if there are 1 or 2 parameters.
        const filter = options.length > 1 ? { trigger: options[0].value, response: options[1].value} : { trigger: options[0].value };
        
        // Delete all documents that pass the filter.
        const num = await Response.deleteMany(filter);

        // Create embed.
        const embed = new Discord.MessageEmbed()
            .setColor(0x30972D)
            .setTitle(`${num.deletedCount} Response${num.deletedCount!=1?'s':''} Deleted`);

        for(var i = 0; i < options.length; i++) {
            if(options[i]) {
                embed.addField(format(options[i].name), options[i].value, true);
            }
        }
        
        return [embed];
    }
}

function format(camelString) {
    return camelString.replace(/_/g, ' ').trim().replace(/^\w|\s\w/g, c => c.toUpperCase());
}