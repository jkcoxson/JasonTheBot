//Import stuff so that this works I guess
const Discord = require("discord.js");
const config = require("./config.json");
const fs = require('fs');
const { spawn } = require("child_process");
const { exec } = require("child_process");
const { send } = require("process");
//Make the variable to manipulate
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const prefix = config.PREFIX
//Create the on functions so that if something happens it will catch
let bedrock = null;
let running = false;
let buffalo = null;
//Check for a message sent
client.on("message", function(message) {
    //Stop if a bot 
    if (message.author.bot) return;  
    //Test if message doesn't start with prefix
    if (!message.content.startsWith(prefix)){
        if (!message.channel.id==="744680352412467200"){
            console.log(message.channel.id)
            return;
            
        }else{
            console.log("Good")
            tosend=""
            tryname=message.member.toString().substr(1).substr(1);
            twoname=tryname.substr(0,tryname.length-1);
            
            if (twoname==="533530255172829184"){
                twoname="Jackson";
            }
            if (twoname==="456290281592193036"){
                twoname="Platinum48";
            }
            if (twoname==="359388294527582208"){
                twoname="Hayden";
            }
            if (twoname==="743467223548690453"){
                twoname="Howard";
            }
            if (twoname==="743467223548690453"){
                twoname="Josh"
            }
            tosend+=twoname;
            tosend+=": "
            tosend+=message.content
            console.log(tosend)
            buffalo.stdin.write(tosend);
            buffalo.stdin.write("\n");
        }
    }
    //Parse the message
    const commandBody = message.content.slice(prefix.length); //Remove the prefix
    const args = commandBody.split(' '); //Split the message into array
    var command = args.shift().toLowerCase(); //Remove first (command) and lower all 
    
    //Start actual command stuff

    

    if (command === "ping"){
        message.reply("stop, I'm trying to sleep.")
    }







    if (command === "server"){
        if (args[0]==="power"){
            exec("ping 192.168.1.7 -c 1", (error, stdout, stderr) => {
                if (error) {
                    message.reply("server is not powered on. Rip. Code 0.")
                    return;
                }
                if (stderr) {
                    message.reply("server is not powered on. Rip. Code 1.")
                    return;
                }
                message.reply("server is currently powered on!")
            });
        }
        if (args[0]==="start"){
            if (running===false){
                message.reply("attemping to start server software");
                bedrock = spawn(`ssh`, [`jackson@192.168.1.7`, `"c:/Users/Jackson/Desktop/Minecraft_Server/Survival/bedrock_server.exe"`]);
                bedrock.stdout.setEncoding("utf-8");
                bedrock.stdin.setEncoding("utf-8");
                bedrock.stdout.on("readable", function(){
                    let data;
                    while(data=this.read()){
                        console.log(data);
                        fs.appendFile('bot.log', data, function (err) {
                            if (err) throw err;
                            //console.log('Saved!');
                          });
                        if (data.search("Server started.")!==-1){
                            message.reply("server started successfully!");
                            running=true;
                        }
                        if (data.search("Quit correctly")!==-1){
                            message.reply("server terminated.");
                            running=false;
                        }
                    }
                    
                });
                
            }else{
                message.reply("it's already running, silly!");
            }
            
            command="go";
        }
        if (args[0]==="stop"){
            
            bedrock.stdin.write("stop\n");
            spawn(`ssh`,[`open@192.168.1.40`,`pkill`,`main`]);
            
        }
        if (args[0]==="force"){
            if (args[1]==="stop"){
                running=false;
                bedrock=null;
                spawn(`ssh`,[`jackson@192.168.1.7`,`taskkill`, `/IM`, `"bedrock_server.exe"`, `/F`])
                message.reply("this was a last ditch effort to kill the server. There is no way to make sure this worked, try not to use this command. It also can corrupt the world, so...")
                spawn(`ssh`,[`open@192.168.1.40`,`pkill`,`main`]);
            }
        }
    }

    if (command==="role"){
        
        let role = message.guild.roles.cache.find(r => r.name === args[0]);
        message.member.roles.add(role);
    }

    if (command==="unrole"){
        
        let role = message.guild.roles.cache.find(r => r.name === args[0]);
        message.member.roles.remove(role);
    }

    if (command==="react"){
        message.delete();
        message.channel.send("React to this message to get a role that will allow others to notify you when they want to play a certain game for example @minecraft.")
    }

    if (command==="konsole"){
        let mycommand = ""
        for (var i =0; i<args.length; i++){
            mycommand+=args[i];
            mycommand+=" ";
        }
        bedrock.stdin.write(mycommand);
        bedrock.stdin.write("\n")
    }
    
    if (command==="go"){
        spawn(`ssh`,[`open@192.168.1.40`,`pkill`,`main`]);
        message.reply("starting chat helper bot.")
        buffalo=spawn(`ssh`,[`open@192.168.1.40`,`/usr/local/go/bin/go`,`run`,`/home/open/Documents/Go/main.go`]);
        //buffalo.stdin.setEncoding("utf-8");
        buffalo.stdout.setEncoding("utf-8");
        buffalo.stdout.on("readable",function(){
            //This is where chat comes from
            let data;
    
            while(data=this.read()){
                
                console.log(data)
                
                //Start parsing files
                
                if(data[2]==='1'&&data[3]!=='0'){
                    let sender="";
                    let chopped=[];
                    let finale ="";
                    //Chat packet
                    //onsole.log("Chat");
                    data = data.substr(1);
                    //console.log(data)
                    data = data.substr(1);
                    //console.log(data)
                    data = data.substr(1);
                    //console.log(data)
                    data = data.substr(1);
                    //console.log(data)
                    chopped=data.split(' ');
                    chopped.shift();
                    sender = chopped.shift();
                    //console.log(chopped)
                    let found = false
                    while (!found){
                        if (chopped[chopped.length-1].includes("[")){
                            chopped.pop();
                            //onsole.log(chopped)
                            finale=chopped.join(" ");
                            found=true
                        }else{
                            chopped.pop();
                            //console.log(chopped)
                            //console.log("Poppy");
                        }
                    }
                    let mymessage = `${sender}: ${finale}`
                    console.log(mymessage)
                    notbot=true;
                    if(mymessage.split(" ")[0]==="JasonTheBot"){
                        notbot=false;
                    }
                    if(mymessage.split(" ")[0]==="JasonTheBot:"){
                        notbot=false
                    }
                    if(notbot){
                        client.channels.cache.get("744680352412467200").send(mymessage);
                    }
                    
                }

                if(data[2]==='2'){
                    chopped=data.split(" ");
                    sender=chopped[2];
                    if (sender.length<2){
                        //console.log("Enter fix mode")
                        sender=chopped[4]
                        //console.log(sender)
                        sender=sender.substr(1);
                        //console.log(sender)
                        console.log(sender[sender.length-1])
                        if (sender[sender.length-1]==="]"){
                            sender=sender.substr(0,sender.length-1);
                        }
                        
                        //console.log(sender)
                    }
                    if (chopped[3].includes("player.left")){
                        client.channels.cache.get("744680352412467200").send(`${sender} left the game.`)
                    }
                    if (chopped[3].includes("player.joined")){
                        client.channels.cache.get("744680352412467200").send(`${sender} joined the game.`)
                    }
                    if (chopped[3].includes("death")){
                        client.channels.cache.get("744680352412467200").send(`${sender} died. Rip.`)
                    }

                }
                


            }
    
    
    
        });
    }
    if (command === "killgo"){
        spawn(`ssh`,[`open@192.168.1.40`,`pkill`,`main`]);
    }




    
});


client.on("ready", function(){
    
});

client.on("stop", function(){
    console.log("Shutting down")
});





client.on("messageReactionAdd",function(reaction,user){
    
    let message = reaction.message
    let emoji = reaction.emoji;
    if (message.id==="743710929602216026"){
        console.log(emoji.name);
        if(emoji.name==="minecraft"){
            let role = message.guild.roles.cache.find(r => r.name === "Minecraft");
            
            reaction.message.guild.member(user).roles.add(role);
        }

        if(emoji.name==="smashbros"){
            let role = message.guild.roles.cache.find(r => r.name === "Super Smash Bros.");
            
            reaction.message.guild.member(user).roles.add(role);
        }
        if(emoji.name==="emoji_3"){
            let role = message.guild.roles.cache.find(r => r.name === "stardew valley");
            
            reaction.message.guild.member(user).roles.add(role);
        }
    }

});


function fetchem(ID,client,message){
    await 
}

client.login(config.BOT_TOKEN);