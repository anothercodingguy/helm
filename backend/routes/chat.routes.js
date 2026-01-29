const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');
const rateLimitMiddleware = require('../middleware/rateLimit.middleware');

const verifyPlanLimits = require('../middleware/plan.middleware');

// POST /api/chat
router.post('/', authMiddleware, rateLimitMiddleware, verifyPlanLimits, chatController.chat);

module.exports = router;
