const mongoose = require('mongoose');

const asteroidSchema = new mongoose.Schema({
    asteroidId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    diameter: {
        min: Number,
        max: Number,
        unit: { type: String, default: 'kilometers' }
    },
    velocity: {
        km_per_second: Number,
        km_per_hour: Number
    },
    miss_distance: {
        kilometers: Number,
        lunar: Number
    },
    close_approach_date: Date,
    is_potentially_hazardous: Boolean,
    risk_score: Number,
    risk_category: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    orbital_data: {
        eccentricity: Number,
        semi_major_axis: Number,
        inclination: Number,
        ascending_node_longitude: Number,
        perihelion_argument: Number,
        mean_anomaly: Number,
        orbital_period: Number,
        epoch_osculation: Number
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Asteroid', asteroidSchema);
