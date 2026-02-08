const express = require('express');
// Backend restart for OpenAI migration
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const { initSocket } = require('./sockets/socketManager');
const { initCronJobs } = require('./services/cronService');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Cosmic Watch API is operational' });
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmic-watch';
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
    })
    .catch(err => {
        console.warn('⚠️  MongoDB connection failed. Running in DEMO mode with in-memory storage.');
        console.warn('   To use persistent storage, set up MongoDB Atlas or install MongoDB locally.');
    });

// Initialize Socket.io
const io = initSocket(server);
app.set('io', io);

// Initialize Cron Jobs (will work with or without DB)
initCronJobs(io);

// Start Server (don't wait for DB connection)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Cosmic Watch API running on port ${PORT}`);
    console.log(`   Frontend: http://localhost:3000`);
    console.log(`   Backend:  http://localhost:${PORT}/api`);
});
