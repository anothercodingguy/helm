const usageService = require('../services/usage.service');

const verifyPlanLimits = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const result = await usageService.checkLimit(user);

        if (!result.allowed) {
            return res.status(403).json({
                error: 'LIMIT_EXCEEDED',
                message: `You have reached your ${result.limit} message limit for the ${result.plan} plan. Upgrade to continue.`,
                plan: result.plan
            });
        }

        // IMPORTANT: Increment usage immediately to prevent race conditions 
        // (Though strictly race conditions still exist without transactions/atomic increments, 
        // but this is sufficient for MVP).
        await usageService.incrementUsage(user.id);

        next();
    } catch (error) {
        console.error('Plan Verification Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = verifyPlanLimits;
