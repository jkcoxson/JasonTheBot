const pfs = require('fs/promises');
const path = require('path');
const { config } = require('process');

const help_manager = {
    #path: './help_messages',
    #available_commands: [],
    #cache: {},
    #configured: false,

    async config() {
        if (!this.#configured) {
            const names = await pfs.readdir(this.#path);
            for (const name of names) {
                this.#available_commands.push(path.basename(name, '.md'));
            }
            this.#configured = true;
        }
    },

    async command_help_available(command) {
        try {
            await this.config();

            return this.#available_commands.includes(command);
        } catch (err) {
            console.log(err);

            return false;
        }
    },

    async get_help_spiel(command) {
        try {
            await this.config();

            if (this.#cache.hasOwnProperty(command)) {
                return this.#cache[command];
            }
    
            if (!(await this.command_help_available(command))) {
                return `that's not a command you silly goose!`;
            }
    
            const help_message = (await pfs.readFile(path.join(this.#path, `${command}.md`))).toString('utf8');
            this.#cache[command] = help_message;
            return help_message;
        } catch (err) {
            console.log(err);

            return '';
        }
    }
};

module.exports = async function get_help_message(command) {
    try {
        return await help_manager.get_help_spiel(command);
    } catch (error) {
        console.error(error);
        return '';
    }
};
