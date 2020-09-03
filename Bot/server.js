const child_process = require('child_process');
const path = require('path');
const { EventEmitter } = require('events');
const net = require('net');
const config = require('./bedrock_server.config.json');
const { resolve } = require('path');

const port = 12345;

module.exports = class bedrock_server extends EventEmitter {
    #BDS_process;
    #tcp_server;
    #server_ip;
    #ssh_user;
    #program_path;
    #successful_start;
    #successful_quit;

    members;
    bots;

    constructor() {
        super();

        this.#server_ip = config.server_ip;
        this.#ssh_user = config.ssh_user;
        this.#program_path = config.bedrock_process_path;

        setInterval(async () => {
            if (this.#BDS_process) {
                const [computer_on, BDS_running] = await Promise.all([this.computer_on(), this.BDS_running()]);
                if (!computer_on) {
                    this.stop();
                    console.log('The computer is not on, killing the SSH BDS process in Node');
                } else {
                    if (!tasks_running.includes('bedrock_server.exe')) {
                        this.#BDS_process.kill();
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
        server.on('connection', socket => {
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
            server.close();
        });
        server.listen(port);
    }

    start() {
        return new Promise((resolve, reject) => {
            if (!this.#BDS_process) {
                // Create BDS process
                this.#BDS_process = spawn(`ssh`, [`${this.#ssh_user}@${this.#server_ip}`, `"${this.#program_path}"`]);
                this.#BDS_process.stdin.setEncoding('utf8');
                this.#BDS_process.stdout.setEncoding('utf8');
                this.#BDS_process.stdout.on('data', data => {
                    if (data.includes('Server started')) {
                        this.#successful_start = true;
                        this.emit('start');
                    } else if (data.includes(`can't start server`)) {
                        this.#successful_start = false;
                        this.stop();
                    } else if (data.includes('Quit correctly')) {
                        this.#successful_quit = true;
                        this.emit('stop');
                    } else if (data.includes('Player connected:')) {
                        const player = data.match(/Player connected: (.+), xuid: .+$/)[1];
                        if (/bot/i.test(player)) {
                            this.bots.push(player);
                            this.emit('bot-join', player);
                        } else {
                            this.members.push(player);
                            this.emit('player-join', player);
                        }
                    } else if (data.includes('Player disconnected:')) {
                        const player = data.match(/Player disconnected: (.+), xuid: .+$/)[1];
                        if (/bot/i.test(player)) {
                            this.bots.splice(this.members.indexOf(player), 1);
                            this.emit('bot-leave', player);
                        } else {
                            this.members.splice(this.members.indexOf(player), 1);
                            this.emit('player-leave', player);
                        }
                    }
                });

                this.start_TCP_server();

                // Wait to see if it sucessfully starts
                const interval = setInterval(() => {
                    if (this.#successful_start !== null) {
                        clearInterval(interval);
                        const successful_start_to_return = this.#successful_start;
                        this.#successful_start = null;
                        return resolve(successful_start_to_return);
                    }
                }, 50);
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
                const interval = setInterval(() => {
                    if (this.#successful_quit !== null) {
                        clearInterval(interval);
                        const successful_quit_to_return = this.#successful_quit;
                        this.#successful_quit = null;
                        this.#BDS_process.kill();
                        this.#BDS_process = null;
                        return resolve(successful_quit_to_return);
                    }
                }, 50);
            } else {
                return resolve(true);
            }
        })
    }

    write(content) {
        this.#BDS_process.write(`${content}\n`);
    }

    command(args, message) {
        // return new Promise((resolve, reject) => {
        //     switch(args[0]) {
        //         case 'status':
        //             Promise.all(this.computer_on(), this.BDS_running()).then(([server_power, software_running]) => {
        //                 if (server_power) {
        //                     if (software_running) {
        //                         return resolve('the server is currently running the game server.');
        //                     } else {
        //                         return resolve('the server is on, but not running the game server.');
        //                     }
        //                 } else {
        //                     return resolve('the server is not currently powered on.');
        //                 }
        //             });
        //             break;
        //         case 'start':
        //             Promise.all(this.computer_on(), this.BDS_running()).then(([server_power, software_running]) => {
        //                 if (!server_power) {
        //                     return resolve('the server is not powered on.');
        //                 } else {
        //                     if (software_running) {
        //                         return resolve('the game server is already running.');
        //                     } else {
        //                         message.reply('attempting to start the server.');
        //                         this.start().then(successful_start => {
        //                             if (successful_start) {
        //                                 return resolve('the server is now running.');
        //                             } else {
        //                                 return resolve(`the server didn't start successfully.`);
        //                             }
        //                         })
        //                     }
        //                 }
        //             });
        //             break;
                    
        //         case 'stop':
        //             Promise.all(this.computer_on(), this.BDS_running()).then(([server_power, software_running]) => {
        //                 if (!server_power) {
        //                     return resolve(`the server isn't powered on to begin with.`);
        //                 } else {
        //                     if (!software_running) {
        //                         return resolve(`the game server isn't running anyways.`);
        //                     } else {
        //                         message.reply('attempting to stop the server.');
        //                         this.stop().then(successful_stop => {
        //                             if (successful_stop) {
        //                                 return resolve('the server is now stopped.');
        //                             } else {
        //                                 return resolve(`the server didn't stop successfully.`);
        //                             }
        //                         })
        //                     }
        //                 }
        //             });
        //             break;
        //         default:
        //             return resolve(`that's not a command you silly goose!`);
        //             break;
        //     }
        // });
        console.log(this);
    }
}
