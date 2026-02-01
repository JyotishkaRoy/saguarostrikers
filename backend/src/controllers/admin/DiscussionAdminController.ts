import { Request, Response } from 'express';
import { DiscussionService } from '../../services/DiscussionService.js';
import { AuthRequest } from '../../models/types.js';
import { ApiError } from '../../middleware/errorHandler.js';

export class DiscussionAdminController {
  private discussionService: DiscussionService;

  constructor() {
    this.discussionService = new DiscussionService();
  }

  async getAllThreads(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
      const skip = (page - 1) * limit;
      const category = req.query.category ? String(req.query.category) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await this.discussionService.getAllThreads({
        skip,
        limit,
        category,
        status,
      });

      res.status(200).json({
        success: true,
        data: result.threads,
        pagination: {
          page,
          limit,
          total: result.total,
          hasMore: result.hasMore,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
      }
    }
  }

  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.discussionService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch discussion stats' });
    }
  }

  async createThread(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const thread = await this.discussionService.createThread(req.body, userId);
      res.status(201).json({
        success: true,
        data: thread,
        message: 'Thread created successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to create thread' });
      }
    }
  }

  async updateThread(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const thread = await this.discussionService.updateThread(id, req.body);
      if (!thread) {
        res.status(404).json({ success: false, message: 'Thread not found' });
        return;
      }
      res.status(200).json({
        success: true,
        data: thread,
        message: 'Thread updated successfully',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update thread' });
    }
  }

  async updateThreadStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (status !== 'open' && status !== 'closed') {
        res.status(400).json({ success: false, message: 'Status must be open or closed' });
        return;
      }
      const thread = await this.discussionService.updateThreadStatus(id, status);
      if (!thread) {
        res.status(404).json({ success: false, message: 'Thread not found' });
        return;
      }
      res.status(200).json({
        success: true,
        data: thread,
        message: 'Thread status updated successfully',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update thread status' });
    }
  }

  async deleteThread(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.discussionService.deleteThread(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Thread not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Thread deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete thread' });
    }
  }

  async deleteReply(req: Request, res: Response): Promise<void> {
    try {
      const { threadId, replyId } = req.params;
      const thread = await this.discussionService.deleteReply(threadId, replyId);
      if (!thread) {
        res.status(404).json({ success: false, message: 'Thread or reply not found' });
        return;
      }
      res.status(200).json({
        success: true,
        data: thread,
        message: 'Reply deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete reply' });
    }
  }
}
