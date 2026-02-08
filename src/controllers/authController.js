const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { InMemoryUser, isMongoConnected } = require('../utils/inMemoryStorage');

const getUser = () => isMongoConnected() ? User : InMemoryUser;

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const UserModel = getUser();
        const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password manually for in-memory storage
        const hashedPassword = await bcrypt.hash(password, 10);

        let user;
        if (isMongoConnected()) {
            user = new User({ username, email, password });
            await user.save();
        } else {
            user = await InMemoryUser.create({ username, email, password: hashedPassword });
        }

        const token = jwt.sign({ id: user._id || user.id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_12345', { expiresIn: '7d' });

        res.status(201).json({ user: { id: user._id || user.id, username, email }, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const UserModel = getUser();
        const user = await UserModel.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id || user.id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_12345', { expiresIn: '7d' });

        res.json({ user: { id: user._id || user.id, username: user.username, email: user.email }, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login };
