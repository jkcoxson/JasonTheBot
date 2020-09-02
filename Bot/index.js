// Import stuff so that this works I guess
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const { spawn } = require('child_process');
const { exec } = require('child_process');
const { send, stderr, stdout } = require('process');
const { Console, time } = require('console');
const { resolve } = require('path');
var date = new Date();
// Make the variable to manipulate
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const prefix = config.PREFIX
const second = 1000;
const minute = second*60;

const bedrock_server = require('server.js').bedrock_server;

bedrock_server.on('start', () => {
    chatbot_console = spawn(`/usr/local/go/bin/go`,[`run`,`/home/open/Documents/Go/main.go`]);
});

bedrock_server.on('bot-join', bot_joined => {
    if (bot_joined === 'JasonTheBot') {
    }
});

bedrock_server.on('bot-leave', bot_left => {
    if (bot_left === "JasonTheBot") {
        // If the bot gets disconnected for whatever reason, kill it and try again.
        chatbot_console.kill()
        chatbot_console=spawn(`/usr/local/go/bin/go`,[`run`,`/home/open/Documents/Go/main.go`])
        
    }
});

//This is where all the bot replies will be parsed and read in. 
var random;
fs.readFile('random.txt', 'utf8' , (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    random=data.split("\n");
});

///////////////////////////////////////////////////////
/// Jackson's Discord Bot, but this time, he's mad! ///
///////////////////////////////////////////////////////

// Global fun
const bedrock_server = new bedrock_server(); // The BDS process
let chatbot_console = null; // The Go process that does chatting
let grace_stop = true; // ?
const commands = {
    server: bedrock_server.command,

    bot: async args => {
        return 'this is a message back to the user';
    },
    //Test command to be removed once functionality has been confirmed.
    random: async args =>{
        let toSend = random[Math.floor(Math.random() * Math.floor(random.length-1))]
        //Testing in my personal server until confirmed working. Don't want to spam the production server.
        client.channels.cache.get("706625332941160498").send(toSend);
    }
};

// Return to this code when a message is sent
client.on('message', async message => {
    // console.log(message);
    if (message.author.bot) return;
    
    // Local data based on the message or context
    let isCommand = false;

    let command = null;
    let args = null;

    if (message.content.startsWith(prefix)) {
        isCommand = true; // Let program know it's a command being run

        const commandBody = message.content.slice(prefix.length); // Remove the prefix

        args = commandBody.split(' '); // Split the message into array
        
        command = args.shift().toLowerCase(); // Remove first from command and lower all 
    }


    // Replies must start with lower case, as Discord.js formats
    // replies as @User, ${message}.


    // Command Library
    if (isCommand) {
        if (commands.hasOwnProperty(command)) {
            const response = await commands[command](args, message);
            
            if (response) {
                message.reply(response);
            }
        } else {
            message.reply(`that's not a command you silly goose!`);
        }
    } else { // Test for other messages for specific applications.
        if (message.content.toLowerCase().includes(`good bot`)){
            message.channel.send("I know I am.");
        }
    }
});


// Spit out random words for kicks. TODO: Import random.txt, choose a random word, and say something every 3 hours between
// 8 AM and 9 PM
setInterval(function(){
    if (date.getHours()>7 && date.getHours()<22){
        let toSend = random[Math.floor(Math.random() * Math.floor(random.length-1))]
        
        client.channels.cache.get("743322271355240492").send(toSend);
    }
    
}, 60 * minute);

client.login(config.BOT_TOKEN);
