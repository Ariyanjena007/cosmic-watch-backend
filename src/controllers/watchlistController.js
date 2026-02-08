const User = require('../models/User');
const Asteroid = require('../models/Asteroid');

const addToWatchlist = async (req, res) => {
    try {
        const { asteroidId, name, alertThresholds } = req.body;

        // Check if already in watchlist
        const alreadyWatched = req.user.watchlist.find(a => a.asteroidId === asteroidId);
        if (alreadyWatched) {
            return res.status(400).json({ message: 'Asteroid already in watchlist' });
        }

        req.user.watchlist.push({ asteroidId, name, alertThresholds });
        await req.user.save();

        res.status(201).json(req.user.watchlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getWatchlist = async (req, res) => {
    try {
        res.json(req.user.watchlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeFromWatchlist = async (req, res) => {
    try {
        req.user.watchlist = req.user.watchlist.filter(a => a.asteroidId !== req.params.id);
        await req.user.save();
        res.json(req.user.watchlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addToWatchlist, getWatchlist, removeFromWatchlist };
