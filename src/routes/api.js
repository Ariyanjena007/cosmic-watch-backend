const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const asteroidController = require('../controllers/asteroidController');
const watchlistController = require('../controllers/watchlistController');
const alertController = require('../controllers/alertController');
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Asteroid Routes
router.get('/neo/feed', asteroidController.getFeed);
router.get('/neo/:id', asteroidController.getAsteroid);
router.post('/neo/refresh', asteroidController.refreshAsteroids);

// Watchlist Routes (Protected)
router.post('/watchlist', auth, watchlistController.addToWatchlist);
router.get('/watchlist', auth, watchlistController.getWatchlist);
router.delete('/watchlist/:id', auth, watchlistController.removeFromWatchlist);

// Alert Routes (Protected)
router.get('/alerts', auth, alertController.getAlerts);
router.put('/alerts/:id/read', auth, alertController.markAsRead);
router.post('/alerts/check', auth, alertController.checkAlerts);

// AI Chat Route
router.post('/chat', auth, aiController.chat);

module.exports = router;
