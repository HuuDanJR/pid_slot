const cron = require('node-cron');
const dboperation = require('./dboperation');  // Adjust the path as needed
const fs = require('fs');
const { format } = require('date-fns');
// const { broadcast } = require('./websocket_server');

let previousDataLength = null;  // Store the previous data length to detect changes
let countTotal = 0;  // Counter for runs with data.length > 0
let countjobScreen = 0;
let countjobAds = 0;
let currentCronJob = null;  // Store the current cron job

const screenID = 7; //OFF 
const adsID = 5; //SHOW ADS 

// Batch parameters
const BATCH_INTERVAL = 15 * 1000; // 15 seconds
let batchRequests = [];

function logToFile(message) {
    const now = new Date();
    const timestamp = format(now, 'hh:mm a MM/dd/yyyy');
    const logMessage = `${timestamp} - ${message}`;
    fs.appendFileSync('log_output.txt', logMessage + '\n', (err) => {
        if (err) throw err;
    });
}

function myJobScreen() {
    countjobScreen++;
    const message = `Running Screen (${countjobScreen})`;
    console.log(message);
    // dboperation.loadPreset(screenID)
    logToFile(message);
    // Add your logic here for when data.length === 0
}

function myJobAds() {
    countjobAds++;
    const message = `Running Ads (${countjobAds})`;
    console.log(message);
    // dboperation.loadPreset(adsID)
    logToFile(message);
    
    // Add your logic here for when data.length > 0
}

// Function to get the schedule interval based on data length
function getScheduleInterval(dataLength) {
    if (dataLength === 0 || dataLength === 1) {
        return '*/4 * * * * *';  // Every 4 seconds
    } else if (dataLength === 4 || dataLength === 3) {
        return '*/10 * * * * *';  // Every 10 seconds
    } else if (dataLength >= 4 && dataLength <= 5) {
        return '*/10 * * * * *';  // Every 10 seconds
    } else if (dataLength > 5 && dataLength <= 10) {
        return '*/40 * * * * *';  // Every 40 seconds
    } else {
        return '*/5 * * * * *';  // Default to every 5 seconds
    }
}

// Function to process batch requests
async function processBatchRequests() {
    const currentDate = new Date().toISOString().split('T')[0];
    const dataPromises = batchRequests.map(() => dboperation.getMachineOnlineStatus(currentDate));
    
    try {
        const results = await Promise.all(dataPromises);
        const dataLengths = results.map(data => data.length);
        const dataLength = dataLengths.reduce((acc, length) => acc + length, 0);

        countTotal++;

        if (previousDataLength !== dataLength) {
            if (dataLength === 0 && previousDataLength !== 0) {
                myJobAds();
            }

            if (dataLength > 0 && (previousDataLength === null || previousDataLength === 0)) {
                myJobScreen();
            }

            previousDataLength = dataLength;
            const newInterval = getScheduleInterval(dataLength);

            if (currentCronJob) {
                currentCronJob.stop();
            }
            currentCronJob = cron.schedule(newInterval, startCronJob);
        }
        console.log(`machineOnlineStatus: ${dataLength} (${countTotal})`);
    } catch (error) {
        console.log(`Error fetching machine online status: ${error}`);
    }

    batchRequests = []; // Clear the batch
}

// Function to start the cron job
async function startCronJob() {
    batchRequests.push(true);

    if (batchRequests.length === 1) {
        setTimeout(processBatchRequests, BATCH_INTERVAL);
    }
}

// Function to handle the initial run
async function initialRun() {
    const currentDate = new Date().toISOString().split('T')[0];
    try {
        const data = await dboperation.getMachineOnlineStatus(currentDate);
        const dataLength = data.length;
        if (dataLength === 0) {
            myJobAds();
        } else if (dataLength > 0) {
            myJobScreen();
        }
        previousDataLength = dataLength;
        const initialInterval = getScheduleInterval(dataLength);
        currentCronJob = cron.schedule(initialInterval, startCronJob);
    } catch (error) {
        console.log(`Error fetching machine online status during initial run: ${error}`);
    }
}

// Execute the initial run
initialRun();

// Function to stop the cron job
function stopCronJob() {
    if (currentCronJob) {
        currentCronJob.stop();
        // dboperation.loadPreset(screenID);
        console.log('Cron job stopped.');
        logToFile('Cron job stopped.');
    }
}

// Function to restart the cron job
async function reStartCronJob() {
    stopCronJob(); // Stop the current cron job if running
    await initialRun(); // Re-run the initial setup
    console.log('Cron job restarted.');
    logToFile('Cron job restarted.');
}

module.exports = {
    cron, stopCronJob, reStartCronJob,
};