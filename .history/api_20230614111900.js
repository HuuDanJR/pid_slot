const dgram = require('dgram');

// Create a UDP client socket
const client = dgram.createSocket('udp4');

// Define the remote server's IP and port
const SERVER_IP = '192.168.100.160';
const SERVER_PORT = 6000;

// Define the local client port and IP
const CLIENT_PORT = 3000;
const CLIENT_IP = 'localhost';

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

// Start the client
client.bind(CLIENT_PORT, CLIENT_IP, () => {
  console.log(`Client listening on ${CLIENT_IP}:${CLIENT_PORT}`);
  
  // Check server connectivity after the client has started
  checkServerConnectivity();
});

// Event handler for incoming messages
client.on('message', (message, remote) => {
  console.log(`Received response: ${message.toString()} from ${remote.address}:${remote.port}`);
  
  // Server is considered reachable if a response is received
  console.log('Server is reachable.');
  
  // Close the client socket
  client.close();
});

// Timeout to consider server unreachable
const TIMEOUT = 5000; // 5 seconds

// Timeout event handler
setTimeout(() => {
  console.log('Server is unreachable.');
  client.close();
}, TIMEOUT);