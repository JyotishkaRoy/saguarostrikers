import { AuditDataHelper } from '../data/AuditDataHelper.js';
import { AuditLog } from '../models/types.js';

export class AuditService {
  private auditDataHelper: AuditDataHelper;

  constructor() {
    this.auditDataHelper = new AuditDataHelper();
  }

  /**
   * Get all audit logs
   */
  async getAllLogs(): Promise<AuditLog[]> {
    return this.auditDataHelper.getAll();
  }

  /**
   * Get recent logs with limit
   */
  async getRecentLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditDataHelper.getRecentLogs(limit);
  }

  /**
   * Get logs by user
   */
  async getLogsByUser(userId: string): Promise<AuditLog[]> {
    return this.auditDataHelper.getLogsByUser(userId);
  }

  /**
   * Get logs by entity
   */
  async getLogsByEntity(entity: string): Promise<AuditLog[]> {
    return this.auditDataHelper.getLogsByEntity(entity);
  }

  /**
   * Get logs by entity ID
   */
  async getLogsByEntityId(entityId: string): Promise<AuditLog[]> {
    return this.auditDataHelper.getLogsByEntityId(entityId);
  }

  /**
   * Get logs by date range
   */
  async getLogsByDateRange(startDate: string, endDate: string): Promise<AuditLog[]> {
    return this.auditDataHelper.getLogsByDateRange(startDate, endDate);
  }

  /**
   * Get logs by user and date range
   */
  async getLogsByUserAndDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<AuditLog[]> {
    return this.auditDataHelper.getLogsByUserAndDateRange(userId, startDate, endDate);
  }

  /**
   * Clean old logs (keep last N days)
   */
  async cleanOldLogs(daysToKeep: number = 90): Promise<number> {
    return this.auditDataHelper.cleanOldLogs(daysToKeep);
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(): Promise<{
    totalLogs: number;
    uniqueUsers: number;
    recentActivity: AuditLog[];
    topActions: Array<{ action: string; count: number }>;
  }> {
    const allLogs = this.auditDataHelper.getAll();
    const recentLogs = this.auditDataHelper.getRecentLogs(10);

    const uniqueUsers = new Set(allLogs.map(log => log.userId)).size;

    // Count actions
    const actionCounts = allLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLogs: allLogs.length,
      uniqueUsers,
      recentActivity: recentLogs,
      topActions
    };
  }
}
