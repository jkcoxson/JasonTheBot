const channels = require('./configs/channel-ids.json');

module.exports = function set_up_discord_proxy(discord_client, bedrock_server, jason) {
    discord_client.on('message', message => {
        if (message.author.bot) return;
        
        if (message.channel.id === channels['minecraft-chat']) {
            jason.chat(`§b${message.author.username}§f: ${message.content}\n`);
        }
    });

    jason.on('chat', (sender, message) => {
        if (sender !== 'JasonTheBot') {
            discord_client.channels.cache.get(channels['minecraft-chat']).send(`**${sender}**: ${message}`);
        }
    });
}
