// Import stuff so that this works I guess
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const { spawn } = require('child_process');
const { exec } = require('child_process');
const { send, stderr, stdout } = require('process');
const { Console, time } = require('console');
const { resolve } = require('path');
const { rejects } = require('assert');
var date = new Date();
// Make the variable to manipulate
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const prefix = config.PREFIX
const second = 1000;
const minute = second*60;

// This is where all the bot replies will be parsed and read in. 
let randommessage;
let arrow;
let cactus;
let creeper;
let drown;
let drowned;
let ender_dragon;
let ender_dragon_magic;
let enderman;
let fall;
let lava;
let llama;
let shulker;
let spider;
let suffocate;
let tnt;
let fallvoid;
let witch_magic;
let wolf;
let zombie;
loadall();


///////////////////////////////////////////////////////
/// Jackson's Discord Bot, but this time, he's mad! ///
///////////////////////////////////////////////////////

// Global fun
const bedrock_server = new (require('./server.js'))();

bedrock_server.on('start', () => {
    GoSubwaySandwich();
});

bedrock_server.on('bot-join', bot_joined => {
    if (bot_joined === 'JasonTheBot') {
        // What to do when Jason joins?
    }
});

bedrock_server.on('bot-leave', bot_left => {
    if (bot_left === "JasonTheBot") {
        // If the bot gets disconnected for whatever reason, kill it and try again.
        console.log("A bot left")
        chatbot_console.kill()
        GoSubwaySandwich();
    }
});

let chatbot_console = null; // The Go process that does chatting
const commands = {
    server: bedrock_server.command.bind(bedrock_server),

    bot: async args => {
        return 'this is a message back to the user';
    },
    //Test command to be removed once functionality has been confirmed.
    random: async args =>{
        let toSend = randommessage[Math.floor(Math.random() * Math.floor(randommessage.length-1))]
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
        if (message.channel.id === '743335229137092718') {
            if (commands.hasOwnProperty(command)) {
                const response = await commands[command](args, message);
                
                if (response) {
                    message.reply(response);
                }
            } else {
                message.reply(`that's not a command you silly goose!`);
            }
        }
            
    } else { // Test for other messages for specific applications.
        if (message.content.toLowerCase().includes(`good bot`)){
            message.channel.send("I know I am.");
        }
        
        if (message.channel.id==="706625332941160498"){
            chatbot_console.stdin.write(`${message.author.username}: ${message.content}\n`)
            
        }
    }
});


// Spit out random words for kicks. TODO: Import random.txt, choose a random word, and say something every 3 hours between
// 8 AM and 9 PM
setInterval(function(){
    if (date.getHours()>7 && date.getHours()<22){
        let toSend = randommessage[Math.floor(Math.random() * Math.floor(randommessage.length-1))]
        //This was getting anoying so I disabled it
        //client.channels.cache.get("743322271355240492").send(toSend);
    }
    
}, 60 * minute);

