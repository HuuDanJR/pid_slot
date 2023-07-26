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
var ScreenConfigurator= require('@novastar/screen');
var net = require('@novastar/net');
var findNetDevices = net.findNetDevices;
var serial = require('@novastar/serial');
var findSendingCards = serial.findSendingCards;


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


const ctrl = new ScreenConfigurator(session);
await ctrl.reload();

//FRONT END VIEw
app.use('/ui', router)
app.use(express.static('web_new/web'));
app.use(express.static('web_new/web/assets'));
app.use(express.static('web_new/web-staff'));
app.use(express.static('web_new/web-staff/assets'));
router.get('/client', (request, response) => {
    response.sendFile(path.resolve('./web_new/web/index.html'));
})


async function mainFunc() {
    // net
    const [address] = await findNetDevices();
    if (!address) return;
    const sessionNet = net.open(address);
  
    // serial
    const [port] = await findSendingCards();
    const sessionSerial = await serial.open(port.path);
  
    const ctrl = new ScreenConfigurator(sessionSerial);
    await ctrl.reload();
    // Get input DVI signal status
    const hasDVISignalIn = await ctrl.ReadHasDVISignalIn();
    // Request the brightness of the first receiving card on the screen.
    const firstCardBrightness = await ctrl.ReadFirstBrightness();
    for await (let brightness of ctrl.ReadBrightness()) {
        // Request the brightness of all receiving cards on the screen using a generator.
    }
    // Write the specified brightness value to all receiving cards.
    await ctrl.WriteBrightness(80);
}



//Customer date frame 
router.route('/').get(async(req, res, next) => {
    try {
    mainFunc();
    res.json('home page');
  } catch (error) {
    next(error);
  }
})


