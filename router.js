const express = require('express');
const router = express.Router();
const dboperation = require('./dboperation');
const { sendRequestToServer, checkServerConnectivity } = require('./socket');
const cron = require('./cronjob_v2')

// Middleware to log requests
router.use((request, response, next) => {
    console.log('middleware! router');
    next();
});

// Define the GET endpoint
router.route('/').get(async (req, res, next) => {
    try {
        res.json('Novastar H-Series Controller APIs.');
    } catch (error) {
        next(error);
    }
});

router.route('/enum').get(async (req, res, next) => {
    try {
        res.json({
            "baccarat": 8,
            "roulette": 7,
            "ads": 5
        });
    } catch (error) {
        next(error);
    }
});

// Load preset by preset ID
router.route('/loadPreset').post(async (req, res, next) => {
    checkServerConnectivity();
    const { presetId } = req.body;
    const requestData = [
        {
            "cmd": "W0605",
            "deviceId": 0,
            "screenId": 0,
            "presetId": presetId
        }
    ];
    try {
        sendRequestToServer(requestData);
        res.json(`load preset ${presetId} successfully`);
    } catch (error) {
        next(error);
    }
});

// Machine online status
router.route('/machine_online_status').post((request, response) => {
    const { date } = request.body;
    dboperation.getMachineOnlineStatus(date).then(result => { response.json(result) });
});
// Machine online status
router.route('/stop_cron').get((req, res) => {
    cron.stopCronJob();
    res.json('Cron job stopped.');
});

module.exports = router; 