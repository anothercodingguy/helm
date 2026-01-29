require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const conversationRoutes = require('./routes/conversation.routes');
const paymentRoutes = require('./routes/payment.routes');
const usageRoutes = require('./routes/usage.routes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/usage', usageRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Moltbot SaaS Backend is running.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
