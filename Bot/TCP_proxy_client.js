const { stdin, stdout } = require('process');
const { createConnection } = require('net');
const process = require('process');

const port = 8080;
const conn = createConnection(port, 'localhost');
conn.pipe(stdout);
stdin.pipe(conn);
conn.on('end', error => {
    conn.end();
    process.exit();
});
