import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for AI doubt requests to prevent endpoint abuse.
 * Allows 60 requests per 15 minutes per IP.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again in a few minutes.'
  }
});
