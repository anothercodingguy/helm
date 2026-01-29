const { Conversation, Message, User } = require('../config/db');
const moltbotService = require('../services/moltbot.service');

// Mock Subscription Check
const checkSubscription = (user) => {
    return true;
};

// POST /api/chat (SSE)
const chat = async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        const user = req.user;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        if (!checkSubscription(user)) {
            return res.status(403).json({ message: 'Active subscription required.' });
        }

        // Initialize Conversation
        let conversation;
        if (conversationId) {
            conversation = await Conversation.findOne({ where: { id: conversationId, userId: user.id } });
        }

        if (!conversation) {
            conversation = await Conversation.create({
                userId: user.id,
                title: message.substring(0, 30) + (message.length > 30 ? '...' : '')
            });
        }

        // Save User Message
        await Message.create({
            conversationId: conversation.id,
            role: 'user',
            content: message
        });

        // Fetch History (Last 10 messages)
        const historyMessages = await Message.findAll({
            where: { conversationId: conversation.id },
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        // Reverse to chronological order and map
        const history = historyMessages.reverse().map(m => ({ role: m.role, content: m.content }));

        // Set SSE Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders(); // Establish stream immediately

        // Stream Response
        let fullResponse = "";
        const stream = moltbotService.streamMessage(message, history);

        for await (const token of stream) {
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
            fullResponse += token;
        }

        // Save Assistant Message
        await Message.create({
            conversationId: conversation.id,
            role: 'assistant',
            content: fullResponse
        });

        // End Stream
        res.write(`data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`);
        res.end();

    } catch (error) {
        console.error('Chat Controller Error:', error);
        // If headers already sent, we can't send JSON 500. 
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Internal Server Error' })}\n\n`);
            res.end();
        }
    }
};

// GET /api/conversations
const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'title', 'createdAt']
        });
        res.json(conversations);
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};

// GET /api/conversations/:id
const getConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await Conversation.findOne({
            where: { id, userId: req.user.id }
        });
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        const messages = await Message.findAll({
            where: { conversationId: id },
            order: [['createdAt', 'ASC']]
        });
        res.json({ conversation, messages });
    } catch (error) {
        console.error('Get Conversation Error:', error);
        res.status(500).json({ message: 'Error fetching conversation' });
    }
};

module.exports = { chat, getConversations, getConversation };
