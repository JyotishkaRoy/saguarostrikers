import { Response } from 'express';
import { AuthRequest } from '../../models/types';
import { JoinMissionService } from '../../services/JoinMissionService.js';

export class JoinMissionAdminController {
  private joinMissionService: JoinMissionService;

  constructor() {
    this.joinMissionService = new JoinMissionService();
  }

  async getAllApplications(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const applications = await this.joinMissionService.getAllApplications();
      res.status(200).json({ success: true, data: applications });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
  }

  async getApplicationById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const application = await this.joinMissionService.getApplicationById(applicationId);

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found' });
        return;
      }

      res.status(200).json({ success: true, data: application });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch application' });
    }
  }

  async getApplicationsByMission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const applications = await this.joinMissionService.getApplicationsByMission(missionId);
      res.status(200).json({ success: true, data: applications });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
  }

  async getApplicationsByStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const applications = await this.joinMissionService.getApplicationsByStatus(status as any);
      res.status(200).json({ success: true, data: applications });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
  }

  async updateApplicationStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const application = await this.joinMissionService.updateApplicationStatus(
        applicationId,
        req.body,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        data: application
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update application status'
      });
    }
  }

  async updateApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const updated = await this.joinMissionService.updateApplication(applicationId, req.body);
      res.status(200).json({
        success: true,
        message: 'Application updated successfully',
        data: updated
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update application'
      });
    }
  }

  async deleteApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const deleted = await this.joinMissionService.deleteApplication(applicationId);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Application not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Application deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete application'
      });
    }
  }

  async searchApplications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      if (!query) {
        res.status(400).json({ success: false, message: 'Search query is required' });
        return;
      }

      const applications = await this.joinMissionService.searchApplications(query as string);
      res.status(200).json({ success: true, data: applications });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to search applications' });
    }
  }

  async getApplicationStats(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await this.joinMissionService.getApplicationStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch application stats' });
    }
  }
}
