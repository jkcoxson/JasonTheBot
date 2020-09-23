const is_head_honcho = require('./head_honcho.js');
const user_ids = require("./configs/user-ids.json");
const get_help_message = require('./help.js');

function user_registered(discord_id) {
    return user_ids.discord_id_to_minecraft.hasOwnProperty(discord_id);
}

function stringify_dates_time(date) {
    let hours = date.getHours();
    hours %= 12;
    hours = hours ? hours : 12;

    let minutes = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
}

class ops_permissions_manager {
    #disabled_until;
    #timed_out_until;

    constructor() {
        this.#disabled_until = 0;
        this.#timed_out_until = 0;
    }

    is_disabled() {
        return this.#disabled_until > (new Date()).getTime()
    }

    is_enabled() {
        return !this.is_disabled();
    }

    is_timed_out() {
        return this.#timed_out_until > (new Date()).getTime()
    }

    isnt_timed_out() {
        return !this.is_timed_out();
    }

    stringify_disabled_until() {
        return stringify_dates_time(new Date(this.#disabled_until));
    }

    stringify_timed_out_until() {
        return stringify_dates_time(new Date(this.#timed_out_until));
    }

    disable_for(minutes) {
        const now = (new Date()).getTime();
        const milliseconds_from_now = (minutes * 60 * 1000)
        this.#disabled_until = now + milliseconds_from_now;
        this.#timed_out_until = now + (milliseconds_from_now * 2);
    }

    enable() {
        if (this.is_disabled()) {
            const now = (new Date()).getTime();
            const how_early = this.#disabled_until - now;
            this.#disabled_until = 0;
            this.#timed_out_until -= how_early * 2;
        }
    }

    reset() {
        this.#disabled_until = 0;
        this.#timed_out_until = 0;
    }
}

module.exports = class ops {
    #bedrock_server;
    #jason;
    #permissions_manager;
    #disabler;

    constructor(bedrock_server, jason) {
        this.#bedrock_server = bedrock_server;
        this.#jason = jason;
        this.#permissions_manager = new ops_permissions_manager();
        this.#disabler = null;

        // The actual OPS system
        this.#jason.on('player-sleep', player_sleeping => {
            if (this.#permissions_manager.is_enabled()) {
                this.#bedrock_server.write(`title @a actionbar ${player_sleeping} is sleeping`);
                setTimeout(() => {
					this.#bedrock_server.write('time set 0');
					this.#bedrock_server.write('weather clear 36000');
					this.#bedrock_server.write(`title ${player_sleeping} actionbar Good Morning`);
                }, 1000);
            }
        });

        // Enables the OPS system if the person who disabled it leaves the game
        this.#bedrock_server.on('player-leave', player_left => {
            if (user_ids.minecraft_to_discord_id[player_left].includes(this.#disabler ? this.#disabler.id : null)) {
                if (!is_head_honcho(this.#disabler)) {
                    this.#permissions_manager.enable();
                }
                this.#disabler = null;
            }
        });

        // Resets the OPS system when the server stops
        this.#bedrock_server.on('stop', () => {
            this.#permissions_manager.reset();
            this.#disabler = null;
        });
    }

