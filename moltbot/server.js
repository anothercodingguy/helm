const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(bodyParser.json());

// Main Chat Endpoint
app.post('/v1/chat', async (req, res) => {
    const { message, stream } = req.body;

    console.log(`[Moltbot] Received: ${message}`);

    // Simulate AI Processing Delay
    // await new Promise(r => setTimeout(r, 500));

    if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reply = `[Moltbot Internal] I received your message: "${message}". I am running inside a private Docker container on Render!`;
        const tokens = reply.split(/(?=[\s\S])/);

        for (const token of tokens) {
            res.write(token);
            // Simulate token generation time
            await new Promise(r => setTimeout(r, 30));
        }
        res.end();
    } else {
        res.json({
            reply: `[Moltbot Internal] Echo: ${message}`
        });
    }
});

app.listen(PORT, () => {
    console.log(`Moltbot Service running on port ${PORT}`);
});
