const channels = require('./configs/channel-ids.json');
const loadlines = require('./loadlines.js');

const death_messages = {};
(async function() {  
    [death_messages['arrow'], death_messages['cactus'], death_messages['creeper'],
        death_messages['drown'], death_messages['drowned'],
        death_messages['ender_dragon'], death_messages['ender_dragon_magic'],
        death_messages['enderman'], death_messages['fall'],
        death_messages['lava'], death_messages['llama'], death_messages['shulker'],
        death_messages['spider'], death_messages['suffocate'],
        death_messages['tnt'], death_messages['fallvoid'],
        death_messages['witch_magic'], death_messages['wolf'],
        death_messages['zombie']] =
        await Promise.all([
            loadlines('DeathMessages/Arrow.txt'),
            loadlines('DeathMessages/Cactus.txt'),
            loadlines('DeathMessages/Creeper.txt'),
            loadlines('DeathMessages/Drown.txt'),
            loadlines('DeathMessages/Drowned.txt'),
            loadlines('DeathMessages/Ender_Dragon.txt'),
            loadlines('DeathMessages/Ender_Dragon_Magic.txt'),
            loadlines('DeathMessages/Enderman.txt'),
            loadlines('DeathMessages/Fall.txt'),
            loadlines('DeathMessages/Lava.txt'),
            loadlines('DeathMessages/Llama.txt'),
            loadlines('DeathMessages/Shulker.txt'),
            loadlines('DeathMessages/Spider.txt'),
            loadlines('DeathMessages/Suffocate.txt'),
            loadlines('DeathMessages/TNT.txt'),
            loadlines('DeathMessages/Void.txt'),
            loadlines('DeathMessages/Witch_Magic.txt'),
            loadlines('DeathMessages/Wolf.txt'),
            loadlines('DeathMessages/Zombie.txt')
        ]);
})();

module.exports = function set_up_discord_proxy(discord_client, bedrock_server, jason) {
    discord_client.on('message', message => {
        if (message.author.bot) return;
        
        if (message.channel.id === channels['minecraft-chat']) {
            jason.chat(`§c${message.author.username}: ${message.content}\n`);
        }
    });

    bedrock_server.on('player-join', player_joined => {
        client.channels.cache.get(channels['minecraft-chat']).send(`${player_joined} joined the game!  :smiley:`);
    });
    
    bedrock_server.on('player-leave', player_left => {
        client.channels.cache.get(channels['minecraft-chat']).send(`${player_left} left the game  :cry:`);
    });

    jason.on('chat', (sender, message) => {
        if (sender !== 'JasonTheBot') {
            client.channels.cache.get(channels['minecraft-chat']).send(`**${sender}**: ${message}`);
        }
    });
    
    jason.on('player-death', (player_dead, reason) => {
        if (player_dead !== 'JasonTheBot') {
            let message;
            if (reason === '' || !death_messages.hasOwnProperty(reason)) {
                message = 'died.';
            } else {
                message = death_messages[reason][Math.floor(Math.random() * death_messages[reason].length)];
            }
            client.channels.cache.get(channels['minecraft-chat']).send(`${player_dead} ${message}`);
        }
    });
}
