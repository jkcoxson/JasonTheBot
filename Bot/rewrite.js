//Import stuff so that this works I guess
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const { spawn } = require('child_process');
const { exec } = require('child_process');
const { send, stderr, stdout } = require('process');
const { Console } = require('console');
const { resolve } = require('path');
//Make the variable to manipulate
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
    server: args => new Promise((resolve, reject) => {
        // Test for power to the server hardware.
        if (args[0] === 'power' || args[0] === 'running') {
            bds_running().then(running => {
                if (running) {
                    resolve('the server is currently running.');
                } else {
                    resolve('the server is not currently running.');
                }
            });
        } else if (args[0] === 'start') {
            // Check if it's already running or off
            bds_running().then(running => {
                if (running) {
                    resolve('the server is already on.');
                } else {
                    ping().then(server_on => {
                        if (!server_on) {
                            resolve('the server is not powered on.')
                        } else { // Otherwise, start it
                            bedrock_console = spawn(`ssh`, [`jackson@192.168.1.7`, `"c:/Users/Jackson/Desktop/Minecraft_Server/Survival/bedrock_server.exe"`]);
                            resolve('the server is now running.');
                        }
                    })
                }
            });     
        } else if (args[0] === 'stop') {
            bedrock_console.kill();
            bedrock_console = null;
            resolve('server terminated.');
        }
    }),

    bot: args => new Promise((resolve, reject) => {
        resolve('this is a message back to the user');
    })
};

// Return to this code when a message is sent
client.on('message', message => {
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
            commands[command](args).then(response => {
                if (response) {
                    message.reply(response);
                }
            });
        } else {
            message.reply('that isn\'t a command, silly.');
        }
    } else { // Test for other messages for specific applications.

    }
});


// Test for connection to the server. If no connection, set st variable to null etc. If there is a connection that isn't
// expected, kill the bedrock server and start it again to maintain a connection that it manipulatable.
setInterval(() => {
    if (bedrock_console !== null) {
        ping().then(running => {
            if (!running) {
                bedrock_console.kill();
                bedrock_console = null;
            } else {
                tasklist().then(tasks => {
                    if (!tasks.includes('bedrock_server.exe')) {
                        bedrock_console.kill();
                        bedrock_console = spawn(`ssh`, [`jackson@192.168.1.7`, `"c:/Users/Jackson/Desktop/Minecraft_Server/Survival/bedrock_server.exe"`]);
                    }
                });
            }
        });
    } else {
        tasklist().then(tasks => {
            if (tasks.includes('bedrock_server.exe')) {
                exec(`ssh jackson@192.168.1.7 taskkill /IM "bedrock_server.exe" /F`);
            }
        });
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
    return new Promise((resolve,reject) => {
        exec(`ssh jackson@192.168.1.7 tasklist`, (error, stdout, stderr) => {
            console.log(stdout);
            resolve(stdout);
        });
    });
}

function bds_running() {
    return new Promise((resolve, reject) => {
        ping().then(computer_on => {
            tasklist().then(tasks => {
                if (computer_on && tasks.includes('bedrock_server.exe')) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    });
}

client.login(config.BOT_TOKEN);