function GoSubwaySandwich() {
    console.log("Welcome to Subway, can I eat your sandwich?")
    chatbot_console = spawn(`/usr/local/go/bin/go`, [`run`,`/home/open/Documents/JasonTheBot/Go/chatbot.go`]);
    chatbot_console.stdout.setEncoding('utf-8');
    chatbot_console.stdout.on('data', data => {
        console.log(data);
        // Start parsing the string
        if((data.split(":")[1])!==undefined){
            if (data.split(":")[1].startsWith("0x1")){
                // Chat message
                let messagearray = data.split(" ");
                sender="";
                message="";

                for (i=0;i<messagearray.length-1;i++){
                    if(messagearray[i].startsWith("SourceName:")){
                        if (sender===""){
                            sender=messagearray[i].substr(12,messagearray[i].length-1);
                            sender=sender.substr(0,sender.length-2)
                        }
                    }
                    if(messagearray[i].startsWith("Message:")){
                        if (message===""){
                            message=messagearray[i].substr(9,messagearray[i].length-1);
                            let endfound = false
                            let endfinder =1
                            while(!endfound){
                                if (messagearray[i+endfinder].startsWith("Parameters:")){
                                    endfound=true;
                                }else{
                                    message=message+" "+messagearray[i+endfinder]
                                }
                                endfinder++;
                            }
                            message=message.substr(0,message.length-2);
                        }
                    }
                }
                console.log(`Final Output:    ${sender}: ${message}`)
                if (sender!=="JasonTheBot"){
                    client.channels.cache.get("744680352412467200").send(`${sender}: ${message}`);
                }
                

            }
            if (data.split(":")[1].startsWith("0x2")){
                // Death message
                if (data.includes("Message:\"§e%multiplayer.player.left\",")){
                    return;
                    //Seth is managing this
                }
                if (data.includes("Message:\"§e%multiplayer.player.joined\",")){
                    return;
                    //Dito
                }
                
                let messagearray=data.split(" ")
                let sender=""
                for (i =0; i<messagearray.length-1; i++){
                    console.log("for loop");
                    //console.log(messagearray[i]);
                    if (messagearray[i].startsWith("Parameters:[]string")){
                        sender=messagearray[i].substr(21,messagearray[i].length-1);
                        sender=sender.substr(0,sender.length-2)
                        if (sender.endsWith("\"")){
                            sender=sender.substr(0,sender.length-1);
                        }
                    }
                }
                message="";
                if (data.includes("entity.arrow.name")){
                    message=arrow[Math.floor(Math.random() * Math.floor(arrow.length-1))]
                }
                if (data.includes("death.attack.cactus")){
                    message=cactus[Math.floor(Math.random() * Math.floor(cactus.length-1))]
                }
                if (data.includes("death.attack.explosion.player")){
                    if (data.includes("entity.creeper.name")){
                        message=creeper[Math.floor(Math.random() * Math.floor(creeper.length-1))]
                    }else{
                        message=tnt[Math.floor(Math.random() * Math.floor(tnt.length-1))]
                    }
                }
                if (data.includes("death.attack.drown")){
                    message=drown[Math.floor(Math.random() * Math.floor(drown.length-1))]
                }
                if (data.includes("entity.drowned.name")){
                    message=drowned[Math.floor(Math.random() * Math.floor(drowned.length-1))]
                }
                if (data.includes("entity.ender_dragon.name")){
                    if (data.includes("indirectMagic")){
                        message=ender_dragon_magic[Math.floor(Math.random() * Math.floor(ender_dragon_magic.length-1))]
                    }else{
                        message=ender_dragon[Math.floor(Math.random() * Math.floor(ender_dragon.length-1))]
                    }
                }
                if (data.includes("entity.enderman.name")){
                    message=enderman[Math.floor(Math.random() * Math.floor(enderman.length-1))]
                }
                if (data.includes("death.attack.fall")){
                    message=fall[Math.floor(Math.random() * Math.floor(fall.length-1))]
                }
                if (data.includes("death.attack.lava")){
                    message=lava[Math.floor(Math.random() * Math.floor(lava.length-1))]
                }
                if (data.includes("entity.llama.name")){
                    message=llama[Math.floor(Math.random() * Math.floor(llama.length-1))]
                }
                if (data.includes("entity.shulker_bullet.name")){
                    message=shulker[Math.floor(Math.random() * Math.floor(shulker.length-1))]
                }
                if (data.includes("entity.spider.name")){
                    message=spider[Math.floor(Math.random() * Math.floor(spider.length-1))]
                }
                if (data.includes("death.attack.inWall")){
                    message=suffocate[Math.floor(Math.random() * Math.floor(suffocate.length-1))]
                }
                if (data.includes("death.attack.outOfWorld")){
                    message=fallvoid[Math.floor(Math.random() * Math.floor(fallvoid.length-1))]
                }
                if (data.includes("entity.witch.name")){
                    message=witch_magic[Math.floor(Math.random() * Math.floor(witch_magic.length-1))]
                }    
                if (data.includes("entity.wolf.name")){
                    message=wolf[Math.floor(Math.random() * Math.floor(wolf.length-1))]
                }    
                if (data.includes("entity.zombie.name")){
                    message=zombie[Math.floor(Math.random() * Math.floor(zombie.length-1))]
                }     
                if (message===""){
                    message="died."
                }
                
                let toSend = `${sender} ${message}`
                client.channels.cache.get("744680352412467200").send(toSend);

            }
        }
    });
}


async function loadall() {  
    [randommessage, arrow, cactus, creeper, drown, drowned, ender_dragon, ender_dragon_magic,
        enderman, fall, lava, llama, shulker, spider, suffocate, tnt, fallvoid, witch_magic,
        wolf, zombie] = await Promise.all([
            loadlines('random.txt'),
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
}

function loadlines(path){
    return new Promise((resolve,reject)=>{
        fs.readFile(path, 'utf8' , (err, data) => {
            if (err) {
                console.error(err);
                reject;
            }
            resolve(data.split("\n"));
        });
    });

}

client.login(config.BOT_TOKEN);
