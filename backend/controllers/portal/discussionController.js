const discussionService = require('../../services/discussionService');

class DiscussionController {
  // Get all threads (Public/Users)
  async getAllThreads(req, res, next) {
    try {
      const { page = 1, limit = 20, category } = req.query;
      const skip = (page - 1) * limit;

      const result = await discussionService.getAllThreads({
        skip: parseInt(skip),
        limit: parseInt(limit),
        category,
        status: 'open', // Only show open threads to users
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

  // Get a single thread with replies
  async getThread(req, res, next) {
    try {
      const { id } = req.params;
      const thread = await discussionService.getThreadWithReplies(id);
      res.json({
        success: true,
        data: thread,
      });
    } catch (error) {
      next(error);
    }
  }

  // Add a reply to a thread (Authenticated users)
  async addReply(req, res, next) {
    try {
      const { id } = req.params;
      const reply = await discussionService.addReply(id, req.body, req.user);
      res.status(201).json({
        success: true,
        data: reply,
        message: 'Reply added successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Search threads
  async searchThreads(req, res, next) {
    try {
      const { query } = req.query;
      if (!query || query.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 3 characters',
        });
      }

      const threads = await discussionService.searchThreads(query);
      res.json({
        success: true,
        data: threads,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DiscussionController();
