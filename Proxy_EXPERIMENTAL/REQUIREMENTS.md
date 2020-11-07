# Overview
This proxy should link Minecraft clients to upstream Minecraft servers, facilitate transfers between servers, and allow Node.js to access some server information. Below is a list of things that this proxy must do:
* Bind to downstream ports and forward traffic from clients of those ports to upstream servers, and vice versa. Servers are specified in the `config/servers.json` file. **See also**: **config/servers.json**
* Also bind to the default Minecraft Bedrock port (19132) for those who can't specify a server port. This port should forward packets to the most recent server that the client has connected to, or the first server in the config is there is no recent server. **See also**: **Recent Servers**
* Facilitate transfering of clients between upstream servers by sending a specific command in the Minecraft chat. This command's name is defined in `config/transfer_command.txt` **See also**: **Switching Servers**
* Communicate with its parent Node.js process through stdin and stdout. This allows the Node.js process to be aware of certain game events, such as death, sleeping, and chat messages. **See also**: **Message Formats**
# config/servers.json
The `config/servers.json` file stores the config for upstream servers. The entire JSON object is a list of JSON objects, which define the configuration for a specific server. The format is as follows:

    {
        "name": "server name",
        "upstreamPort": upstream port,
        "downstreamPort": downstream port,
        "services": [services for this specific server]
    }

## Specific JSON Fields
* name (string)
    The name that the proxy should use to identify this specific server. It can be different from the actual server name. It is used to differentiate between the different servers in communication with the Node.js application and in the transfer server command used by Minecraft clients. The name must not be more than 255 characters long.
* upstreamPort (integer)

    The port that the upstream server listens on.

* downstreamPort (integer)

    The port that the proxy should listen on for the specific upstream server.

* services (array\<string\>)

    The services that the proxy should provide to the Node.js application. Possible values include:

    * "death_reporting"

        When a player dies, the proxy will log the name of the player that died to stdout for the Node.js application to pick up, according to established formats. **See also**: **Message Formats**

    * "chat_reporting"

        When a player sends a chat message, the proxy will log the name of the player and the message sent to stdout for the Node.js application to pick up, according to established formats. **See also**: **Message Formats**

    * "chat_forwarding"

        The proxy will forward chat messages given to the proxy from the Node.js application through stdin to the game, according to established formats. **See also**: **Message Formats**

    * "sleep_reporting"

        When a player sleeps, the proxy will log the name of the player that slept to stdout for the Node.js application to pick up, according to established formats. **See also**: **Message Formats**

# Recent servers
When a client connects to the default server through the default 19132 listener (when they don't have a recent server yet), switches servers, or connects directly to a server through the specific downstream port, the server they just connected to should be saved as their most recent server, so it can be retrieved later if they connect to the default 19132 listener.
# Switching Servers
When a client sends a chat message with the command to transfer servers, the proxy should send a `Transfer` packet to the client with the appropriate server information and close the connection with the client. The proxy will pick the connection up when the client connects to a different port.
# Message Formats
Messages passed between the proxy and Node.js application follow a modified TLV (type-length-value) format. The first byte of the message identifies what type of message it is, and the rest of the packet contains the content.

The messages are as follows (all numbers are big endian):
* Death report:
    * Identifier (first byte) is 1 (00000001)
    * Next byte is the length of the server name
    * Next is the server name
    * Next is the name of the player that died
* Chat report:
    * Identifier (first byte) is 2 (00000010)
    * Next byte is the length of the server name
    * Next two bytes are the length of the player name
    * Next is the server name
    * Next is the name of the player that sent the message
    * Next is the chat message
* Chat forward:
    * Identifier (first byte) is 3 (00000011)
    * Next byte is the length of the server name
    * Next two bytes are the length of the player name that should be displayed to the client
    * Next is the server name
    * Next is the displayed player name
    * Next is the chat message
* Sleep report:
    * Identifier (first byte) is 4 (00000100)
    * Next byte is the length of the server name
    * Next is the server name
    * Next is the name of the player that slept