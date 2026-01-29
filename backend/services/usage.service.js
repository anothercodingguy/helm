const { User } = require('../config/db');

const PLANS = {
    free: { limit: 10, label: 'Free' },
    pro: { limit: 500, label: 'Pro' },
    team: { limit: 2000, label: 'Team' }
};

const checkLimit = async (user) => {
    const now = new Date();

    // Check Plan Validity
    if (user.plan_type !== 'free') {
        const validUntil = new Date(user.plan_valid_until);
        if (validUntil < now) {
            // Plan expired, downgrade to free
            user.plan_type = 'free';
            user.plan_valid_until = null;
            user.messages_usage = 0; // Reset usage for new free plan logic? 
            // Or keep usage and let daily reset handle it.
            // For simplicity, let's say expired -> free.
            await user.save();
        }
    }

    // Check Usage Reset (Daily for Free, Monthly for Pro/Team?)
    // Requirements say: Free = 10 messages/day. Pro = 500/month.
    // We need logic to reset counter.
    // Simplified: Store 'usage_reset_date'.
    const resetDate = new Date(user.usage_reset_date);

    let shouldReset = false;
    if (user.plan_type === 'free') {
        // Reset if last reset was previous day
        // Simple 24h check or literal day change.
        if (now - resetDate > 24 * 60 * 60 * 1000) shouldReset = true;
    } else {
        // Pro/Team: Monthly reset? usually explicitly set on purchase.
        // If we treat 'plan_valid_until' as the hard stop, we assume usage is "per purchase cycle".
        // So we don't auto-reset monthly usage unless it's a subscription.
        // User buys "30 days pass". Usage is 0 at start.
    }

    if (shouldReset) {
        user.messages_usage = 0;
        user.usage_reset_date = now;
        await user.save();
    }

    const limit = PLANS[user.plan_type].limit;
    if (user.messages_usage >= limit) {
        return { allowed: false, plan: user.plan_type, limit };
    }

    return { allowed: true, plan: user.plan_type, limit, used: user.messages_usage };
};

const incrementUsage = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return;
    user.messages_usage += 1;
    await user.save();
};

const upgradePlan = async (userId, planType) => {
    const user = await User.findByPk(userId);
    if (!user) return; // Should allow error handling

    user.plan_type = planType;
    user.plan_valid_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days
    user.messages_usage = 0;
    user.usage_reset_date = new Date();
    await user.save();
};

module.exports = { checkLimit, incrementUsage, upgradePlan, PLANS };
