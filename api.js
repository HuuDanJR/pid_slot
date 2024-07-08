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
const app2 = express();
const server = http.createServer(app);
const server2 = http.createServer(app2);
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

app2.use(express.json());
app2.use(body_parser.urlencoded({ extended: true }));
app2.use(body_parser.json());
app2.use(cors());



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






//APP 2
app2.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app2.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});


const PORT2 = process.env.PORT || 3001;
app2.listen(PORT2);
console.log('Server 2 listening on ' + PORT2);


const socketIo2 = socketIo(server2, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
socketHandler.handleSocketIO(socketIo2);
setupSocket();