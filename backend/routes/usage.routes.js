const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const usageService = require('../services/usage.service');

// GET /api/usage
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const result = await usageService.checkLimit(user);

        // Calculate days left
        let daysLeft = 0;
        if (user.plan_valid_until) {
            const now = new Date();
            const validUntil = new Date(user.plan_valid_until);
            const diffTime = Math.abs(validUntil - now);
            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        res.json({
            plan: user.plan_type,
            used: user.messages_usage,
            limit: result.limit,
            daysLeft: daysLeft
        });
    } catch (error) {
        console.error('Usage Fetch Error:', error);
        res.status(500).json({ message: 'Error fetching usage' });
    }
});

module.exports = router;
