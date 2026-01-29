const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ where: { email } });

        // MVP Logic: Auto-register if new email, otherwise check password
        if (!user) {
            user = await User.create({
                email,
                password: password, // In production, hash this!
                plan_type: 'free'
            });
        } else {
            if (user.password !== password) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                plan: user.plan_type,
                validUntil: user.plan_valid_until
            }
        });
    } catch (error) {
        console.error('Auth Login Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
