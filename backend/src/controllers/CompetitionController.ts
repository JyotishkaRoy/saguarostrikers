import { Request, Response } from 'express';
import { CompetitionService } from '../services/CompetitionService.js';
import { AuthRequest } from '../models/types.js';
import { ApiError } from '../middleware/errorHandler.js';

export class CompetitionController {
  private competitionService: CompetitionService;

  constructor() {
    this.competitionService = new CompetitionService();
  }

  /**
   * Get all competitions (admin)
   */
  async getAllCompetitions(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const competitions = await this.competitionService.getAllCompetitions();
      res.status(200).json({ success: true, data: competitions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch competitions' });
    }
  }

  /**
   * Get published competitions (public)
   */
  async getPublishedCompetitions(_req: Request, res: Response): Promise<void> {
    try {
      const competitions = await this.competitionService.getPublishedCompetitions();
      res.status(200).json({ success: true, data: competitions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch competitions' });
    }
  }

  /**
   * Get upcoming competitions (public)
   */
  async getUpcomingCompetitions(_req: Request, res: Response): Promise<void> {
    try {
      const competitions = await this.competitionService.getUpcomingCompetitions();
      res.status(200).json({ success: true, data: competitions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch upcoming competitions' });
    }
  }

  /**
   * Get competition by ID
   */
  async getCompetitionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const competition = await this.competitionService.getCompetitionById(id);
      res.status(200).json({ success: true, data: competition });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch competition' });
      }
    }
  }

  /**
   * Get competition by slug (public)
   */
  async getCompetitionBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const competition = await this.competitionService.getCompetitionBySlug(slug);
      res.status(200).json({ success: true, data: competition });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch competition' });
      }
    }
  }

  /**
   * Get competition with sub-events
   */
  async getCompetitionWithSubEvents(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.competitionService.getCompetitionWithSubEvents(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch competition details' });
      }
    }
  }

  /**
   * Create competition (admin)
   */
  async createCompetition(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const competition = await this.competitionService.createCompetition(
        req.body,
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: 'Competition created successfully',
        data: competition
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to create competition' });
      }
    }
  }

  /**
   * Update competition (admin)
   */
  async updateCompetition(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const competition = await this.competitionService.updateCompetition(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Competition updated successfully',
        data: competition
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update competition' });
      }
    }
  }

  /**
   * Delete competition (admin)
   */
  async deleteCompetition(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.competitionService.deleteCompetition(id);

      res.status(200).json({
        success: true,
        message: 'Competition deleted successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to delete competition' });
      }
    }
  }

  /**
   * Search competitions
   */
  async searchCompetitions(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        res.status(400).json({ success: false, message: 'Search query required' });
        return;
      }

      const competitions = await this.competitionService.searchCompetitions(q);
      res.status(200).json({ success: true, data: competitions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Search failed' });
    }
  }
}
