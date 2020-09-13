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
        if (this.#jason_process) {
            this.#jason_process.stdin.write(message);
        }
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
                const chat_match = data.match(/^Chat: {(.+)}: (.*)\n$/);
                const sleeping_match = data.match(/^Sleeping: {(.+)}\n$/);
                const death_match = data.match(/^Death: {(.+)}\n$/);
                if (chat_match) {
                    if (/bot/i.test(chat_match[1])) {
                        this.emit('bot-chat', chat_match[1], chat_match[2]);
                    } else {
                        this.emit('chat', chat_match[1], chat_match[2]);
                    }
                } else if (sleeping_match) {
                    if (/bot/i.test(sleeping_match[1])) {
                        this.emit('bot-sleeping', sleeping_match[1]);
                    } else {
                        this.emit('player-sleeping', sleeping_match[1]);
                    }
                } else if (death_match) {
                    if (/bot/i.test(death_match[1])) {
                        this.emit('bot-death', death_match[1]);
                    } else {
                        this.emit('player-death', death_match[1]);
                    }
                }
            });
        }
    }
}
