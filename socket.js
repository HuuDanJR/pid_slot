const dgram = require('dgram');
const os = require('os');
const networkInterfaces = os.networkInterfaces();

const client = dgram.createSocket('udp4');
const SERVER_IP = '192.168.100.160';
const SERVER_PORT = 6000;
const CLIENT_PORT = 3000;
const TIMEOUT = 6000; // 5 seconds

let ipAddress;
for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
            ipAddress = iface.address;
            break;
        }
    }
    if (ipAddress) {
        break;
    }
}

if (!ipAddress) {
    console.error('Failed to determine the IP address of the machine');
    process.exit(1);
}

const CLIENT_IP = ipAddress;

// Function to check UDP server connectivity
function checkServerConnectivity() {
    const pingMessage = 'ping';
    client.send(pingMessage, 0, pingMessage.length, SERVER_PORT, SERVER_IP, (err) => {
        if (err) {
            console.error('Error while sending ping message:', err);
        } else {
            console.log('Ping message sent to the server');
        }
    });
}

// Function to convert object to JSON string
function objectToJsonString(obj) {
    return JSON.stringify(obj);
}

// Function to parse JSON string to object
function jsonStringToObject(jsonString) {
    return JSON.parse(jsonString);
}

// Function to send a request to the server
function sendRequestToServer(request, callback) {
    const jsonString = objectToJsonString(request);
    const buffer = Buffer.from(jsonString, 'utf8');
    client.send(buffer, 0, buffer.length, SERVER_PORT, SERVER_IP, (err) => {
        if (err) {
            console.error('Error while sending request:', err);
            callback(err);
        } else {
            console.log('Request sent to the server');
        }
    });
}

// Function to set up the socket connection
function setupSocket() {
    // Start the client
    client.bind(CLIENT_PORT, CLIENT_IP, () => {
        console.log(`Client listening on ${CLIENT_IP}:${CLIENT_PORT}`);
        checkServerConnectivity();
    });

    // Timeout event handler
    let timeoutHandler = null;
    client.on('close', () => {
        clearTimeout(timeoutHandler); // Clear the timeout handler
        console.log('Socket closed. Reconnecting...');
        setTimeout(setupSocket, TIMEOUT); // Attempt to reconnect after the specified timeout
    });

    client.on('message', (message, remote) => {
        const jsonResponse = jsonStringToObject(message.toString('utf8'));
        console.log('Received response:', jsonResponse);
        if (jsonResponse.success) {
            // Request was successful, close the socket
            closeSocket();
        }
    });
}

// Function to close the socket
function closeSocket() {
    client.close();
    console.log('Socket closed');
}

module.exports = {
    setupSocket,
    checkServerConnectivity,
    sendRequestToServer
};