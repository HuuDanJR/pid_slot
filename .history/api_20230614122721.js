// var express = require('express')
// var body_parser = require('body-parser')
// var cors = require('cors')
// var app = express();
// var router = express.Router();
// var fs = require('fs');
// var cmd = require('node-cmd');
// var app = express();
// var path = require('path');


// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
// app.use(body_parser.urlencoded({ extended: true }))
// app.use(body_parser.json())
// app.use(cors())
// app.use('/api', router)

// router.use((request, response, next) => {
//     console.log('middleware!');
//     next();
// });

// router.use((err, req, res, next) => {
//     console.error('Error:', err.message);
//     res.status(500).json({ error: 'Internal Server Error' });
// });


// var port = process.env.PORT || 8090;
// app.listen(port);
// console.log('app running port ' + port);


// // Customer date frame 
// router.route('/').get(async (req, res, next) => {
//     try {
//     res.json('home page');
//   } catch (error) {
//     next(error);
//   }
// })



const express = require('express');
var body_parser = require('body-parser')
const dgram = require('dgram');
const os = require('os');
const networkInterfaces = os.networkInterfaces();
var app = express();
var router = express.Router();
var path = require('path');
var cors = require('cors')





// Find the IP address assigned to the machine
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

// Verify that an IP address was found
if (!ipAddress) {
  console.error('Failed to determine the IP address of the machine');
  process.exit(1);
}

// Update the CLIENT_IP variable with the obtained IP address


// Create a UDP client socket
const client = dgram.createSocket('udp4');

// Define the remote server's IP and port
const SERVER_IP = '192.168.100.160';
const SERVER_PORT = 6000;

// Define the local client port and IP
const CLIENT_PORT = 3000;
// const CLIENT_IP = 'localhost';
const CLIENT_IP = ipAddress;




app.use(express.json());
// Start the server
app.listen(3000, ipAddress, () => {
  console.log(`Server listening on ${ipAddress}:3000`);
});

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




// Function to check UDP server connectivity
function checkServerConnectivity() {
  // Send a "ping" message to the server
  const pingMessage = 'ping';
  client.send(pingMessage, 0, pingMessage.length, SERVER_PORT, SERVER_IP, (err) => {
    if (err) {
      console.error('Error while sending ping message:', err);
    } else {
      console.log('Ping message sent to the server');
    }
  });
}




// Function to send a request to the server
function sendRequestToServer(request) {
  const jsonString = objectToJsonString(request);
  const buffer = Buffer.from(jsonString, 'utf8');
  client.send(buffer, 0, buffer.length, SERVER_PORT, SERVER_IP, (err) => {
    if (err) {
      console.error('Error while sending request:', err);
    } else {
      console.log('Request sent to the server');
    }
  });
}



// Start the client
client.bind(CLIENT_PORT, CLIENT_IP, () => {
  console.log(`Client listening on ${CLIENT_IP}:${CLIENT_PORT}`);
  checkServerConnectivity();

    //   const inputData = [{
    //     cmd: "W0605",
    //     deviceId: 0,
    //     screenId: 0,
    //     presetId: 5
    //   }];
    //   sendRequestToServer(inputData);
});

// Event handler for incoming messages
client.on('message', (message, remote) => {
  const jsonResponse = jsonStringToObject(message.toString('utf8'));
  console.log('Received response:', jsonResponse);
  client.close();
});

// Timeout to consider server unreachable
const TIMEOUT = 5000; // 5 seconds

// Timeout event handler
const timeoutHandler = setTimeout(() => {
  console.log('Server is unreachable.');
  client.close();
}, TIMEOUT);
// Event handler for when the socket is closed
client.on('close', () => {
  clearTimeout(timeoutHandler); // Clear the timeout handler
});


// Define the GET endpoint
router.route('/').get(async (req, res, next) => {
    try {
    res.json('home page APIs novastar controller');
  } catch (error) {
    next(error);
  }
})
//load preset by preset ID
router.route('/').get(async (req, res, next) => {
    try {
    res.json('home page APIs novastar controller');
  } catch (error) {
    next(error);
  }
})

// Define the API endpoint
app.post('/sendRequest', (req, res) => {
  // Extract parameters from the request body
  const { cmd, deviceId, screenId, presetId } = req.body;

  // Create the input data object
  const inputData = {
    cmd,
    deviceId,
    screenId,
    presetId
  };

  // Send the input data to the server
  sendRequestToServer(inputData, res);
});
