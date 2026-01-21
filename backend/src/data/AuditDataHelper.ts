import { BaseDataHelper } from './BaseDataHelper.js';
import { AuditLog } from '../models/types.js';
import { generateId } from '../utils/idGenerator.js';

interface CreateAuditLogData {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export class AuditDataHelper extends BaseDataHelper<AuditLog> {
  constructor() {
    super('auditLogs.json');
  }

  public getLogById(logId: string): AuditLog | null {
    return this.getById(logId, 'logId');
  }

  public createLog(logData: CreateAuditLogData): AuditLog {
    const auditLog: AuditLog = {
      logId: generateId(),
      ...logData,
      timestamp: new Date().toISOString()
    };
    
    return this.add(auditLog);
  }

  public getLogsByUser(userId: string): AuditLog[] {
    return this.findWhere(log => log.userId === userId);
  }

  public getLogsByEntity(entity: string): AuditLog[] {
    return this.findWhere(log => log.entity === entity);
  }

  public getLogsByEntityId(entityId: string): AuditLog[] {
    return this.findWhere(log => log.entityId === entityId);
  }

  public getLogsByAction(action: string): AuditLog[] {
    return this.findWhere(log => log.action === action);
  }

  public getRecentLogs(limit: number = 100): AuditLog[] {
    this.loadData();
    return this.data
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public getLogsByDateRange(startDate: string, endDate: string): AuditLog[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return this.findWhere(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= start && logTime <= end;
    });
  }

  public getLogsByUserAndDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): AuditLog[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return this.findWhere(log => {
      const logTime = new Date(log.timestamp).getTime();
      return log.userId === userId && logTime >= start && logTime <= end;
    });
  }

  public cleanOldLogs(daysToKeep: number = 90): number {
    this.loadData();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffTime = cutoffDate.getTime();
    
    const initialLength = this.data.length;
    this.data = this.data.filter(log => {
      return new Date(log.timestamp).getTime() >= cutoffTime;
    });
    
    if (this.data.length < initialLength) {
      this.saveData();
    }
    
    return initialLength - this.data.length;
  }
}
