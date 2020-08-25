//Import stuff so that this works I guess
const Discord = require("discord.js");
const config = require("./config.json");
const fs = require('fs');
const { spawn } = require("child_process");
const { exec } = require("child_process");
const { send, stderr, stdout } = require("process");
const { Console } = require("console");
const { resolve } = require("path");
//Make the variable to manipulate
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const prefix = config.PREFIX
const second = 1000;
const minute = second*60;

/////////////////////////////////////////////////////
///Jackson's Discord Bot, but this time, he's mad!///
/////////////////////////////////////////////////////

//Global fun
bedrock_console=null;
chatbot_console=null;
grace_stop=true;
//Return to this code when a message is sent
client.on("message",function(message){
    //console.log(message);
    //Local data based on the message or context
    isCommand=false;


    if (message.author.bot) return;

    command=null;
    args=null;
    if (message.content.startsWith(prefix)){
        isCommand=true; //Let program know it's a command being run

        const commandBody = message.content.slice(prefix.length); //Remove the prefix

        var args = commandBody.split(' '); //Split the message into array
        
        var command = args.shift().toLowerCase(); //Remove first from command and lower all 
    }


    //Replies must start with lower case, as Discord.js formats replies as @User, ${message}.


    //Command Library
    if (isCommand){
        if(command==="server"){
            //Test for power to the server hardware.
            if (args[0]==="power"){
                ping().then(response=>{
                    if (response){
                        message.reply("the server is currently powered on.")
                    }else{
                        message.reply("the server is not powered on. Rip.")
                    }
                });

            }
            if (args[0]==="start"){
                //Test for hardware power to avoid confusion on point of failure
                if (!ping().then(response=>console.log(response))){
                    message.reply("the hardware is currently not powered.");
                    return;
                }
                if (bedrock_console!=null){
                    message.reply("the server is already powered on.");
                    return;
                }
         
            }

        }
        if (command==="tasklist"){
            tasklist().then(responce=>{
                message.reply(responce);
            })
        }
    }



    //Test for other messages for specific applications.
    if (!isCommand){

    }



});


//Test for connection to the server. If no connection, set st variable to null etc. If there is a connection that isn't
//expected, kill the bedrock server and start it again to maintain a connection that it manipulatable.
setInterval(function(testing){
    if (bedrock_console!=null){

    }
},30*second);









//Contributed by Seth. Good job.
//Test if a connection can be made to the server hardware. Run using:
//ping().then(response=>console.log(response))
//to return a true or false.
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
//Seth is pretty smart 



function tasklist(){
    return new Promise((resolve,reject) => {
        exec(`ssh jackson@192.168.1.7 tasklist`,(error,stdout,stderr) => {
            console.log(stdout);
            resolve(stdout);
        });
    });
}


client.login(config.BOT_TOKEN);