const cron = require('node-cron');
const { performRiskAnalysis } = require('./alertService');

const initCronJobs = (io) => {
    // Check for alerts every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        try {
            await performRiskAnalysis(io);
        } catch (error) {
            console.error('Cron job error:', error.message);
        }
    });

    console.log('Cron jobs initialized: Daily Asteroid Check active.');
};

module.exports = { initCronJobs };
