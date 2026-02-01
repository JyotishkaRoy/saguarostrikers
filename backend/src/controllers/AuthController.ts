import { Request, Response } from 'express';
import { body } from 'express-validator';
import { AuthService } from '../services/AuthService.js';
import { AuthRequest } from '../models/types.js';
import { ApiError } from '../middleware/errorHandler.js';
import { AuditDataHelper } from '../data/AuditDataHelper.js';
import { getRequestInfo } from '../middleware/audit.js';

const auditDataHelper = new AuditDataHelper();

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register validation rules
   */
  static registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('phone').optional().trim()
  ];

  /**
   * Login validation rules
   */
  static loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ];

  /**
   * Register new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        phone
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Registration failed'
        });
      }
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      const requestInfo = getRequestInfo(req as AuthRequest);
      try {
        auditDataHelper.createLog({
          userId: result.user.userId,
          action: 'USER_LOGIN',
          entity: 'user',
          entityId: result.user.userId,
          changes: {},
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        });
      } catch (logError) {
        console.error('Audit log failed:', logError);
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Login failed'
        });
      }
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const profile = await this.authService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to fetch profile'
        });
      }
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { firstName, lastName, phone } = req.body;

      const updatedProfile = await this.authService.updateProfile(req.user.userId, {
        firstName,
        lastName,
        phone
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update profile'
        });
      }
    }
  }

  /**
   * Logout (logs audit and returns success; client clears token)
   */
  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user) {
        const requestInfo = getRequestInfo(req);
        try {
          auditDataHelper.createLog({
            userId: req.user.userId,
            action: 'USER_LOGOUT',
            entity: 'user',
            entityId: req.user.userId,
            changes: {},
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent
          });
        } catch (logError) {
          console.error('Audit log failed:', logError);
        }
      }
      res.status(200).json({ success: true, message: 'Logged out' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Logout failed' });
    }
  }

  /**
   * Change password
   */
  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { oldPassword, newPassword } = req.body;

      await this.authService.changePassword(req.user.userId, oldPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to change password'
        });
      }
    }
  }
}
