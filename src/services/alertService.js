const { InMemoryAlert, isMongoConnected } = require('../utils/inMemoryStorage');
const Alert = require('../models/Alert');
const User = require('../models/User');
const Asteroid = require('../models/Asteroid');
const { fetchAsteroidFeed } = require('./nasaService');
const { sendAlertEmail } = require('./emailService');

const ALERT_CONFIG = {
    CRITICAL_RISK_THRESHOLD: 70,
    HIGH_RISK_THRESHOLD: 50,
    CLOSE_APPROACH_AU: 0.05, // ~7.5 million km
};

const getAlertModel = () => isMongoConnected() ? Alert : InMemoryAlert;

const determineAlertConfig = (asteroid) => {
    if (asteroid.risk_score >= ALERT_CONFIG.CRITICAL_RISK_THRESHOLD) {
        return { type: 'HAZARD', severity: 'CRITICAL' };
    }
    if (asteroid.risk_score >= ALERT_CONFIG.HIGH_RISK_THRESHOLD) {
        return { type: 'HAZARD', severity: 'HIGH' };
    }
    if (asteroid.is_potentially_hazardous ||
        (asteroid.miss_distance && asteroid.miss_distance.lunar < 19.5)) {
        return { type: 'APPROACH', severity: 'MEDIUM' };
    }
    return null;
};

const generateAlertMessage = (asteroid, config) => {
    const messages = {
        CRITICAL: `🔴 CRITICAL THREAT DETECTED: ${asteroid.name}\nRisk Score: ${asteroid.risk_score}/100\nMiss Distance: ${asteroid.miss_distance?.kilometers?.toFixed(0) || 'Unknown'} km`,
        HIGH: `🟠 HIGH-RISK OBJECT: ${asteroid.name}\nRisk Score: ${asteroid.risk_score}/100\nClose Approach: ${new Date(asteroid.close_approach_date).toLocaleDateString()}`,
        MEDIUM: `🟡 POTENTIALLY HAZARDOUS: ${asteroid.name}\nClassification: ${asteroid.is_potentially_hazardous ? 'NASA PHO' : 'Close Approach'}\nMiss Distance: ${asteroid.miss_distance?.kilometers?.toFixed(0) || 'Unknown'} km`
    };
    return messages[config.severity] || `Asteroid ${asteroid.name} detected`;
};

const generateAlertsForAsteroids = async (asteroids, userId = null) => {
    const AlertModel = getAlertModel();
    const generatedAlerts = [];

    for (const asteroid of asteroids) {
        const config = determineAlertConfig(asteroid);

        if (config) {
            const message = generateAlertMessage(asteroid, config);

            const alertData = {
                user: userId, // Assuming userId is passed, system alerts might need handling
                asteroidId: asteroid.asteroidId,
                asteroidName: asteroid.name,
                type: config.type,
                severity: config.severity,
                message,
                riskScore: asteroid.risk_score,
                missDistance: asteroid.miss_distance?.kilometers || 0,
                isRead: false,
                createdAt: new Date()
            };

            try {
                let alert;
                if (isMongoConnected()) {
                    // Check if alert already exists for this asteroid today to avoid spam
                    // Rough check based on date or just existance
                    const existing = await Alert.findOne({
                        asteroidId: asteroid.asteroidId,
                        user: alertData.user,
                        createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // No duplicate per day
                    });

                    if (!existing) {
                        alert = new Alert(alertData);
                        await alert.save();
                        generatedAlerts.push(alert);

                        // If user is specified, fetch email and send
                        if (alertData.user && alertData.severity !== 'LOW') {
                            const user = await User.findById(alertData.user);
                            if (user && user.email) {
                                await sendAlertEmail(user.email, alert);
                            }
                        } else if (!alertData.user && (alertData.severity === 'CRITICAL' || alertData.severity === 'HIGH')) {
                            // For global high risk alerts, we might want to email ALL users or just admins
                            // For now, let's keep it simple: System logged, maybe broadcast via socket only for global
                            // Or fetch all users with email
                            const allUsers = await User.find({ email: { $exists: true } });
                            for (const u of allUsers) {
                                sendAlertEmail(u.email, alert);
                            }
                        }
                    }
                } else {
                    // In-memory storage
                    const existing = await InMemoryAlert.findOne({
                        asteroidId: alertData.asteroidId,
                        user: alertData.user
                    });

                    if (!existing) {
                        alert = await InMemoryAlert.create(alertData);
                        generatedAlerts.push(alert);
                    }
                }
            } catch (error) {
                console.error('Error creating alert:', error);
            }
        }
    }

    return generatedAlerts;
};

