const discussionDataHelper = require('../dataHelpers/discussionDataHelper');
const auditLogService = require('./auditLogService');

class DiscussionService {
  // Create a new thread (Admin only)
  async createThread(threadData, userId) {
    // Validate
    if (!threadData.title || threadData.title.trim().length < 5) {
      throw new Error('Thread title must be at least 5 characters');
    }

    if (!threadData.description || threadData.description.trim().length < 10) {
      throw new Error('Thread description must be at least 10 characters');
    }

    if (!threadData.category) {
      throw new Error('Thread category is required');
    }

    const thread = await discussionDataHelper.createThread({
      title: threadData.title.trim(),
      description: threadData.description.trim(),
      category: threadData.category,
      status: 'open',
      createdBy: userId,
      isPinned: threadData.isPinned || false,
      isLocked: threadData.isLocked || false,
    });

    await auditLogService.log({
      action: 'DISCUSSION_THREAD_CREATED',
      userId,
      details: { threadId: thread.threadId, title: thread.title },
    });

    return thread;
  }

  // Add a reply to a thread
  async addReply(threadId, replyData, user) {
    // Validate
    if (!replyData.content || replyData.content.trim().length < 5) {
      throw new Error('Reply must be at least 5 characters');
    }

    if (!user || !user.userId) {
      throw new Error('User information is required');
    }

    const reply = await discussionDataHelper.addReply(threadId, {
      content: replyData.content.trim(),
      authorId: user.userId,
      authorName: `${user.firstName} ${user.lastName}`,
      authorRole: user.role,
    });

    await auditLogService.log({
      action: 'DISCUSSION_REPLY_ADDED',
      userId: user.userId,
      details: { threadId, replyId: reply.replyId },
    });

    return reply;
  }

  // Get all threads with pagination
  async getAllThreads(options = {}) {
    return await discussionDataHelper.getAllThreads(options);
  }

  // Get a single thread with replies
  async getThreadWithReplies(threadId) {
    return await discussionDataHelper.getThreadWithReplies(threadId);
  }

  // Update thread (Admin only)
  async updateThread(threadId, updateData, userId) {
    const thread = await discussionDataHelper.getById(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    const updatedThread = {
      ...thread,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await discussionDataHelper.update(threadId, updatedThread);

    await auditLogService.log({
      action: 'DISCUSSION_THREAD_UPDATED',
      userId,
      details: { threadId, updates: Object.keys(updateData) },
    });

    return updatedThread;
  }

  // Close/Lock a thread (Admin only)
  async updateThreadStatus(threadId, status, userId) {
    const thread = await discussionDataHelper.updateThreadStatus(threadId, status);

    await auditLogService.log({
      action: 'DISCUSSION_THREAD_STATUS_UPDATED',
      userId,
      details: { threadId, newStatus: status },
    });

    return thread;
  }

  // Delete a thread (Admin only)
  async deleteThread(threadId, userId) {
    await discussionDataHelper.delete(threadId);

    await auditLogService.log({
      action: 'DISCUSSION_THREAD_DELETED',
      userId,
      details: { threadId },
    });
  }

  // Delete a reply (Admin only)
  async deleteReply(threadId, replyId, userId) {
    const thread = await discussionDataHelper.deleteReply(threadId, replyId);

    await auditLogService.log({
      action: 'DISCUSSION_REPLY_DELETED',
      userId,
      details: { threadId, replyId },
    });

    return thread;
  }

  // Search threads
  async searchThreads(query) {
    return await discussionDataHelper.searchThreads(query);
  }

  // Get stats
  async getStats() {
    const threads = await discussionDataHelper.getAll();
    const totalReplies = threads.reduce((sum, t) => sum + (t.replyCount || 0), 0);
    
    return {
      totalThreads: threads.length,
      openThreads: threads.filter(t => t.status === 'open').length,
      closedThreads: threads.filter(t => t.status === 'closed').length,
      totalReplies,
    };
  }
}

module.exports = new DiscussionService();
