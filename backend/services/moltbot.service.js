const axios = require('axios');

const MOLTBOT_URL = process.env.MOLTBOT_URL || 'http://localhost:7000';
const USE_MOCK_BOT = process.env.USE_MOCK_BOT === 'true';

// Toggle Mock Mode: Set USE_MOCK_BOT=true in .env to force mock streaming.

const sendMessage = async (message) => {
    try {
        const response = await axios.post(`${MOLTBOT_URL}/v1/chat`, {
            message: message
        }, {
            timeout: 120000 // 120s timeout
        });

        return response.data;
    } catch (error) {
        console.error('Moltbot/Internal Service Error:', error.message);

        // Fallback Mock Response
        return {
            reply: "[DEV MOCK] Moltbot offline. This is a test response."
        };
    }
};

/**
 * Generator function to stream tokens from Moltbot or Mock.
 * @param {string} message - User message
 * @param {Array} history - Conversation history
 */
const streamMessage = async function* (message, history = []) {
    if (USE_MOCK_BOT) {
        // Mock Stream
        const mockResponse = "[MOCK STREAM] This is a streaming response from Moltbot. I am generating this token by token.";
        const tokens = mockResponse.split(/(?=[\s\S])/); // Split by char for smooth effect, or space

        for (const token of tokens) {
            yield token;
            await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay
        }
        return;
    }

    try {
        const response = await axios.post(`${MOLTBOT_URL}/v1/chat`, {
            message,
            history,
            stream: true
        }, {
            responseType: 'stream',
            timeout: 120000
        });

        // Assuming standard SSE or raw stream from Moltbot
        for await (const chunk of response.data) {
            // If chunks are raw buffers, convert to string
            yield chunk.toString();
        }

    } catch (error) {
        console.error('Moltbot Streaming Error:', error.message);
        yield "[ERROR] Moltbot unavailable or connection lost.";
    }
};

module.exports = { sendMessage, streamMessage };
