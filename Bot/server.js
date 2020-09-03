const child_process = require('child_process');
const path = require('path');
const { EventEmitter } = require('events');
const net = require('net');
const config = require('./bedrock_server.config.json');
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

        setInterval(async () => {
            if (this.#BDS_process) {
                const [computer_on, BDS_running] = await Promise.all([this.computer_on(), this.BDS_running()]);
                if (!computer_on) {
                    this.stop();
                    console.log('The computer is not on, killing the SSH BDS process in Node');
                } else {
                    if (!BDS_running) {
                        this.#BDS_process.kill();
                        this.#BDS_process = null;
                        this.start();
                        console.log('Supposedly BDS is running over SSH, but it isn\'t running on the computer\nRestarting BDS over SSH');
                    }
                }
            } else {
                if (await this.BDS_running()) {
                    child_process.exec(`ssh ${this.#ssh_user}@${this.#server_ip} taskkill /IM "${path.basename(this.#program_path)}" /F`);
                    console.log('The BDS SSH handle that Node owns is dead, but BDS is running on the computer. Killing BDS');
                }
            }
        }, 30000);
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
            socket.setEncoding('utf-8');
            socket.pipe(this.#BDS_process.stdin);
            this.#BDS_process.stdout.pipe(socket);
            socket.on('error', error => {
                socket.end();
            });
            this.#BDS_process.on('exit', (code, signal) => {
                socket.end();
            })
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
                this.#BDS_process.stdin.setEncoding('utf8');
                this.#BDS_process.stdout.setEncoding('utf8');
                this.#BDS_process.stdout.on('data', data => {
                    if (data.includes('Server started')) {
                        this.emit('start-status', true);
                    } else if (data.includes(`can't start server`)) {
                        this.emit('start-status', false);
                    } else if (data.includes('Quit correctly')) {
                        this.emit('stop-status', true);
                    } else if (data.includes('Player connected:')) {
                        const player = data.match(/Player connected: (.+), xuid: .*/)[1];
                        if (/bot/i.test(player)) {
                            this.bots.push(player);
                            this.emit('bot-join', player);
                        } else {
                            this.members.push(player);
                            this.emit('player-join', player);
                        }
                    } else if (data.includes('Player disconnected:')) {
                        const player = data.match(/Player disconnected: (.+), xuid: .*/)[1];
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
                        this.#BDS_process = null;
                        this.members.splice(0, this.members.length);
                        this.bots.splice(0, this.bots.length);
                        this.emit('stop');
                    }
                    return;
                });
            } else {
                return resolve(true);
            }
        })
    }

    write(content) {
        this.#BDS_process.stdin.write(`${content}\n`);
    }

    async command(args, message) {
        switch (args[0]) {
            case 'status':
                if (await this.computer_on()) {
                    if (await this.BDS_running()) {
                        return 'the server is currently running the game server.';
                    } else {
                        return 'the server is on, but not running the game server.';
                    }
                } else {
                    return 'the server is not currently on.';
                }
                break;
            case 'start':
                if (!(await this.computer_on())) {
                    return 'the server is not powered on.';
                } else {
                    if (await this.BDS_running()) {
                        return 'the game server is already running.';
                    } else {
                        message.reply('attempting to start the server.');
                        if (await this.start()) {
                            return 'the server is now running.';
                        } else {
                            return `the server didn't start successfully.`;
                        }
                    }
                    
                }
                break;
            case 'stop':
                if (!(await this.computer_on())) {
                    return `the server isn't powered on to begin with.`;
                } else {
                    if (!(await this.BDS_running())) {
                        return `the game server isn't running anyways.`;
                    } else {
                        message.reply('attempting to stop the server.');
                        if (await this.stop()) {
                            return 'the server is now stopped.';
                        } else {
                            return `the server didn't stop successfully.`;
                        }
                    }
                    
                }
                break;
            default:
                return `that's not a command you silly goose!`
                break;
        }
    }
}
