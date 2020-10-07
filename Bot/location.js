const fs_promises = require('fs/promises');
const get_help_message = require('./help.js');

const location_manager = {
    filename: './configs/locations.json',

    config() {
        if (!this.locations) {
            this.locations = require(this.filename);
        }
    },

    update_file() {
        this.config();

        return fs_promises.writeFile(this.filename, JSON.stringify(this.locations));
    },

    async write_location(user, name, coords, dimension) {
        this.config();

        this.locations[user][name] = [coords, dimension];
        try {
            await this.update_file();
            return;
        } catch (err) {
            throw err;
        }
    },

    async add(user, name, coords, dimension='overworld') {
        this.config();

        if (this.locations.hasOwnProperty(user)) {
            if (this.locations[user].hasOwnProperty(name)) {
                return 'that location already exists.';
            } else {
                try {
                    await this.write_location(user, name, coords, dimension);
                    return 'location added successfully.';
                } catch (err) {
                    throw err;
                }
            }
        } else {
            this.locations[user] = {};
            try {
                await write_location(user, name, coords, dimension)
                return 'location added successfully.';
            } catch (err) {
                throw err;
            }
        }
    },

    async edit(user, name, coords, dimension='overworld') {
        this.config();
        
        if (this.locations.hasOwnProperty(user)) {
            if (this.locations[user].hasOwnProperty(name)) {
                try {
                    await this.write_location(user, name, coords, dimension)
                    return 'location edited successfully.';
                } catch (err) {
                    throw err;
                }
            } else {
                return 'that location doesn\'t exist.';
            }
        } else {
            return 'that location doesn\'t exist.';
        }
    },

    list(user) {
        this.config();
        
        if (this.locations.hasOwnProperty(user)) {
            let result = 'here are your locations:';
            for (const [name, [coordinates, dimension]] of Object.entries(this.locations[user])) {
                result += `\n${name}\t${coordinates}\t*${dimension}*`;
            }
            return result;
        } else {
            return 'you have no locations saved.';
        }
    },

    async remove(user, name) {
        this.config();

        if (this.locations.hasOwnProperty(user)) {
            if (this.locations[user].hasOwnProperty(name)) {
                delete this.locations[user][name];
                try {
                    await this.update_file();
                    return 'location deleted successfully.';
                } catch (err) {
                    throw err;
                }
            } else {
                return 'that location doesn\'t exist in the first place.';
            }
        } else {
            return 'that location doesn\'t exist in the first place.';
        }
    }
};

module.exports = async function(args, message) {
    switch (args[0]) {
        case 'add':
        case 'edit': // Fallthrough intentional here
            const command_str = args.slice(1, args.length).join(' ').trim();
            const match = /^(\S+) (\d+ \d+ \d+)(( overworld| nether| end).*|.*)?$/i.exec(command_str);
            if (match) {
                try {
                    if (match[3]) {
                        if (match[4]) {
                            if (args[0] === 'add') {
                                return await location_manager.add(message.author.id, match[1], match[2], match[4].trim());
                            } else {
                                return await location_manager.edit(message.author.id, match[1], match[2], match[4].trim());
                            }
                        } else {
                            message.reply(`I'm not sure what is at the end of your command, but if it's a dimension, it's misspelled, so I'm going to use 'overworld' as the dimension.`);
                            if (args[0] === 'add') {
                                return await location_manager.add(message.author.id, match[1], match[2], undefined);
                            } else {
                                return await location_manager.edit(message.author.id, match[1], match[2], undefined);
                            }
                        }
                    } else {
                        if (args[0] === 'add') {
                            return await location_manager.add(message.author.id, match[1], match[2], undefined);
                        } else {
                            return await location_manager.edit(message.author.id, match[1], match[2], undefined);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    return `I'm not sure what's going on, but for some reason I can't ${args[0]} your location now. I'm sorry.`;
                }
            } else {
                return `your syntax isn't correct. You can use \`~location help\` to figure out how to use this command.`;
            }
            break;
        case 'delete':
            try {
                return await location_manager.remove(message.author.id, args[1]);
            } catch (err) {
                console.error(err);
                return `I'm not sure what's going on, but for some reason I can't delete your location now. I'm sorry.`;
            }
            break;
        case 'list':
            return location_manager.list(message.author.id);
            break;
        case 'help':
            return get_help_message('location');
            break;
        default:
            return `that's not a command you silly goose!`
            break;
    }
}
