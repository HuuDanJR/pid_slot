//default:5
// dboperation.loadPreset(5);
//default:7
// dboperation.loadPreset(7);


const cron = require('node-cron');
const dboperation = require('./dboperation');  // Adjust the path as needed
const fs = require('fs');
const { format } = require('date-fns');


let previousDataLength = null;  // Store the previous data length to detect changes
let countTotal = 0;  // Counter for runs with data.length > 0
let countjobScreen = 0;
let countjobAds = 0;


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
    logToFile(message);
    // Add your logic here for when data.length === 0
}

function myJobAds() {
    countjobAds++;
    const message = `Running Ads (${countjobAds})`;
    console.log(message);
    logToFile(message);
    // Add your logic here for when data.length > 0
}

// Function to handle the initial run
async function initialRun() {
    const currentDate = new Date().toISOString().split('T')[0];
    try {
        const data = await dboperation.getMachineOnlineStatus(currentDate);
        const dataLength = data.length;
        // Initial run condition check
        if (dataLength === 0) {
            myJobAds();
        } else if (dataLength > 0) {
            myJobScreen();
        }
        // Set previousDataLength to the current data length after the initial run
        previousDataLength = dataLength;
    } catch (error) {
        console.log(`Error fetching machine online status during initial run: ${error}`);
    }
}

// Execute the initial run
initialRun();

// Cron job to fetch machine online status every 5 seconds
cron.schedule('*/10 * * * * *', async () => {
    const currentDate = new Date().toISOString().split('T')[0];  // Example: '2021-09-20'
    try {
        const data = await dboperation.getMachineOnlineStatus(currentDate);
        const dataLength = data.length;
        countTotal++;

        // Check if there's a change in data length
        if (previousDataLength !== dataLength) {
            // Run myJob() if data length changes to 0 and it's the first time or a change from > 0
            if (dataLength === 0 && previousDataLength !== 0) {
                myJobAds();
            }
            // Run myJob2() if data length changes to > 0 and it's the first time or a change from 0
            if (dataLength > 0 && (previousDataLength === null || previousDataLength === 0)) {
                myJobScreen();
            }

            // Update the previous data length to the current data length
            previousDataLength = dataLength;
        }
        console.log(`machineOnlineStatus: ${dataLength} (${countTotal})`);
    } catch (error) {
        console.log(`error fetching machine online status: ${error}`);
    }
});




module.exports = cron;