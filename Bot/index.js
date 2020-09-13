// Import stuff so that this works I guess
const Discord = require('discord.js');
const config = require('./config.json');
const channels = require('./configs/channel-ids.json');
const guilds = require('./configs/guild-ids.json');
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
const bedrock_server = new (require('./server.js'))();
let jason = new (require('./jason.js'))(bedrock_server);
set_up_discord_proxy(client, bedrock_server, jason);

const commands = {
    server: bedrock_server.command.bind(bedrock_server)
};

// Return to this code when a message is sent
client.on('message', async message => {
    // console.log(message);
    if (message.author.bot) return;
    
    // Replies must start with lower case, as Discord.js formats
    // replies as @User, ${message}.

    if (message.content.startsWith(prefix) &&
        (message.channel.id === channels["bot-commands"] ||
        message.guild.id === guilds["jacksons-test-server"])
    ) {
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
    } else { // Test for other messages for specific applications.
        if (message.content.toLowerCase().includes(`good bot`)) {
            message.channel.send('I know I am.');
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
