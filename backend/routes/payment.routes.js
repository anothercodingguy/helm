const express = require('express');
const router = express.Router();
const phonepeService = require('../services/phonepe.service');
const usageService = require('../services/usage.service');
const authMiddleware = require('../middleware/auth.middleware');
const { User } = require('../config/db');

// POST /api/payment/initiate
router.post('/initiate', authMiddleware, async (req, res) => {
    try {
        const { planId } = req.body; // 'pro' or 'team'
        const userId = req.user.id;

        let amount = 0;
        if (planId === 'pro') amount = 499;
        else if (planId === 'team') amount = 1499;
        else return res.status(400).json({ message: 'Invalid Plan' });

        const orderId = `ORDER_${Date.now()}_${userId.substring(0, 5)}`;
        const redirectUrl = `http://localhost:3000/payment/success`; // Frontend success page
        const callbackUrl = `http://localhost:5001/api/payment/callback`; // Server-to-server

        // Dev Mode: Return Mock URL immediately?
        // Check ENV if we want to skip real PhonePe
        if (process.env.USE_MOCK_PAYMENT === 'true') {
            // Mock success immediately
            await usageService.upgradePlan(userId, planId);
            return res.json({ url: redirectUrl });
        }

        const response = await phonepeService.initiatePayment(orderId, amount, userId, redirectUrl, callbackUrl);

        // PhonePe returns a redirect URL in response.data.instrumentResponse.redirectInfo.url
        const forwardUrl = response.data.instrumentResponse.redirectInfo.url;
        res.json({ url: forwardUrl });

    } catch (error) {
        console.error('Payment Initiate Error:', error);
        res.status(500).json({ message: 'Failed to initiate payment' });
    }
});

// POST /api/payment/callback (S2S)
router.post('/callback', async (req, res) => {
    try {
        // PhonePe sends valid JSON in base64 format in 'response' body field + header signature
        const { response } = req.body;
        const xVerify = req.headers['x-verify'];

        // Validate
        // const isValid = phonepeService.verifyCallbackSignature(response, xVerify);
        // if (!isValid) return res.status(400).json({ message: 'Invalid Signature' });

        const decoded = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'));

        if (decoded.code === 'PAYMENT_SUCCESS') {
            const { merchantUserId, amount } = decoded.data;
            // Determine plan based on amount (Naive check)
            let plan = 'pro';
            if (amount === 149900) plan = 'team'; // Amount in paise

            await usageService.upgradePlan(merchantUserId, plan);
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Payment Callback Error:', error);
        res.status(500).json({ message: 'Callback failed' });
    }
});

module.exports = router;
