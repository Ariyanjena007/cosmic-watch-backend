const nasaService = require('../services/nasaService');
const Asteroid = require('../models/Asteroid');
const { InMemoryAsteroid, isMongoConnected } = require('../utils/inMemoryStorage');

const getAsteroidModel = () => isMongoConnected() ? Asteroid : InMemoryAsteroid;

const getFeed = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Default to last 7 days if not provided
        const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];

        // Check cache first for this range or just fetch new
        // For simplicity, we fetch and upsert
        const asteroids = await nasaService.fetchAsteroidFeed(start, end);
        res.json(asteroids);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAsteroid = async (req, res) => {
    try {
        const asteroid = await nasaService.getAsteroidById(req.params.id);
        res.json(asteroid);
    } catch (error) {
        res.status(404).json({ message: 'Asteroid not found' });
    }
};

const refreshAsteroids = async (req, res) => {
    try {
        const start = new Date().toISOString().split('T')[0];
        const asteroids = await nasaService.fetchAsteroidFeed(start, start);
        res.json({ message: 'Refresh successful', count: asteroids.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getFeed, getAsteroid, refreshAsteroids };
