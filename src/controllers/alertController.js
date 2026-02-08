const alertService = require('../services/alertService');

const getAlerts = async (req, res) => {
    try {
        const userId = req.user.id;
        const alerts = await alertService.getAlertsForUser(userId);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUnreadAlerts = async (req, res) => {
    try {
        const userId = req.user.id;
        const alerts = await alertService.getUnreadAlertsForUser(userId);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const alertId = req.params.id;
        const alert = await alertService.markAlertAsRead(alertId, userId);

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const dismissAlert = async (req, res) => {
    try {
        const userId = req.user.id;
        const alertId = req.params.id;
        const success = await alertService.deleteAlert(alertId, userId);

        if (!success) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        res.json({ message: 'Alert dismissed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const checkAlerts = async (req, res) => {
    try {
        const io = req.app.get('io');
        const results = await alertService.performRiskAnalysis(io);
        res.json({ message: 'Risk analysis initiated successfully', results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAlerts,
    getUnreadAlerts,
    markAsRead,
    dismissAlert,
    checkAlerts
};
