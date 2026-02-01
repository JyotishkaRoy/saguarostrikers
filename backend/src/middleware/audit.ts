import { Response, NextFunction } from 'express';
import { AuthRequest, RequestInfo } from '../models/types.js';
import { AuditDataHelper } from '../data/AuditDataHelper.js';

const auditDataHelper = new AuditDataHelper();

/**
 * Extract request information for audit logging
 */
export const getRequestInfo = (req: AuthRequest): RequestInfo => {
  return {
    ipAddress: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '',
    userAgent: req.headers['user-agent'] || ''
  };
};

/**
 * Middleware to log audit trail for sensitive operations
 * Usage: app.post('/api/admin/users', authenticate, requireAdmin, auditLog('CREATE_USER'), controller.create)
 */
export const auditLog = (action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Store original send function
    const originalSend = res.send;

    // Override send to capture response
    res.send = function (data: any): Response {
      // Only log on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const requestInfo = getRequestInfo(req);
          const userId = req.user?.userId || 'system';
          
          // Extract entity information from request
          const entityId = req.params.id || req.body?.id || 'unknown';
          const entity = extractEntityFromPath(req.path);

          // Log the audit entry
          auditDataHelper.createLog({
            userId,
            action,
            entity,
            entityId,
            changes: sanitizeBody(req.body),
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent
          });
        } catch (error) {
          console.error('Error logging audit trail:', error);
          // Don't fail the request if audit logging fails
        }
      }

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Extract entity name from request path
 */
function extractEntityFromPath(path: string): string {
  const parts = path.split('/').filter(p => p);
  // Examples: /api/admin/users => users, /api/missions => missions
  const entity = parts[parts.length - 1];
  
  // Remove IDs from entity name
  if (entity && !isNaN(Number(entity)) || entity.match(/^[a-f0-9-]{36}$/i)) {
    return parts[parts.length - 2] || 'unknown';
  }
  
  return entity || 'unknown';
}

/**
 * Remove sensitive fields from body before logging
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard'];
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Manual audit log helper for use in services
 */
export const logAudit = async (
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  changes: Record<string, any>,
  requestInfo: RequestInfo
): Promise<void> => {
  try {
    await auditDataHelper.createLog({
      userId,
      action,
      entity,
      entityId,
      changes: sanitizeBody(changes),
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });
  } catch (error) {
    console.error('Error logging audit:', error);
  }
};

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Middleware that logs admin POST/PUT/PATCH/DELETE requests on success (2xx).
 * GET requests are never logged. Use once with router.use('/admin', ...).
 */
export const adminActivityLogger = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const method = (req.method || '').toUpperCase();
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
    const shouldLog = isSuccess && MUTATING_METHODS.includes(method);
    if (shouldLog) {
      try {
        const requestInfo = getRequestInfo(req);
        const userId = req.user?.userId || 'unknown';
        const action = `${req.method} ${req.originalUrl || req.path}`;
        const entity = extractEntityFromPath(req.originalUrl || req.path);
        const entityId = (req.params && (req.params.id || req.params.eventId || req.params.contentId || req.params.messageId || req.params.applicationId || req.params.fileId || req.params.galleryId || req.params.artifactId)) || '—';
        auditDataHelper.createLog({
          userId,
          action,
          entity,
          entityId: String(entityId),
          changes: sanitizeBody(req.body),
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        });
      } catch (error) {
        console.error('Error logging admin activity:', error);
      }
    }
    return originalSend.call(this, data);
  };
  next();
};
