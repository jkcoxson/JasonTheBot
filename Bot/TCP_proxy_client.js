const { stdin, stdout } = require('process');
const { createConnection } = require('net');
const process = require('process');
const config = require('./bedrock_server.config.json');

const port = config.TCP_proxy_port;
const conn = createConnection(port, 'localhost');
conn.pipe(stdout);
stdin.pipe(conn);
conn.on('end', error => {
    conn.end();
    process.exit();
});
