// Importing bedrock_server
const bedrock_server = require('server.js').bedrock_server;

// Instantiating a new bedrock_server
const server = new bedrock_server();

// Testing if the computer is on (shouldn't be needed by clients)
const computer_on = await server.computer_on();

// Testing if BDS is running (shouldn't be needed by clients)
const BDS_running = await server.BDS_running();

// Start the server
const successful_start = await server.start();

// Stop the server
const successful_stop = await server.stop();

// Write to stdin of the server
server.write('kill LimberHawk');

// See players currently connected to the server (it's an array)
console.log(server.members);

// See bots currently connected to the server (it's an array)
console.log(server.bots);

// When server successfully starts
server.on('start', () => {
    console.log('Server started');
});

// When server successfully quits
server.on('stop', () => {
    console.log('Server stopped');
});

// When player joins
server.on('player-join', player_joined => {
    console.log(player_joined);
});

// When player leaves
server.on('player-leave', player_left => {
    console.log(player_left);
});

// When bot joins
server.on('bot-join', bot_joined => {
    console.log(bot_joined);
});

// When bot leaves
server.on('bot-leave', bot_left => {
    console.log(bot_left);
});
