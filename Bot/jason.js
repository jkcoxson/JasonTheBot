const child_process = require('child_process');
const { EventEmitter } = require('events');

module.exports = class jason_bot extends EventEmitter {
    #bedrock_server;
    #jason_process;
    #attempt_reconnect;

    constructor(bedrock_server) {
        super();

        this.#bedrock_server = bedrock_server;

        this.#bedrock_server.on('start', () => {
            this.#attempt_reconnect = true;
            this.GoSubwaySandwich();
        });

        this.#bedrock_server.on('bot-join', bot_joined => {
            if (bot_joined === 'JasonTheBot') {
                this.JasonTheVirus();
            }
        });

        this.#bedrock_server.on('bot-leave', bot_left => {
            if (bot_left === 'JasonTheBot') {
                if (this.#attempt_reconnect) {
                    // If the bot gets disconnected for whatever reason, kill it and try again.
                    this.#jason_process.kill();
                    this.#jason_process = null;
                    this.GoSubwaySandwich();
                }
            }
        });

        this.#bedrock_server.on('stopping', () => {
            this.#attempt_reconnect = false;
            if (this.#jason_process) {
                this.#jason_process.kill();
                this.#jason_process = null;
            }
        });
    }

    chat(message) {
        this.#jason_process.stdin.write(`${message}\n`);
    }

    // IMPLEMENTATION:
    JasonTheVirus() {
        setTimeout(() => {
            this.#bedrock_server.write('tp JasonTheBot 2625 39 375');
        }, 10000);

        setTimeout(() => {
            this.#bedrock_server.write('tp JasonTheBot 0 -4 0');
        }, 30000);
    }
    
    GoSubwaySandwich() {
        if (!this.#jason_process) {
            this.#jason_process = child_process.spawn(`/usr/local/go/bin/go`, [`run`,`/home/open/Documents/JasonTheBot/Go/chatbot.go`]);
            this.#jason_process.stdin.setEncoding('utf-8');
            this.#jason_process.stdout.setEncoding('utf-8');
            this.#jason_process.stdout.on('data', data => {
                // Start parsing the string
                if ((data.split(':')[1]) !== undefined) {
                    if (data.split(':')[1].startsWith('0x1')) { // Chat message
                        let messagearray = data.split(' ');
                        let sender = '';
                        let message = '';
        
                        for (let i = 0; i < messagearray.length - 1; i++) {
                            if (messagearray[i].startsWith('SourceName:')) {
                                if (sender === '') {
                                    sender = messagearray[i].substr(12, messagearray[i].length - 1);
                                    sender = sender.substr(0, sender.length - 2);
                                }
                            } else if (messagearray[i].startsWith('Message:')) {
                                if (message === '') {
                                    message = messagearray[i].substr(9, messagearray[i].length - 1);
                                    let endfound = false;
                                    let endfinder = 1;
                                    while (!endfound) {
                                        if (messagearray[i + endfinder].startsWith('Parameters:')){
                                            endfound = true;
                                        } else {
                                            message = message + ' ' + messagearray[i + endfinder]
                                        }
                                        endfinder++;
                                    }
                                    message = message.substr(0, message.length - 2);
                                }
                            }
                        }
                        this.emit('chat', sender, message);
                        return;
                    } else if (data.split(':')[1].startsWith('0x2')) {
                        if (data.includes('§e%')) {
                            // this.emit('player-sleep', player_sleeping);
                            return;
                            // At some point I will make this the sleep system.
                        }
                        
                        // Death message
                        let messagearray = data.split(' ');
                        let player_dead = '';
                        for (let i = 0; i < messagearray.length - 1; i++) {
                            if (messagearray[i].startsWith('Parameters:[]string')) {
                                player_dead = messagearray[i].substr(21, messagearray[i].length - 1);
                                player_dead = player_dead.substr(0, player_dead.length - 2);
                                if (player_dead.endsWith('"')) {
                                    player_dead = player_dead.substr(0, player_dead.length - 1);
                                }
                            }
                        }
                        let reason = '';
                        if (data.includes('entity.arrow.name')) {
                            reason = 'arrow';
                        } else if (data.includes('death.attack.cactus')) {
                            reason = 'cactus';
                        } else if (data.includes('death.attack.explosion.player')) {
                            if (data.includes('entity.creeper.name')) {
                                reason = 'creeper';
                            } else {
                                reason = 'tnt';
                            }
                        } else if (data.includes('death.attack.drown')) {
                            reason = 'drown';
                        } else if (data.includes('entity.drowned.name')) {
                            reason = 'drowned';
                        } else if (data.includes('entity.ender_dragon.name')) {
                            if (data.includes('indirectMagic')) {
                                reason = 'ender_dragon_magic';
                            } else {
                                reason = 'ender_dragon';
                            }
                        } else if (data.includes('entity.enderman.name')) {
                            reason = 'enderman';
                        } else if (data.includes('death.attack.fall')) {
                            reason = 'fall';
                        } else if (data.includes('death.attack.lava')) {
                            reason = 'lava';
                        } else if (data.includes('entity.llama.name')) {
                            reason = 'llama';
                        } else if (data.includes('entity.shulker_bullet.name')) {
                            reason = 'shulker';
                        } else if (data.includes('entity.spider.name')) {
                            reason = 'spider';
                        } else if (data.includes('death.attack.inWall')) {
                            reason = 'suffocate';
                        } else if (data.includes('death.attack.outOfWorld')) {
                            reason = 'fallvoid';
                        } else if (data.includes('entity.witch.name')) {
                            reason = 'witch_magic';
                        } else if (data.includes('entity.wolf.name')) {
                            reason = 'wolf';
                        } else if (data.includes('entity.zombie.name')) {
                            reason = 'zombie';
                        }

                        this.emit('player-death', player_dead, reason);
                        return;
                    }
                }
            });
        }
    }
}
