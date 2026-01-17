import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

/**
 * Request logger middleware using morgan
 */
export const requestLogger = morgan('combined', {
  skip: (req: Request) => {
    // Skip health check endpoints to avoid log spam
    return req.path === '/api/health' || req.path === '/health';
  }
});

/**
 * Custom request logger for development
 */
export const devRequestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${statusColor}${status}\x1b[0m (${duration}ms)`
    );
  });
  
  next();
};

/**
 * Extract request info for audit logging
 */
export const getRequestInfo = (req: Request) => {
  return {
    ipAddress: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '',
    userAgent: req.headers['user-agent'] || ''
  };
};
