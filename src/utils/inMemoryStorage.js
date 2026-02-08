// In-memory storage for demo mode (when MongoDB is not available)
const inMemoryUsers = new Map();
const inMemoryAsteroids = new Map();
const inMemoryAlerts = new Map();

class InMemoryUser {
    constructor(data) {
        this.id = Date.now().toString() + Math.random().toString(36);
        this.username = data.username;
        this.email = data.email;
        this.password = data.password; // Already hashed
        this.watchlist = [];
        this.role = 'user';
        this.createdAt = new Date();
    }

    static async findOne(query) {
        for (const user of inMemoryUsers.values()) {
            if (query.email && user.email === query.email) return user;
            if (query.username && user.username === query.username) return user;
            if (query.$or) {
                for (const condition of query.$or) {
                    if (condition.email && user.email === condition.email) return user;
                    if (condition.username && user.username === condition.username) return user;
                }
            }
        }
        return null;
    }

    static async create(data) {
        const user = new InMemoryUser(data);
        inMemoryUsers.set(user.id, user);
        return user;
    }

    async save() {
        inMemoryUsers.set(this.id, this);
        return this;
    }

    get _id() {
        return this.id;
    }

    async comparePassword(candidatePassword) {
        const bcrypt = require('bcryptjs');
        return bcrypt.compare(candidatePassword, this.password);
    }
}

class InMemoryAsteroid {
    constructor(data) {
        this.asteroidId = data.asteroidId;
        this.name = data.name;
        this.diameter = data.diameter;
        this.velocity = data.velocity;
        this.missDistance = data.missDistance;
        this.closeApproachDate = data.closeApproachDate;
        this.is_potentially_hazardous = data.is_potentially_hazardous;
        this.risk_score = data.risk_score;
        this.risk_category = data.risk_category;
        this.orbital_data = data.orbital_data;
        this.lastUpdated = new Date();
    }

    static async find(query = {}) {
        return Array.from(inMemoryAsteroids.values());
    }

    static async findOne(query) {
        for (const asteroid of inMemoryAsteroids.values()) {
            if (query.asteroidId && asteroid.asteroidId === query.asteroidId) {
                return asteroid;
            }
        }
        return null;
    }

    static async deleteMany() {
        inMemoryAsteroids.clear();
        return { deletedCount: inMemoryAsteroids.size };
    }

    static async insertMany(asteroids) {
        for (const data of asteroids) {
            const asteroid = new InMemoryAsteroid(data);
            inMemoryAsteroids.set(asteroid.asteroidId, asteroid);
        }
        return asteroids;
    }

    async save() {
        inMemoryAsteroids.set(this.asteroidId, this);
        return this;
    }
}

class InMemoryAlert {
    constructor(data) {
        this.id = Date.now().toString() + Math.random().toString(36);
        this.userId = data.userId;
        this.asteroidId = data.asteroidId;
        this.asteroidName = data.asteroidName;
        this.alertType = data.alertType;
        this.message = data.message;
        this.riskScore = data.riskScore;
        this.missDistance = data.missDistance;
        this.isRead = data.isRead || false;
        this.createdAt = data.createdAt || new Date();
    }

    static async find(query = {}) {
        let alerts = Array.from(inMemoryAlerts.values());

        if (query.userId) {
            alerts = alerts.filter(a => a.userId === query.userId);
        }
        if (query.isRead !== undefined) {
            alerts = alerts.filter(a => a.isRead === query.isRead);
        }

        return alerts;
    }

    static async findOne(query) {
        for (const alert of inMemoryAlerts.values()) {
            if (query.id && alert.id === query.id) return alert;
            if (query.asteroidId && query.userId &&
                alert.asteroidId === query.asteroidId &&
                alert.userId === query.userId) {
                return alert;
            }
        }
        return null;
    }

    static async create(data) {
        const alert = new InMemoryAlert(data);
        inMemoryAlerts.set(alert.id, alert);
        return alert;
    }

    static async deleteOne(query) {
        for (const [key, alert] of inMemoryAlerts.entries()) {
            if (query.id && alert.id === query.id && alert.userId === query.userId) {
                inMemoryAlerts.delete(key);
                return { deletedCount: 1 };
            }
        }
        return { deletedCount: 0 };
    }

    async save() {
        inMemoryAlerts.set(this.id, this);
        return this;
    }

    sort(sortObj) {
        // For compatibility with Mongoose queries
        return this;
    }
}

module.exports = {
    InMemoryUser,
    InMemoryAsteroid,
    InMemoryAlert,
    isMongoConnected: () => {
        const mongoose = require('mongoose');
        return mongoose.connection.readyState === 1;
    }
};
