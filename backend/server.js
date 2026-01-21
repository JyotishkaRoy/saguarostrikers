require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./config/database');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const userRoutes = require('./routes/userRoutes');
const missionAdminRoutes = require('./routes/admin/missionAdminRoutes');
const teamAdminRoutes = require('./routes/admin/teamAdminRoutes');
const userAdminRoutes = require('./routes/admin/userAdminRoutes');
const noticeAdminRoutes = require('./routes/admin/noticeAdminRoutes');
const siteContentAdminRoutes = require('./routes/admin/siteContentAdminRoutes');
const contactAdminRoutes = require('./routes/admin/contactAdminRoutes');
const fileAdminRoutes = require('./routes/admin/fileAdminRoutes');
const auditLogAdminRoutes = require('./routes/admin/auditLogAdminRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const discussionAdminRoutes = require('./routes/admin/discussionAdminRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initializeDatabase();

// Enhanced Security Headers (inspired by Sanhoti)
app.use((req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME-type sniffing attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable HSTS (force HTTPS for 1 year, including subdomains)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Referrer Policy - control what referrer information is sent
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy - control browser features and APIs
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy - prevent XSS attacks
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' http://localhost:* https:",
    "frame-ancestors 'self'"
  ];
  res.setHeader('Content-Security-Policy', cspHeader.join('; '));
  
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // We set it manually above
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Enhanced CORS configuration (support multiple origins like Sanhoti)
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', missionAdminRoutes);
app.use('/api/admin', teamAdminRoutes);
app.use('/api/admin', userAdminRoutes);
app.use('/api/admin', noticeAdminRoutes);
app.use('/api/admin', siteContentAdminRoutes);
app.use('/api/admin/contact', contactAdminRoutes);
app.use('/api/admin', fileAdminRoutes);
app.use('/api/admin/audit', auditLogAdminRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/admin/discussions', discussionAdminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Rocketry Mission Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Rocketry Mission Platform - Server Running         ║
╠═══════════════════════════════════════════════════════════╣
║   Port: ${PORT}                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}   
║   Time: ${new Date().toLocaleString()}                    
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;

