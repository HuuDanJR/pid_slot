
// websocket_client.js
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
    console.log('Connected to WebSocket server');
});

ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.event === 'dataLengthChange') {
        handleDataLengthChange(data.dataLength);
    }
});

ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
});

function handleDataLengthChange(dataLength) {
    // Implement your logic here based on dataLength
    console.log(`Data length changed to: ${dataLength}`);
}

module.exports = ws;