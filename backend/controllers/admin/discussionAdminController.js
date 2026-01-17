const discussionService = require('../../services/discussionService');

class DiscussionAdminController {
  // Get all threads (Admin)
  async getAllThreads(req, res, next) {
    try {
      const { page = 1, limit = 20, category, status } = req.query;
      const skip = (page - 1) * limit;

      const result = await discussionService.getAllThreads({
        skip: parseInt(skip),
        limit: parseInt(limit),
        category,
        status,
      });

      res.json({
        success: true,
        data: result.threads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          hasMore: result.hasMore,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Create a new thread (Admin only)
  async createThread(req, res, next) {
    try {
      const thread = await discussionService.createThread(req.body, req.user.userId);
      res.status(201).json({
        success: true,
        data: thread,
        message: 'Thread created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Update a thread (Admin only)
  async updateThread(req, res, next) {
    try {
      const { id } = req.params;
      const thread = await discussionService.updateThread(id, req.body, req.user.userId);
      res.json({
        success: true,
        data: thread,
        message: 'Thread updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Update thread status (Admin only)
  async updateThreadStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const thread = await discussionService.updateThreadStatus(id, status, req.user.userId);
      res.json({
        success: true,
        data: thread,
        message: 'Thread status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a thread (Admin only)
  async deleteThread(req, res, next) {
    try {
      const { id } = req.params;
      await discussionService.deleteThread(id, req.user.userId);
      res.json({
        success: true,
        message: 'Thread deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a reply (Admin only)
  async deleteReply(req, res, next) {
    try {
      const { threadId, replyId } = req.params;
      const thread = await discussionService.deleteReply(threadId, replyId, req.user.userId);
      res.json({
        success: true,
        data: thread,
        message: 'Reply deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get discussion stats (Admin)
  async getStats(req, res, next) {
    try {
      const stats = await discussionService.getStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DiscussionAdminController();
