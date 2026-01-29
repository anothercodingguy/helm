const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(bodyParser.json());

let browser;
let page;

async function initBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
    }
    return page;
}

// Main Chat Endpoint
app.post('/v1/chat', async (req, res) => {
    const { message, stream } = req.body;

    console.log(`[Moltbot] Received: ${message}`);

    if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const sendEvent = (type, data) => {
            res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
        };

        let screenshotInterval;

        try {
            sendEvent('log', { content: `Initializing Mission Control for: "${message}"` });

            const p = await initBrowser();

            // Start Screenshot Stream
            screenshotInterval = setInterval(async () => {
                if (browser && page) {
                    try {
                        const base64 = await page.screenshot({ encoding: 'base64' });
                        sendEvent('screenshot', { base64 });
                    } catch (err) {
                        // ignore screenshot errors during nav
                    }
                }
            }, 1000);

            // --- AGENT SIMULATION LOGIC ---

            sendEvent('log', { content: "Parsing intent..." });
            await new Promise(r => setTimeout(r, 800));

            if (message.toLowerCase().includes('google')) {
                sendEvent('log', { content: "Opening Google Search..." });
                await page.goto('https://www.google.com');

                sendEvent('log', { content: "Identified search box", details: "Found selector textarea[name='q']" });
                const selector = 'textarea[name="q"], input[name="q"]';
                await page.waitForSelector(selector);

                sendEvent('log', { content: `Typing query: "${message}"` });
                await page.type(selector, message, { delay: 100 });

                sendEvent('log', { content: "Submitting search..." });
                await page.keyboard.press('Enter');

                await new Promise(r => setTimeout(r, 2000)); // wait for results
                sendEvent('log', { content: "Results loaded." });
            } else {
                sendEvent('log', { content: "Navigating to Blank Page..." });
                await page.goto('about:blank');
                sendEvent('log', { content: `Running command: ${message}` });

                // Simulate some "work"
                sendEvent('input_needed', { prompt: "Please confirm execute permission for 'delete-all' (mock)." });
                await new Promise(r => setTimeout(r, 3000));
            }

            // Simulate artifact
            sendEvent('log', { content: "Compiling execution report..." });
            sendEvent('file', { filename: "execution_log.csv", url: "/files/execution_log.csv" });

            sendEvent('log', { content: "Mission Complete." });

        } catch (error) {
            console.error("Agent Error:", error);
            sendEvent('log', { content: `Error: ${error.message}` });
        } finally {
            if (screenshotInterval) clearInterval(screenshotInterval);
            res.write(`data: [DONE]\n\n`);
            res.end();
        }
    } else {
        res.json({
            reply: `[Moltbot] Please use streaming mode for Mission Control.`
        });
    }
});

app.listen(PORT, () => {
    console.log(`Moltbot Service running on port ${PORT}`);
});
