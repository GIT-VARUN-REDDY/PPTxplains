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
    error: 'Too many AI requests from this IP, please try again in a few minutes.'
  }
});

/**
 * Rate limiter for TTS voice generation requests to protect Edge TTS and server bandwidth.
 * Allows 60 requests per 10 minutes per IP.
 */
export const ttsRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many speech synthesis requests from this IP, please try again shortly.'
  }
});

/**
 * Rate limiter for heavy presentation ingestion and upload endpoint.
 * Allows 15 requests per 15 minutes per IP.
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many presentation upload requests, please wait before uploading another deck.'
  }
});
