import rateLimit from "express-rate-limit";

// Create a rate limiter instance
export const rateLimiter
 = (maxRequests: number, windowMinutes = 2) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      success: false,
      message: `⚠️ Too many requests! Try again in ${windowMinutes} minute(s).`,
    },
  });
