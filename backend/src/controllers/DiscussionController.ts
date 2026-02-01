import { Request, Response } from 'express';
import { DiscussionService } from '../services/DiscussionService.js';
import { UserService } from '../services/UserService.js';
import { AuthRequest } from '../models/types.js';
import { ApiError } from '../middleware/errorHandler.js';

export class DiscussionController {
  private discussionService: DiscussionService;
  private userService: UserService;

  constructor() {
    this.discussionService = new DiscussionService();
    this.userService = new UserService();
  }

  /** List threads (public). Optional query: missionId, category, limit, skip. */
  async getThreads(req: Request, res: Response): Promise<void> {
    try {
      const missionId = req.query.missionId ? String(req.query.missionId) : undefined;
      const category = req.query.category ? String(req.query.category) : undefined;
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 50));
      const skip = Math.max(0, parseInt(String(req.query.skip), 10) || 0);

      const result = await this.discussionService.getAllThreads({
        skip,
        limit,
        category,
        status: 'open',
        missionId,
      });

      res.status(200).json({
        success: true,
        data: result.threads,
        pagination: { total: result.total, hasMore: result.hasMore },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
      }
    }
  }

  /** Get a single thread with replies (public). */
  async getThreadById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const thread = await this.discussionService.getThreadById(id);
      if (!thread) {
        res.status(404).json({ success: false, message: 'Thread not found' });
        return;
      }
      res.status(200).json({ success: true, data: thread });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch thread' });
      }
    }
  }

  /** Add a reply (authenticated users). */
  async addReply(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id: threadId } = req.params;
      const content = req.body?.content;
      if (!content || typeof content !== 'string') {
        res.status(400).json({ success: false, message: 'Content is required' });
        return;
      }
      const user = req.user;
      if (!user?.userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      let authorName: string = user.email;
      try {
        const profile = await this.userService.getUserById(user.userId);
        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
        if (fullName) authorName = fullName;
      } catch {
        // keep email as fallback
      }
      const reply = await this.discussionService.addReply(threadId, content, {
        userId: user.userId,
        name: authorName,
        email: user.email,
        role: user.role,
      });
      if (!reply) {
        res.status(404).json({ success: false, message: 'Thread not found' });
        return;
      }
      res.status(201).json({ success: true, data: reply, message: 'Reply added' });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to add reply' });
      }
    }
  }

  /** Update own reply (authenticated; author only). */
  async updateReply(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id: threadId, replyId } = req.params;
      const content = req.body?.content;
      if (!content || typeof content !== 'string') {
        res.status(400).json({ success: false, message: 'Content is required' });
        return;
      }
      const user = req.user;
      if (!user?.userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const reply = await this.discussionService.updateReply(threadId, replyId, content, user.userId);
      if (!reply) {
        res.status(403).json({ success: false, message: 'Not allowed to edit this reply' });
        return;
      }
      res.status(200).json({ success: true, data: reply, message: 'Reply updated' });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update reply' });
      }
    }
  }
}
