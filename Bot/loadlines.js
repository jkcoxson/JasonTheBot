const fs = require('fs');

module.exports = function loadlines(path) {
    return new Promise((resolve,reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(data.split('\n'));
        });
    });
};
