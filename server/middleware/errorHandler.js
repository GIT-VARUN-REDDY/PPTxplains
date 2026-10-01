/**
 * Global error handling middleware.
 * Ensures internal errors, API keys, and sensitive stack traces are never leaked to client.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[Server Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method
  });

  if (err.name === 'AbortError') {
    return res.status(499).json({
      success: false,
      error: 'Client closed request.'
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const userMessage = err.isOperational
    ? err.message
    : 'Something went wrong while getting the AI response. Please try again.';

  res.status(statusCode).json({
    success: false,
    error: userMessage
  });
};
