const body_parser = require('body-parser');
const cors = require('cors');
const os = require('os');
const http = require('http');
const socketHandler = require('./socket/socket_handler');
const appRouter = require('./router');
const { setupSocket, checkServerConnectivity } = require('./socket');
const networkInterfaces = os.networkInterfaces();
const express = require('express');
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');


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

app.use(express.json());
app.use(express.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(cors());
app.use('/', appRouter);


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000, ipAddress, () => {
    console.log(`Server listening on ${ipAddress}:3000`);
});


setupSocket();
// Require the cron job file to start the cron job
require('./cronjob_v2.js');

