import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../models/types.js';

interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

/**
 * Verify JWT token and attach user info to request
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret'
    ) as JWTPayload;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Require admin role - must be used after authenticate middleware
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
    return;
  }

  next();
};

/**
 * Require user to be authenticated (admin or regular user)
 */
export const requireUser = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for public endpoints that have different behavior when authenticated
 */
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_jwt_secret'
      ) as JWTPayload;
      
      req.user = decoded;
    }
  } catch (error) {
    // Token invalid but don't fail - just continue without user
    req.user = undefined;
  }
  
  next();
};

/**
 * Generate JWT token for user
 */
export const generateToken = (userId: string, email: string, role: 'admin' | 'user'): string => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret';
  
  return jwt.sign(
    { userId, email, role },
    secret,
    { expiresIn: '7d' }
  );
};

/**
 * Verify token without throwing error (for utility purposes)
 */
export const verifyTokenSafe = (_token: string): JWTPayload | null => {
  try {
    return jwt.verify(
      _token,
      process.env.JWT_SECRET || 'your_jwt_secret'
    ) as JWTPayload;
  } catch (_error) {
    return null;
  }
};
