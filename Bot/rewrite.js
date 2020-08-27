// Import stuff so that this works I guess
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const { spawn } = require('child_process');
const { exec } = require('child_process');
const { send, stderr, stdout } = require('process');
const { Console } = require('console');
const { resolve } = require('path');
// Make the variable to manipulate
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const prefix = config.PREFIX
const second = 1000;
const minute = second*60;

///////////////////////////////////////////////////////
/// Jackson's Discord Bot, but this time, he's mad! ///
///////////////////////////////////////////////////////

// Global fun
let bedrock_console = null; // The BDS process
let chatbot_console = null;
let grace_stop = true; // ?
const commands = {
    server: async args => {
        // Test for power to the server hardware.
        if (args[0] === 'power' || args[0] === 'running') {
            if (await bds_running()) {
                return 'the server is currently running.';
            } else {
                return 'the server is not currently running.';
            }
        } else if (args[0] === 'start') {
            // Check if it's already running or off
            if (await bds_running()) {
                return 'the server is already on.';
            } else {
                if (!(await ping())) {
                    return 'the server is not powered on.';
                } else { // Otherwise, start it
                    bedrock_console = spawn(`ssh`, [`jackson@192.168.1.7`, `"c:/Users/Jackson/Desktop/Minecraft_Server/Survival/bedrock_server.exe"`]);
                    console.log('Starting server');
                    return 'the server is now running.';
                }
            }
        } else if (args[0] === 'stop') {
            bedrock_console.kill();
            bedrock_console = null;
            console.log('Killing server');
            return 'server terminated.';
        }
    },

    bot: async args => {
        return 'this is a message back to the user';
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
        console.log(command);
        if (commands.hasOwnProperty(command)) {
            const response = await commands[command](args);
            if (response) {
                message.reply(response);
            }
        } else {
            message.reply('that isn\'t a command, silly.');
        }
    } else { // Test for other messages for specific applications.

    }
});


// Test for connection to the server. If no connection, set st variable to null etc. If there is a connection that isn't
// expected, kill the bedrock server and start it again to maintain a connection that it manipulatable.
setInterval(async () => {
    if (bedrock_console !== null) {
        const [computer_on, tasks_running] = await Promise.all([ping(), tasklist()]);
        if (!computer_on) {
            bedrock_console.kill();
            bedrock_console = null;
            console.log('The computer is not on, killing the SSH BDS process in Node');
        } else {
            if (!tasks_running.includes('bedrock_server.exe')) {
                bedrock_console.kill();
                bedrock_console = spawn(`ssh`, [`jackson@192.168.1.7`, `"c:/Users/Jackson/Desktop/Minecraft_Server/Survival/bedrock_server.exe"`]);
                console.log('Supposedly BDS is running over SSH, but it isn\'t running on the computer\nRestarting BDS over SSH');
            }
        }
    } else {
        if ((await tasklist()).includes('bedrock_server.exe')) {
            exec(`ssh jackson@192.168.1.7 taskkill /IM "bedrock_server.exe" /F`);
            console.log('The BDS SSH handle that Node owns is dead, but BDS is running on the computer. Killing BDS');
        }
    }
}, 30 * second);


// Contributed by Seth. Good job.
// Test if a connection can be made to the server hardware. Run using:
// ping().then(response=>console.log(response))
// to return a true or false.
function ping() {
    return new Promise((resolve, reject) => {
        exec(`ping 192.168.1.7 -c 1`, (error, stdout, stderr) => {
            if (error) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}
// Seth is pretty smart 


// List tasks running on Jackson's computer
function tasklist() {
    return new Promise((resolve, reject) => {
        exec(`ssh jackson@192.168.1.7 tasklist`, (error, stdout, stderr) => {
            resolve(stdout);
        });
    });
}

async function bds_running() {
    const [computer_on, tasks_running] = await Promise.all([ping(), tasklist()]);
    return computer_on && tasks_running.includes('bedrock_server.exe');
}

client.login(config.BOT_TOKEN);
