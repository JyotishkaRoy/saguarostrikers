const DatabaseHelper = require('./databaseHelper');
const { v4: uuidv4 } = require('uuid');

class DiscussionDataHelper extends DatabaseHelper {
  constructor() {
    super('discussions');
  }

  // Create a new discussion thread (Admin only)
  async createThread(threadData) {
    const thread = {
      threadId: uuidv4(),
      ...threadData,
      replies: [],
      replyCount: 0,
      lastReplyAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.create(thread);
    return thread;
  }

  // Add a reply to a thread
  async addReply(threadId, replyData) {
    const thread = await this.getById(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    const reply = {
      replyId: uuidv4(),
      ...replyData,
      createdAt: new Date().toISOString(),
    };

    thread.replies = thread.replies || [];
    thread.replies.push(reply);
    thread.replyCount = thread.replies.length;
    thread.lastReplyAt = reply.createdAt;
    thread.updatedAt = new Date().toISOString();

    await this.update(threadId, thread);
    return reply;
  }

  // Get all threads (with pagination)
  async getAllThreads(options = {}) {
    const { skip = 0, limit = 20, category, status = 'open' } = options;
    let threads = await this.getAll();

    // Filter by category
    if (category) {
      threads = threads.filter(t => t.category === category);
    }

    // Filter by status
    if (status) {
      threads = threads.filter(t => t.status === status);
    }

    // Sort by last activity
    threads.sort((a, b) => {
      const aDate = new Date(a.lastReplyAt || a.createdAt);
      const bDate = new Date(b.lastReplyAt || b.createdAt);
      return bDate - aDate;
    });

    // Paginate
    const total = threads.length;
    threads = threads.slice(skip, skip + limit);

    return { threads, total, hasMore: skip + limit < total };
  }

  // Get a single thread with all replies
  async getThreadWithReplies(threadId) {
    const thread = await this.getById(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    // Sort replies by creation date
    if (thread.replies && thread.replies.length > 0) {
      thread.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return thread;
  }

  // Update thread status (Admin only)
  async updateThreadStatus(threadId, status) {
    const thread = await this.getById(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    thread.status = status;
    thread.updatedAt = new Date().toISOString();
    await this.update(threadId, thread);
    return thread;
  }

  // Delete a reply (Admin only)
  async deleteReply(threadId, replyId) {
    const thread = await this.getById(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    thread.replies = thread.replies.filter(r => r.replyId !== replyId);
    thread.replyCount = thread.replies.length;
    thread.updatedAt = new Date().toISOString();

    await this.update(threadId, thread);
    return thread;
  }

  // Search threads
  async searchThreads(query) {
    const threads = await this.getAll();
    const lowerQuery = query.toLowerCase();

    return threads.filter(t => 
      t.title.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Get threads by category
  async getThreadsByCategory(category) {
    const threads = await this.getAll();
    return threads.filter(t => t.category === category);
  }

  // Get recent threads
  async getRecentThreads(limit = 5) {
    const threads = await this.getAll();
    threads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return threads.slice(0, limit);
  }

  // Get popular threads (most replies)
  async getPopularThreads(limit = 5) {
    const threads = await this.getAll();
    threads.sort((a, b) => b.replyCount - a.replyCount);
    return threads.slice(0, limit);
  }
}

module.exports = new DiscussionDataHelper();
