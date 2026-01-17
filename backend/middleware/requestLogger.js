// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  
  next();
};

// Extract request info for audit logging
const getRequestInfo = (req) => {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || '',
    userAgent: req.headers['user-agent'] || ''
  };
};

module.exports = {
  requestLogger,
  getRequestInfo
};

