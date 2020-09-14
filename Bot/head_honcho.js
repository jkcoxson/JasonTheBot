const roles = require('./configs/role-ids.json');
const guilds = require('./configs/guild-ids.json');

module.exports = function is_head_honcho(member) {
    return (member.roles.cache.find(role => role.id === roles['sqad leader']) || 
        member.guild.id === guilds['jacksons-test-server']);
}