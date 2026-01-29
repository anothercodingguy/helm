const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/conversations
router.get('/', authMiddleware, chatController.getConversations);

// GET /api/conversations/:id
router.get('/:id', authMiddleware, chatController.getConversation);

module.exports = router;
