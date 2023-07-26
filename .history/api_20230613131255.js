var express = require('express')
var body_parser = require('body-parser')
var cors = require('cors')
var app = express();
var router = express.Router();
var fs = require('fs');
var cmd = require('node-cmd');
var app = express();
var router = express.Router();
var path = require('path');


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.use(cors())
app.use('/api', router)

router.use((request, response, next) => {
    console.log('middleware!');
    next();
});

router.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});


var port = process.env.PORT || 8090;
app.listen(port);
console.log('app running port ' + port);


// Customer date frame 
router.route('/').get(async (req, res, next) => {
    try {
    res.json('home page');
  } catch (error) {
    next(error);
  }
})





const dgram = require('dgram');

// Create a UDP client socket
const client = dgram.createSocket('udp4');

// Define the remote controller's IP and port
const CONTROLLER_IP = '113.161.67.190npm ';
const CONTROLLER_PORT = 6000;

// Define the local client port and IP
const CLIENT_PORT = 6000;
const CLIENT_IP = '192.168.100.160';

// Function to convert object to HEX string
function objectToHex(obj) {
  const jsonString = JSON.stringify(obj);
  const buffer = Buffer.from(jsonString, 'utf8');
  return buffer.toString('hex');
}

// Create an API endpoint for sending a request to the controller
function sendRequestToController(request) {
  const hexPayload = objectToHex(request);

  client.send(hexPayload, 0, hexPayload.length, CONTROLLER_PORT, CONTROLLER_IP, (err) => {
    if (err) {
      console.error('Error while sending request:', err);
    } else {
      console.log('Request sent to the controller');
    }
  });
}

// Start the client
client.bind(CLIENT_PORT, CLIENT_IP, () => {
  console.log(`Client listening on ${CLIENT_IP}:${CLIENT_PORT}`);
});

// Example usage: send the input data as a HEX payload to the controller
const inputData = [{
  cmd: "W0605",
  deviceId: 0,
  screenId: 0,
  presetId: 0
}];

sendRequestToController(inputData);


