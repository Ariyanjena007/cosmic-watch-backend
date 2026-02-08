const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    asteroidId: {
        type: String,
        required: true
    },
    asteroidName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['HAZARD', 'APPROACH', 'WATCHLIST', 'SYSTEM'],
        default: 'APPROACH'
    },
    severity: {
        type: String,
        enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
        default: 'LOW'
    },
    riskScore: {
        type: Number,
        default: 0
    },
    missDistance: {
        type: Number, // in kilometers
        default: 0
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', alertSchema);