const getAlertsForUser = async (userId) => {
    const AlertModel = getAlertModel();
    try {
        const alerts = await AlertModel.find({
            $or: [{ user: userId }, { user: null }]
        }).sort({ createdAt: -1 });
        return alerts;
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }
};

const getUnreadAlertsForUser = async (userId) => {
    const AlertModel = getAlertModel();
    try {
        const alerts = await AlertModel.find({
            $or: [{ user: userId }, { user: null }],
            isRead: false
        }).sort({ createdAt: -1 });
        return alerts;
    } catch (error) {
        console.error('Error fetching unread alerts:', error);
        return [];
    }
};

const markAlertAsRead = async (alertId, userId) => {
    const AlertModel = getAlertModel();
    try {
        if (isMongoConnected()) {
            const alert = await Alert.findOneAndUpdate(
                { _id: alertId, user: userId },
                { isRead: true },
                { new: true }
            );
            return alert;
        } else {
            const alert = await InMemoryAlert.findOne({ id: alertId, user: userId });
            if (alert) {
                alert.isRead = true;
                await alert.save();
            }
            return alert;
        }
    } catch (error) {
        console.error('Error marking alert as read:', error);
        return null;
    }
};

const deleteAlert = async (alertId, userId) => {
    const AlertModel = getAlertModel();
    try {
        if (isMongoConnected()) {
            await Alert.findOneAndDelete({ _id: alertId, user: userId });
        } else {
            await InMemoryAlert.deleteOne({ id: alertId, user: userId });
        }
        return true;
    } catch (error) {
        console.error('Error deleting alert:', error);
        return false;
    }
};

const performRiskAnalysis = async (io) => {
    console.log('Running asteroid risk analysis & watchlist check...');
    const results = { globalAlerts: 0, watchlistAlerts: 0 };

    try {
        // 1. GLOBAL RISK CHECK
        // Fetch latest data for today and tomorrow
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // Fetch from NASA (populates local DB)
        console.log(`Fetching NASA feed for ${todayStr} - ${tomorrowStr}`);
        const asteroids = await fetchAsteroidFeed(todayStr, tomorrowStr);

        // Generate System-wide Alerts for High Risk Asteroids
        // Passing userId = null creates global alerts
        const globalAlerts = await generateAlertsForAsteroids(asteroids, null);

        if (globalAlerts.length > 0) {
            console.log(`Generated ${globalAlerts.length} global alerts.`);
            io.emit('new_global_alerts', globalAlerts);
            results.globalAlerts = globalAlerts.length;
        }

        // 2. WATCHLIST CHECK
        // Notify users about specific asteroids in their watchlist approaching tomorrow
        const users = await User.find({ 'watchlist.0': { $exists: true } });

        for (const user of users) {
            for (const watchItem of user.watchlist) {
                const asteroid = await Asteroid.findOne({
                    asteroidId: watchItem.asteroidId,
                    close_approach_date: {
                        $gte: new Date(tomorrowStr),
                        $lt: new Date(new Date(tomorrowStr).getTime() + 24 * 60 * 60 * 1000)
                    }
                });

                if (asteroid) {
                    // Check if we already alerted for this specific event today
                    const existing = await Alert.findOne({
                        user: user._id,
                        asteroidId: asteroid.asteroidId,
                        type: 'WATCHLIST',
                        createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    });

                    if (!existing) {
                        const alert = new Alert({
                            user: user._id,
                            asteroidId: asteroid.asteroidId,
                            asteroidName: asteroid.name,
                            message: `🔭 Watchlist Alert: ${asteroid.name} satisfies approach criteria for tomorrow!`,
                            type: 'WATCHLIST',
                            severity: asteroid.risk_score > 50 ? 'HIGH' : 'MEDIUM',
                            riskScore: asteroid.risk_score,
                            missDistance: asteroid.miss_distance?.kilometers || 0
                        });
                        await alert.save();

                        // Notify via socket
                        io.to(user._id.toString()).emit('new_alert', alert);
                        results.watchlistAlerts++;

                        // Send Watchlist Email
                        if (user.email) {
                            await sendAlertEmail(user.email, alert);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Risk analysis error:', error.message);
        throw error;
    }

    return results;
};

module.exports = {
    generateAlertsForAsteroids,
    getAlertsForUser,
    getUnreadAlertsForUser,
    markAlertAsRead,
    deleteAlert,
    performRiskAnalysis,
    ALERT_CONFIG
};
