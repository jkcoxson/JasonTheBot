const { stdin, stdout } = require('process');
const { createConnection } = require('net');
const process = require('process');

// Configuration
const ip = (process.argv[2]) ? process.argv[2] : "192.168.1.40";
const parsed = parseInt(process.argv[3]);
const port = (parsed) ? parsed : 12345;
const conn = createConnection(port, ip);

// Pipe stuff
conn.pipe(stdout);
stdin.pipe(conn);

// End the program when connection ends
conn.on('end', error => {
    conn.end();
    process.exit();
});
