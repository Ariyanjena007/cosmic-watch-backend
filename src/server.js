const express = require('express');
// Cosmic Watch Backend Server
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const asteroidRoutes = require('./routes/asteroids');
const aiRoutes = require('./routes/ai');
const alertRoutes = require('./routes/alerts');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/neo', asteroidRoutes);
app.use('/api/chat', aiRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.warn('⚠️  MongoDB connection failed. Running in DEMO mode with in-memory storage.');
        console.warn('   To use persistent storage, set up MongoDB Atlas or install MongoDB locally.');
    }
};

connectDB();

// Initialize cron jobs
const { initCronJobs } = require('./services/cronService');
initCronJobs();
console.log('Cron jobs initialized: Daily Asteroid Check active.');

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Cosmic Watch API running on port ${PORT}`);
    console.log(`   Frontend: http://localhost:3000`);
    console.log(`   Backend:  http://localhost:${PORT}/api`);
});

module.exports = { app, server };
