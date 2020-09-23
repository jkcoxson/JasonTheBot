const pfs = require('fs/promises');
const path = require('path');

class help_manager {
    #path;
    #available_commands;
    #cache;

    constructor(path) {
        this.#path = path;
        this.#available_commands = [];
        this.#cache = {};
        pfs.readdir(this.#path).then(names => {
            for (const name of names) {
                this.#available_commands.push(path.basename(name, '.md'));
            }
        });
    }

    command_help_available(command) {
        return this.#available_commands.includes(command);
    }

    async get_help_spiel(command) {
        if (this.#cache.hasOwnProperty(command)) {
            return this.#cache[command];
        }

        if (!this.command_help_available(command)) {
            return `that's not a command you silly goose!`;
        }

        try {
            const help_message = await pfs.readFile(path.join(this.#path, `${command}.md`))
            cache[command] = help_message;
            return help_message;
        } catch (error) {
            console.error(error);
            return '';
        }
    }
}

const manager = new help_manager('./help_messages');

module.exports = async function get_help_message(command) {
    try {
        return await manager.get_help_spiel(command);
    } catch (error) {
        console.error(error);
        return '';
    }
};
