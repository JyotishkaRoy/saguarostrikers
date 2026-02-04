import { Response } from 'express';
import { AuthRequest } from '../../models/types.js';
import { OutreachService } from '../../services/OutreachService.js';
import { ApiError } from '../../middleware/errorHandler.js';

export class OutreachAdminController {
  private outreachService: OutreachService;

  constructor() {
    this.outreachService = new OutreachService();
  }

  async getAllOutreaches(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const outreaches = await this.outreachService.getAllOutreaches();
      res.status(200).json({ success: true, data: outreaches });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch outreaches' });
    }
  }

  async getOutreachById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const outreach = await this.outreachService.getOutreachById(id);
      res.status(200).json({ success: true, data: outreach });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch outreach' });
      }
    }
  }

  async createOutreach(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const outreach = await this.outreachService.createOutreach(req.body, req.user.userId);
      res.status(201).json({
        success: true,
        message: 'Outreach created successfully',
        data: outreach
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to create outreach' });
      }
    }
  }

  async updateOutreach(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const outreach = await this.outreachService.updateOutreach(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Outreach updated successfully',
        data: outreach
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update outreach' });
      }
    }
  }

  async deleteOutreach(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.outreachService.deleteOutreach(id);
      res.status(200).json({
        success: true,
        message: 'Outreach deleted successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to delete outreach' });
      }
    }
  }
}
