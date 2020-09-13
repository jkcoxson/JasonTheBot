// Importing bedrock_server
const BDS_server = require('./server.js');

// Instantiating a new bedrock_server
const bedrock_server = new BDS_server();

// Start the server
const successful_start = await bedrock_server.start();

// Stop the server
const successful_stop = await bedrock_server.stop();

// Write to stdin of the server
bedrock_server.write('kill LimberHawk');

// Discord command
const response = await bedrock_server.command(args, message);
message.reply(response);

// See players currently connected to the server (it's an array)
console.log(bedrock_server.members);

// See bots currently connected to the server (it's an array)
console.log(bedrock_server.bots);

// When server successfully starts
bedrock_server.on('start', () => {
    console.log('Server started');
});

// When server will stop
bedrock_server.on('stopping', () => {
    console.log('Server stopping');
});

// When server successfully quits
bedrock_server.on('stop', () => {
    console.log('Server stopped');
});

// When player joins
bedrock_server.on('player-join', player_joined => {
    console.log(player_joined);
});

// When player leaves
bedrock_server.on('player-leave', player_left => {
    console.log(player_left);
});

// When bot joins
bedrock_server.on('bot-join', bot_joined => {
    console.log(bot_joined);
});

// When bot leaves
bedrock_server.on('bot-leave', bot_left => {
    console.log(bot_left);
});
