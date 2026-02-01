import { Request, Response } from 'express';
import { AuditService } from '../../services/AuditService.js';

export class AuditAdminController {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  /**
   * Get all audit logs (most recent first)
   */
  async getAllLogs(_req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.auditService.getRecentLogs(500);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
    }
  }
}
