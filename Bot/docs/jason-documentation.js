// Instantiate Jason
let jason = new jason_bot(bedrock_server);

// Player death
jason.on('player-death', player_dead => {
    console.log(`${player_dead} died`);
});

// Bot death
jason.on('bot-death', bot_dead => {
    console.log(`${bot_dead} died`);
});

// Player sleeping
jason.on('player-sleep', player_sleeping => {
    console.log(`${player_sleeping} is sleeping`);
});

// Bot sleeping
jason.on('bot-sleep', bot_sleeping => {
    console.log(`${bot_sleeping} is sleeping`);
});

// Player chat
jason.on('chat', (sender, message) => {
    console.log(`${sender} sent a chat message: ${message}`);
});

// Bot chat
jason.on('bot-chat', (sender, message) => {
    console.log(`${sender} sent a chat message: ${message}`);
});

jason.chat('Message to send');
