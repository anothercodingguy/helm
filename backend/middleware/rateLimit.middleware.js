const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limit: 10 requests per hour per user
const rateLimiter = new RateLimiterMemory({
    points: 10, // 10 points
    duration: 60 * 60, // Per 1 hour
});

const rateLimitMiddleware = (req, res, next) => {
    // Use user ID from JWT if available, otherwise IP (fallback, though auth middleware should run first)
    const key = req.user ? req.user.id : req.ip;

    rateLimiter.consume(key)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).json({ message: 'Too Many Requests. Limit is 10 requests per hour.' });
        });
};

module.exports = rateLimitMiddleware;
