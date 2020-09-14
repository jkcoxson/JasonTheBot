module.exports = function set_up_death_counter(bedrock_server, jason) {
    jason.on('player-death', player_dead => {
        bedrock_server.write('scoreboard objectives add deathcount dummy Deaths');
        bedrock_server.write(`scoreboard players add ${player_dead} deathcount 1`);
        bedrock_server.write('scoreboard objectives setdisplay list deathcount');
    });
}