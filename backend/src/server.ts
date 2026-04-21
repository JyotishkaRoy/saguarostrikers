import './loadEnv.js';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5001;

// ==========================================
// MIDDLEWARE
// ==========================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", `http://localhost:${PORT}`],
      frameAncestors: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Additional security headers
app.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Static files - serve uploads with CORS headers
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(join(__dirname, '../../uploads')));

// ==========================================
// ROUTES
// ==========================================

app.use('/api', routes);

// ==========================================
// ERROR HANDLING
// ==========================================

app.use(notFoundHandler);
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 Saguaro Strikers API Server      ║
║   📡 Port: ${PORT.toString().padEnd(27)}║
║   🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(19)}║
║   ✅ Status: Running                  ║
╚════════════════════════════════════════╝
    `);
  });
}

export default app;
