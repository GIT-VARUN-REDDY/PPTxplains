import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables reliably from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'microphone=(self)');
  next();
});

// Flexible CORS configuration supporting dev on any local port and custom CLIENT_URL
const allowedOrigins = CLIENT_URL.split(',').map(u => u.trim().replace(/\/$/, '')).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(cleanOrigin) ||
      allowedOrigins.some(o => o.startsWith(cleanOrigin) || cleanOrigin.startsWith(o)) ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
      /\.vercel\.app$/.test(cleanOrigin.replace(/^https?:\/\//, ''))
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with size limit (supports base64 voice audio)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Logging middleware in dev
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Fallback 404 for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found.'
  });
});

// Also serve presentations directly from client/public/presentations if present
const publicPresentationsPath = path.resolve(__dirname, '../client/public/presentations');
if (fs.existsSync(publicPresentationsPath)) {
  app.use('/presentations', express.static(publicPresentationsPath));
}

// Serve production static assets from client/dist if present
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Production] Serving static client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Clean 404 for missing static files with extensions instead of returning index.html
  app.get(/\.[a-zA-Z0-9]+$/, (req, res) => {
    res.status(404).json({
      success: false,
      error: 'File not found.'
    });
  });

  // SPA fallback: any non-file route serves index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handler
app.use(errorHandler);

// Start server
let server = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` AI Presentation Assistant Server`);
    console.log(` Running on: http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` Client URL: ${CLIENT_URL}`);
    console.log(` Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
    console.log(` Gemini Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Local Fallback Mode'}`);
    console.log(`===============================================`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    if (server) {
      server.close(() => {
        console.log('HTTP server closed');
      });
    }
  });
}

export default app;
