const child_process = require('child_process');
const path = require('path');
const { EventEmitter } = require('events');
const net = require('net');
const config = require('./configs/bedrock_server.config.json');
const process = require('process');
const is_head_honcho = require('./head_honcho.js');
const { resolve } = require('path');

module.exports = class bedrock_server extends EventEmitter {
    #BDS_process;
    #tcp_server;
    #server_ip;
    #ssh_user;
    #program_path;
    #TCP_proxy_port;

    members;
    bots;

    constructor() {
        super();
        
        this.#server_ip = config.server_ip;
        this.#ssh_user = config.ssh_user;
        this.#program_path = config.bedrock_process_path;
        this.#TCP_proxy_port = config.TCP_proxy_port;

        this.members = [];
        this.bots = [];

        process.stdin.on('data', data => {
            if (data.includes('stop')) {
                console.log('Stopping...');
                if (this.#BDS_process) {
                    this.write('stop');
                    this.once('stop-status', successful_stop => {
                        if (successful_stop) {
                            process.exit();
                        }
                    });
                } else {
                    process.exit();
                }
            }
        });
    }

    computer_on() {
        return new Promise((resolve, reject) => {
            child_process.exec(`ping ${this.#server_ip} -c 1`, (error, stdout, stderr) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    BDS_running() {
        return new Promise((resolve, reject) => {
            child_process.exec(`ssh ${this.#ssh_user}@${this.#server_ip} tasklist`, (error, stdout, stderr) => {
                resolve(stdout.includes(path.basename(this.#program_path)));
            });
        });
    }

    start_TCP_server() {
        this.#tcp_server = net.createServer();
        this.#tcp_server.on('connection', socket => {
            socket.pipe(this.#BDS_process.stdin);
            this.#BDS_process.stdout.pipe(socket);
            socket.on('error', error => {
                socket.end();
            });
            this.#BDS_process.on('exit', (code, signal) => {
                socket.end();
            });
        });
        this.#BDS_process.on('exit', (code, signal) => {
            this.#tcp_server.close();
        });
        this.#tcp_server.listen(this.#TCP_proxy_port);
    }

    start() {
        return new Promise((resolve, reject) => {
            if (!this.#BDS_process) {
                // Create BDS process
                this.#BDS_process = child_process.spawn(`ssh`, [`${this.#ssh_user}@${this.#server_ip}`, `"${this.#program_path}"`]);
                this.#BDS_process.on('exit', (code, signal) => {
                    this.#BDS_process = null;
                    this.members.splice(0, this.members.length);
                    this.bots.splice(0, this.bots.length);
                    this.emit('stop');
                });
                this.#BDS_process.stdout.on('data', data => {
                    const data_str = data.toString();
                    if (data_str.includes('Server started')) {
                        this.emit('start-status', true);
                    } else if (data_str.includes(`can't start server`)) {
                        this.emit('start-status', false);
                    } else if (data_str.includes('Quit correctly')) {
                        this.emit('stop-status', true);
                    } else if (data_str.includes('Player connected:')) {
                        const player = data_str.match(/Player connected: (.+), xuid:/)[1];
                        if (/bot/i.test(player)) {
                            this.bots.push(player);
                            this.emit('bot-join', player);
                        } else {
                            this.members.push(player);
                            this.emit('player-join', player);
                        }
                    } else if (data_str.includes('Player disconnected:')) {
                        const player = data_str.match(/Player disconnected: (.+), xuid:/)[1];
                        if (/bot/i.test(player)) {
                            this.bots.splice(this.members.indexOf(player), 1);
                            this.emit('bot-leave', player);
                        } else {
                            this.members.splice(this.members.indexOf(player), 1);
                            this.emit('player-leave', player);
                        }
                    }
                });

                // Wait to see if it sucessfully starts
                this.once('start-status', successful_start => {
                    resolve(successful_start);
                    if (successful_start) {
                        this.emit('start');
                    }
                    return;
                });

                this.start_TCP_server();
            } else {
                return resolve(true);
            }
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            if (this.#BDS_process) {
                this.write('stop');

                // Wait to see if it successfully stops
                this.once('stop-status', successful_stop => {
                    resolve(successful_stop);
                    if (successful_stop) {
                        this.#BDS_process.kill();
                    }
                    return;
                });
            } else {
                return resolve(true);
            }
        })
    }

    write(content) {
        if (this.#BDS_process) {
            this.#BDS_process.stdin.write(`${content}\n`);
        }
    }

    async command(args, message) {
        switch (args[0]) {
            case 'running':
            case 'power': // Fallthrough intentional here
                return '`server power` and `server running` have been replaced with one command, `server status`.'
                break;
            case 'status':
                if (this.#BDS_process) {
                    let response = 'the server is currently running the game server.';
                    if (this.members.length > 0) {
                        response += `\nPlayers online: ${this.members.join(', ')}`;
                    } else {
                        response += '\nNo players online';
                    }
                    if (this.bots.length > 0) {
                        response += `\nBots online: ${this.bots.join(', ')}`;
                    } else {
                        response += '\nNo bots online';
                    }
                    return response;
                } else {
                    if (await this.computer_on()) {
                        child_process.exec(`ssh`, [`${this.#ssh_user}@${this.#server_ip}`, `taskkill`, `/IM`, `"${path.basename(this.#program_path)}"`, `/F`]);
                        return 'the server is on, but not running the game server.';
                    } else {
                        return 'the server is not currently on.';
                    }
                }
                break;
            case 'start':
                if (this.#BDS_process) {
                    return 'the game server is already running.';
                } else {
                    if (await this.computer_on()) {
                        child_process.exec(`ssh`, [`${this.#ssh_user}@${this.#server_ip}`, `taskkill`, `/IM`, `"${path.basename(this.#program_path)}"`, `/F`]);
                        message.reply('attempting to start the server.');
                        if (await this.start()) {
                            return 'the server is now running.';
                        } else {
                            return `the server didn't start successfully.`;
                        }
                    } else {
                        return 'the server is not powered on.';
                    }
                }
                break;
            case 'stop':
                if (this.#BDS_process) {
                    if (is_head_honcho(message.member) && args[1] === '--force') {
                        message.reply('attempting to stop the server.');
                        if (await this.stop()) {
                            return 'the server is now stopped.';
                        } else {
                            return `the server didn't stop successfully.`;
                        }
                    } else {
                        if (this.members.length > 0 || (this.bots.includes('JasonTheBot') ? this.bots.length > 1 : this.bots.length > 0)) {
                            return 'sorry, there are still players and/or bots connected, so no stopping the server for you.';
                        } else {
                            message.reply('attempting to stop the server.');
                            if (await this.stop()) {
                                return 'the server is now stopped.';
                            } else {
                                return `the server didn't stop successfully.`;
                            }
                        }
                    }
                } else {
                    if (await this.computer_on()) {
                        child_process.exec(`ssh`, [`${this.#ssh_user}@${this.#server_ip}`, `taskkill`, `/IM`, `"${path.basename(this.#program_path)}"`, `/F`]);
                        return `the game server isn't running in the first place.`;
                    } else {
                        return `the server isn't powered on to begin with.`;
                    }
                }
                break;
            case 'kill':
                if (is_head_honcho(message.member)) {
                    child_process.exec(`ssh`, [`${this.#ssh_user}@${this.#server_ip}`, `taskkill`, `/IM`, `"${path.basename(this.#program_path)}"`, `/F`], (error, stdout, stderr) => {
                        if (error) {
                            message.reply('termination unsuccessful.');
                        } else {
                            message.reply('server terminated.');
                        }
                    });
                } else {
                    return `you aren't allowed to use that command.`;
                }
                break;
            default:
                return `that's not a command you silly goose!`
                break;
        }
    }
}
