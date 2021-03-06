const fs = require('fs');

module.exports = function(path) {
    return new Promise((resolve,reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.split('\n'));
        });
    });
};
