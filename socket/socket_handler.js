const dboperation = require('../dboperation');
// const cron = require('node-cron');

function  handleSocketIO(io)  {
    io.on('connection', (socket) => {
        console.log('A user connected', socket.id);
        async function fetchAndEmitData(date) {
            try {
                const data = await dboperation.getMachineOnlineStatus(date);
                socket.emit('machineOnlineStatus', data);
            } catch (error) {
                console.log(`Error fetching machine online status: ${error}`);
            }
        }
        // Initial fetch when user connects
        const currentDate = new Date().toISOString().split('T')[0]; // Example: '2021-09-20'
        fetchAndEmitData(currentDate);

        // Set up a cron job to fetch data every 5 seconds
        const cronJob = cron.schedule('*/5 * * * * *', () => {
            const currentDate = new Date().toISOString().split('T')[0]; // Example: '2021-09-20'
            fetchAndEmitData(currentDate);
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected', socket.id);
            // cronJob.stop();
        });
    });
}

module.exports = {
    handleSocketIO,
};