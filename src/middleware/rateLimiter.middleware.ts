import { rateLimiter } from "hono-rate-limiter";

// Apply the rate limiting middleware to all requests.
export const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    keyGenerator: (c) => {
      // Try multiple headers for proxy scenarios
      let ip = c.req.header('CF-Connecting-IP');
      if (!ip) {
        const forwarded = c.req.header('X-Forwarded-For');
        if (forwarded) {
          ip = forwarded.split(',')[0].trim();
        }
      }
      if (!ip) {
        ip = c.req.header('X-Real-IP');
      }
      return ip || 'anonymous';
    }, // Method to generate custom identifiers for clients.
    // store: ... , // Redis, MemoryStore, etc. See below.
});