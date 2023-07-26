const express = require('express');
var body_parser = require('body-parser')
const dgram = require('dgram');
const os = require('os');
const networkInterfaces = os.networkInterfaces();
var app = express();
var router = express.Router();
var cors = require('cors')



let ipAddress;
for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
        // Skip over non-IPv4 and internal (loopback) addresses
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

const client = dgram.createSocket('udp4');
const SERVER_IP = '192.168.100.160';
const SERVER_PORT = 6000;
const CLIENT_PORT = 3000;
const TIMEOUT = 6000; // 5 seconds
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

const inputData = [{
    cmd: "W0605",
    deviceId: 0,
    screenId: 0,
    presetId: 6
}];



// Function to send a request to the server
function sendRequestToServer(request, callback) {
    const jsonString = objectToJsonString(request);
    const buffer = Buffer.from(jsonString, 'utf8');
    client.send(buffer, 0, buffer.length, SERVER_PORT, SERVER_IP, (err) => {
        if (err) {
            console.error('Error while sending request:', err);
            callback(err)
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
        // sendRequestToServer(inputData);
        loadPreset;
    });
// Function to close the socket
function closeSocket() {
    client.close();
    console.log('Socket closed');
}




 // Timeout event handler
  let timeoutHandler = null;
    // // Timeout event handler
    // const timeoutHandler = setTimeout(() => {
    //     console.log('Server is unreachable.');
    //     client.close();
    // }, TIMEOUT);

 // Event handler for when the socket is closed
  client.on('close', () => {
    clearTimeout(timeoutHandler); // Clear the timeout handler
    console.log('Socket closed. Reconnecting...');
    setTimeout(setupSocket, TIMEOUT); // Attempt to reconnect after the specified timeout
  });


    // // Event handler for when the socket is closed
    // client.on('close', () => {
    //     clearTimeout(timeoutHandler); // Clear the timeout handler
    //     console.log('Socket closed. Reconnecting...');
    //     setupSocket(); // Attempt to reconnect
    // });
// Event handler for incoming messages
client.on('message', (message, remote) => {
    const jsonResponse = jsonStringToObject(message.toString('utf8'));
    console.log('Received response:', jsonResponse);
    if (jsonResponse.success) {
        // Request was successful, close the socket
        closeSocket();
    }
});
}






app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.use(cors())
app.use('/', router)
router.use((request, response, next) => {
    console.log('middleware!');
    next();
});
router.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});
// Start the server
app.listen(3000, ipAddress, () => {
    console.log(`Server listening on ${ipAddress}:3000`);
});
// Define the GET endpoint
router.route('/').get(async (req, res, next) => {
    try {
        res.json({
            "baccarat":8,
            "roulette":8,
        });
    } catch (error) {
        next(error);
    }
});
//load preset by preset ID
const loadPreset = router.route('/loadPreset').post(async (req, res, next) => {
    checkServerConnectivity();
    const { presetId } = req.body;
    const requestData = [
        {
            "cmd": "W0605",
            "deviceId": 0,
            "screenId": 0,
            "presetId": presetId
        }
    ]
    try {
        sendRequestToServer(requestData);
        res.json(`load preset ${presetId} successfully `,)
    } catch (error) {
        next(error);
    }
});


setupSocket();