// Import stuff so that this works I guess
const Discord = require('discord.js');
const config = require('./config.json');
const channels = require('./configs/channel-ids.json');
const guilds = require('./configs/guild-ids.json');
const roles = require('./configs/role-ids.json');
const set_up_death_counter = require('./death_counter.js');
const get_help_message = require('./help.js');
const loadlines = require('./loadlines.js');
const set_up_discord_proxy = require('./discord_proxy.js');
let date = new Date();
// Make the variable to manipulate
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const prefix = config.PREFIX
const second = 1000;
const minute = second * 60;

// This is where all the bot replies will be parsed and read in. 
let randommessage;
load_random_lines();

///////////////////////////////////////////////////////
/// Jackson's Discord Bot, but this time, he's mad! ///
///////////////////////////////////////////////////////

// Global fun
const bedrock_server = new (require('./server.js'))({
    server_ip: "192.168.1.7",
    ssh_user: "jackson",
    program_path: "c:/Users/Jackson/Desktop/Minecraft_Server/Survival/bedrock_server.exe",
    TCP_pipe_port: 12345
});
const jason = new (require('./jason.js'))(bedrock_server);
set_up_discord_proxy(client, bedrock_server, jason);
set_up_death_counter(bedrock_server, jason);
const ops_system = new (require('./ops.js'))(bedrock_server, jason);

const commands = {
    server: bedrock_server.command.bind(bedrock_server),
    ops: ops_system.command.bind(ops_system),
    help: async args => {
        if (args[0]) {
            return await get_help_message(args[0]);
        }
        return await get_help_message('help');
    }
};

// Return to this code when a message is sent
client.on('message', async message => {
    if (message.author.bot) return;
    
    // Replies must start with lower case, as Discord.js formats
    // replies as @User, ${message}.

    if (message.content.startsWith(prefix) &&
        (message.channel.id === channels["bot-commands"] ||
        message.guild.id === guilds["jacksons-test-server"])
    ) {
        message.channel.startTyping(); // Have JasonTheBot be typing while a response is created

        const commandBody = message.content.slice(prefix.length); // Remove the prefix
        const args = commandBody.split(' '); // Split the message into array
        const command = args.shift().toLowerCase(); // Remove first from command and lower all 

        if (commands.hasOwnProperty(command)) {
            const response = await commands[command](args, message);
            
            if (response) {
                message.reply(response);
            }
        } else {
            message.reply(`that's not a command you silly goose!`);
        }

        message.channel.stopTyping(true);
    } else { // Test for other messages for specific applications.
        if (message.content.toLowerCase().includes(`good bot`)) {
            message.channel.startTyping(); // Have JasonTheBot be typing while a response is created
            message.channel.send('I know I am.');
            message.channel.stopTyping(true);
        }
    }
});

const reactions_to_roles = {
    rocket_league: roles.rocket_league,
    among_us: roles.among_us,
    stardew_valley: roles.stardew_valley,
    minecraft: roles.minecraft,
    smashbros: roles.super_smash_bros
}

client.on("messageReactionAdd", (reaction, user) => {
    const message = reaction.message;
    const emoji_name = reaction.emoji.name;
    if (message.id === "743710929602216026") { // The 'react to this to get a role' message
        if (reactions_to_roles.hasOwnProperty(emoji_name)) {
            const to_add = message.guild.roles.cache.get(reactions_to_roles[emoji_name]);
            message.guild.member(user).roles.add(to_add);
        }
    }
});

client.on("messageReactionRemove", (reaction, user) => {
    const message = reaction.message;
    const emoji_name = reaction.emoji.name;
    if (message.id === "743710929602216026") { // The 'react to this to get a role' message
        if (reactions_to_roles.hasOwnProperty(emoji_name)) {
            const to_remove = message.guild.roles.cache.get(reactions_to_roles[emoji_name]);
            message.guild.member(user).roles.remove(to_remove);
        }
    }
});

// Spit out random words for kicks. TODO: Import random.txt, choose a random word,
// and say something every 3 hours between 8 AM and 9 PM
setInterval(() => {
    if (date.getHours() > 7 && date.getHours() < 22) {
        let toSend = randommessage[Math.floor(Math.random() * Math.floor(randommessage.length-1))]
        //This was getting anoying so I disabled it
        //client.channels.cache.get('743322271355240492').send(toSend);
    }
}, 60 * minute);

async function load_random_lines() {
    randommessage = await loadlines('random.txt');
}

client.login(config.BOT_TOKEN);
