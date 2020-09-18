const { stdin, stdout } = require('process');
const { createConnection } = require('net');
const process = require('process');
const config = require('./configs/bedrock_server.config.json');

const port = config.TCP_proxy_port;
const conn = createConnection(port, config.node_server_ip);
conn.pipe(stdout);
stdin.pipe(conn);
conn.on('end', error => {
    conn.end();
    process.exit();
});
