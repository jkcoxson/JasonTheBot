// Hook bot-join, bot-leave, start, and stopping events
let jason = new jason_bot(bedrock_server);

jason.on('player-death', (player_dead, reason) => {
    console.log(`${player_dead} died due to ${reason}`);
});

jason.on('player-sleep', player_sleeping => {
    console.log(`${player_sleeping} is sleeping`);
});

jason.on('chat', (sender, message) => {
    console.log(`${sender} sent a chat message: ${message}`);
});

jason.chat('Message to send');