    async command(args, message) {
        switch(args[0]) {
            case 'disable':
                if (this.#bedrock_server.running()) {
                    if (!is_head_honcho(message.member)) {
                        if (!user_registered(message.author.id)) {
                            return 'you must register your gamertag(s) with one of my bosses before you can run this command.';
                        }
    
                        // If the user isn't playing
                        if (!this.#bedrock_server.members.some(val => user_ids.discord_id_to_minecraft[message.author.id].includes(val))) {
                            return 'you must be playing on the server in order to control the sleep system.';
                        }
    
                        if (this.#permissions_manager.is_disabled()) {
                            return `the sleep system is already disabled until ${this.#permissions_manager.stringify_disabled_until()} and timed out until ${this.#permissions_manager.stringify_timed_out_until()}.`;
                        }
    
                        if (this.#permissions_manager.is_timed_out()) {
                            return `the sleep system is timed out until ${this.#permissions_manager.stringify_timed_out_until()}.`;
                        }
                    }

                    const mins_to_disable_for = parseInt(args[1], 10);
                    if (mins_to_disable_for) {
                        if (mins_to_disable_for <= 0) {
                            this.#permissions_manager.disable_for(30);
                            this.#disabler = message.member;
                            return `you can't disable the sleep system for a negative amount of time, so I'm disabling the sleep system for the default 30 minutes. It is disabled until ${this.#permissions_manager.stringify_disabled_until()} and timed out until ${this.#permissions_manager.stringify_timed_out_until()}.`;
                        }

                        if (mins_to_disable_for > 120 && !is_head_honcho(message.member)) {
                            this.#permissions_manager.disable_for(30);
                            this.#disabler = message.member;
                            return `you can't disable the sleep system for a more than 120 minutes, so I'm disabling the sleep system for the default 30 minutes. It is disabled until ${this.#permissions_manager.stringify_disabled_until()} and timed out until ${this.#permissions_manager.stringify_timed_out_until()}.`;
                        }

                        this.#permissions_manager.disable_for(mins_to_disable_for);
                        this.#disabler = message.member;
                        return `disabling the sleep system until ${this.#permissions_manager.stringify_disabled_until()} and timing out the sleep system until ${this.#permissions_manager.stringify_timed_out_until()}.`;
                    }

                    this.#permissions_manager.disable_for(30);
                    this.#disabler = message.member;
                    return `I didn't get a valid amount of time, so I'm disabling the sleep system for the default 30 minutes. It is disabled until ${this.#permissions_manager.stringify_disabled_until()} and timed out until ${this.#permissions_manager.stringify_timed_out_until()}.`;
                }

                return `the server isn't running right now, so the sleep system can't be disabled.`
                break;
            case 'enable':
                if (this.#bedrock_server.running()) {
                    if (this.#permissions_manager.is_disabled()) {
                        // If the user is either the person who disabled the OPS system or if they're a head honcho
                        if (((this.#disabler) ? this.#disabler.id === message.member.id : true) || is_head_honcho(message.member)) {
                            this.#permissions_manager.enable();
                            this.#disabler = null;
                            return `enabling the sleep system and resetting the timeout to expire at ${this.#permissions_manager.stringify_timed_out_until()}.`;
                        }

                        return `you were not the one to to disable the sleep system, so you may not enable it.`;
                    }

                    if (this.#permissions_manager.is_timed_out()) {
                        return `the sleep system is already enabled, but timed out until ${this.#permissions_manager.stringify_timed_out_until()}.`;
                    }

                    return `the sleep system is already enabled.`;
                }

                return `the server isn't running right now, so the sleep system can't be enabled.`
                break;
            case 'status':
                if (this.#bedrock_server.running()) {
                    if (this.#permissions_manager.is_disabled()) {
                        return `the sleep system is disabled until ${this.#permissions_manager.stringify_disabled_until()} and timed out until ${this.#permissions_manager.stringify_timed_out_until()}.`;
                    }

                    if (this.#permissions_manager.is_timed_out()) {
                        return `the sleep system is enabled, but timed out until ${this.#permissions_manager.stringify_timed_out_until()}.`;
                    }

                    return `the sleep system is enabled and not timed out.`;
                }

                return `the server isn't running right now, so the sleep system doesn't have a status.`
                break;
            case 'reset':
                if (this.#bedrock_server.running()) {
                    if (is_head_honcho(message.member)) {
                        this.#permissions_manager.reset();
                        return `enabling the sleep system and resetting the timeout.`;
                    }

                    return `you do not have permission to run this command.`
                }

                return `the server isn't running right now, so the sleep system can't be reset.`
                break;
            case 'help':
                return get_help_message('ops');
                break;
            default:
                return `that's not a command you silly goose!`
                break;
        }
    }
}