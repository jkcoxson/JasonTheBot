module.exports = function set_up_death_counter(bedrock_server, jason) {
    jason.on('player-death', player_dead => {
        bedrock_server.write('scoreboard objectives add deathcount dummy Deaths');
        // console.log(`${player_dead} died`);
        // console.log(`execute ${player_dead} ~ ~ ~ scoreboard players add @s deathcount 1`);
        bedrock_server.write(`execute ${player_dead} ~ ~ ~ scoreboard players add @s deathcount 1`);
        bedrock_server.write('scoreboard objectives setdisplay list deathcount');
    });
}