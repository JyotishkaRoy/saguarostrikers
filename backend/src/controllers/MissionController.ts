import { Request, Response } from 'express';
import { MissionService } from '../services/MissionService.js';
import { AuthRequest } from '../models/types.js';
import { ApiError } from '../middleware/errorHandler.js';

export class MissionController {
  private missionService: MissionService;

  constructor() {
    this.missionService = new MissionService();
  }

  /**
   * Get all missions (admin)
   */
  async getAllMissions(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const missions = await this.missionService.getAllMissions();
      res.status(200).json({ success: true, data: missions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch missions' });
    }
  }

  /**
   * Get published missions (public)
   */
  async getPublishedMissions(_req: Request, res: Response): Promise<void> {
    try {
      const missions = await this.missionService.getPublishedMissions();
      res.status(200).json({ success: true, data: missions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch missions' });
    }
  }

  /**
   * Get upcoming missions (public)
   */
  async getUpcomingMissions(_req: Request, res: Response): Promise<void> {
    try {
      const missions = await this.missionService.getUpcomingMissions();
      res.status(200).json({ success: true, data: missions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch upcoming missions' });
    }
  }

  /**
   * Get mission by ID
   */
  async getMissionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const mission = await this.missionService.getMissionById(id);
      res.status(200).json({ success: true, data: mission });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch mission' });
      }
    }
  }

  /**
   * Get mission by slug (public)
   */
  async getMissionBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const mission = await this.missionService.getMissionBySlug(slug);
      res.status(200).json({ success: true, data: mission });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch mission' });
      }
    }
  }

  /**
   * Get mission with sub-events
   */
  async getMissionWithSubEvents(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.missionService.getMissionWithSubEvents(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch mission details' });
      }
    }
  }

  /**
   * Create mission (admin)
   */
  async createMission(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const mission = await this.missionService.createMission(
        req.body,
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: 'Mission created successfully',
        data: mission
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to create mission' });
      }
    }
  }

  /**
   * Update mission (admin)
   */
  async updateMission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const mission = await this.missionService.updateMission(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Mission updated successfully',
        data: mission
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update mission' });
      }
    }
  }

  /**
   * Delete mission (admin)
   */
  async deleteMission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.missionService.deleteMission(id);

      res.status(200).json({
        success: true,
        message: 'Mission deleted successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to delete mission' });
      }
    }
  }

  /**
   * Search missions
   */
  async searchMissions(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        res.status(400).json({ success: false, message: 'Search query required' });
        return;
      }

      const missions = await this.missionService.searchMissions(q);
      res.status(200).json({ success: true, data: missions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Search failed' });
    }
  }
}
