const axios = require('axios');
const Asteroid = require('../models/Asteroid');
const { calculateRiskScore } = require('./riskEngine');
const { InMemoryAsteroid, isMongoConnected } = require('../utils/inMemoryStorage');

const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1';
const API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

const getAsteroidModel = () => isMongoConnected() ? Asteroid : InMemoryAsteroid;

const fetchAsteroidFeed = async (startDate, endDate) => {
    try {
        const response = await axios.get(`${NASA_API_URL}/feed`, {
            params: {
                start_date: startDate,
                end_date: endDate,
                api_key: API_KEY
            }
        });

        const neoData = response.data.near_earth_objects;
        const normalizedAsteroids = [];

        for (const date in neoData) {
            for (const neo of neoData[date]) {
                const asteroidObj = {
                    asteroidId: neo.id,
                    name: neo.name,
                    diameter: {
                        min: neo.estimated_diameter.kilometers.estimated_diameter_min,
                        max: neo.estimated_diameter.kilometers.estimated_diameter_max
                    },
                    velocity: {
                        km_per_second: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second),
                        km_per_hour: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour)
                    },
                    miss_distance: {
                        kilometers: parseFloat(neo.close_approach_data[0].miss_distance.kilometers),
                        lunar: parseFloat(neo.close_approach_data[0].miss_distance.lunar)
                    },
                    close_approach_date: new Date(neo.close_approach_data[0].close_approach_date),
                    is_potentially_hazardous: neo.is_potentially_hazardous_asteroid,
                    orbital_data: neo.orbital_data ? {
                        eccentricity: parseFloat(neo.orbital_data.eccentricity),
                        semi_major_axis: parseFloat(neo.orbital_data.semi_major_axis),
                        inclination: parseFloat(neo.orbital_data.inclination),
                        ascending_node_longitude: parseFloat(neo.orbital_data.ascending_node_longitude),
                        perihelion_argument: parseFloat(neo.orbital_data.perihelion_argument),
                        mean_anomaly: parseFloat(neo.orbital_data.mean_anomaly),
                        orbital_period: parseFloat(neo.orbital_data.orbital_period),
                        epoch_osculation: parseFloat(neo.orbital_data.epoch_osculation)
                    } : undefined
                };

                const { score, category } = calculateRiskScore(asteroidObj);
                asteroidObj.risk_score = score;
                asteroidObj.risk_category = category;

                // Upsert to storage (MongoDB or in-memory)
                if (isMongoConnected()) {
                    await Asteroid.findOneAndUpdate(
                        { asteroidId: asteroidObj.asteroidId },
                        asteroidObj,
                        { upsert: true, new: true }
                    );
                } else {
                    const existing = await InMemoryAsteroid.findOne({ asteroidId: asteroidObj.asteroidId });
                    if (existing) {
                        Object.assign(existing, asteroidObj);
                    } else {
                        await new InMemoryAsteroid(asteroidObj).save();
                    }
                }

                normalizedAsteroids.push(asteroidObj);
            }
        }

        return normalizedAsteroids;
    } catch (error) {
        console.error('Error fetching NASA data:', error.message);
        throw error;
    }
};

const getAsteroidById = async (id) => {
    try {
        const AsteroidModel = getAsteroidModel();
        let asteroid = await AsteroidModel.findOne({ asteroidId: id });

        if (!asteroid || !asteroid.orbital_data) {
            const response = await axios.get(`${NASA_API_URL}/neo/${id}`, {
                params: { api_key: API_KEY }
            });

            const neo = response.data;
            const asteroidObj = {
                asteroidId: neo.id,
                name: neo.name,
                diameter: {
                    min: neo.estimated_diameter.kilometers.estimated_diameter_min,
                    max: neo.estimated_diameter.kilometers.estimated_diameter_max
                },
                velocity: {
                    km_per_second: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second),
                    km_per_hour: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour)
                },
                miss_distance: {
                    kilometers: parseFloat(neo.close_approach_data[0].miss_distance.kilometers),
                    lunar: parseFloat(neo.close_approach_data[0].miss_distance.lunar)
                },
                close_approach_date: new Date(neo.close_approach_data[0].close_approach_date),
                is_potentially_hazardous: neo.is_potentially_hazardous_asteroid,
                orbital_data: {
                    eccentricity: parseFloat(neo.orbital_data.eccentricity),
                    semi_major_axis: parseFloat(neo.orbital_data.semi_major_axis),
                    inclination: parseFloat(neo.orbital_data.inclination),
                    ascending_node_longitude: parseFloat(neo.orbital_data.ascending_node_longitude),
                    perihelion_argument: parseFloat(neo.orbital_data.perihelion_argument),
                    mean_anomaly: parseFloat(neo.orbital_data.mean_anomaly),
                    orbital_period: parseFloat(neo.orbital_data.orbital_period),
                    epoch_osculation: parseFloat(neo.orbital_data.epoch_osculation)
                }
            };

            const { score, category } = calculateRiskScore(asteroidObj);
            asteroidObj.risk_score = score;
            asteroidObj.risk_category = category;

            if (isMongoConnected()) {
                asteroid = await Asteroid.findOneAndUpdate(
                    { asteroidId: asteroidObj.asteroidId },
                    asteroidObj,
                    { upsert: true, new: true }
                );
            } else {
                asteroid = new InMemoryAsteroid(asteroidObj);
                await asteroid.save();
            }
        }

        return asteroid;
    } catch (error) {
        console.error('Error fetching asteroid by ID:', error.message);
        throw error;
    }
};

module.exports = { fetchAsteroidFeed, getAsteroidById };
