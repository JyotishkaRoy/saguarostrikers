import { DiscussionDataHelper } from '../data/DiscussionDataHelper.js';
import { DiscussionThread } from '../models/types.js';

export class DiscussionService {
  private discussionDataHelper: DiscussionDataHelper;

  constructor() {
    this.discussionDataHelper = new DiscussionDataHelper();
  }

  async getAllThreads(options: {
    skip?: number;
    limit?: number;
    category?: string;
    status?: string;
    missionId?: string;
  }): Promise<{ threads: DiscussionThread[]; total: number; hasMore: boolean }> {
    return this.discussionDataHelper.getAllThreads(options);
  }

  async getThreadById(threadId: string): Promise<DiscussionThread | null> {
    return this.discussionDataHelper.getByThreadId(threadId);
  }

  async addReply(
    threadId: string,
    content: string,
    user: { userId: string; name?: string; email?: string; role?: string }
  ): Promise<{ replyId: string; content: string; authorId: string; authorName?: string; authorEmail?: string; authorRole?: string; createdAt: string } | null> {
    const thread = this.discussionDataHelper.getByThreadId(threadId);
    if (!thread) return null;
    if (thread.isLocked) throw new Error('This discussion is locked');
    if (!content || content.trim().length < 1) throw new Error('Reply must be at least 1 character');
    const reply = this.discussionDataHelper.addReply(threadId, {
      content: content.trim(),
      authorId: user.userId,
      authorName: user.name,
      authorEmail: user.email,
      authorRole: user.role,
    });
    return reply;
  }

  async createThread(
    data: {
      title: string;
      description: string;
      category: string;
      missionId?: string;
      isPinned?: boolean;
      isLocked?: boolean;
    },
    userId?: string
  ): Promise<DiscussionThread> {
    if (!data.title || data.title.trim().length < 5) {
      throw new Error('Thread title must be at least 5 characters');
    }
    if (!data.description || data.description.trim().length < 10) {
      throw new Error('Thread description must be at least 10 characters');
    }
    if (!data.category) {
      throw new Error('Thread category is required');
    }
    return this.discussionDataHelper.createThread({
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      missionId: data.missionId || undefined,
      status: 'open',
      createdBy: userId,
      isPinned: data.isPinned ?? false,
      isLocked: data.isLocked ?? false,
    });
  }

  async updateThread(
    threadId: string,
    updates: Partial<Pick<DiscussionThread, 'title' | 'description' | 'category' | 'missionId' | 'isPinned' | 'isLocked'>>
  ): Promise<DiscussionThread | null> {
    const thread = this.discussionDataHelper.getByThreadId(threadId);
    if (!thread) return null;
    return this.discussionDataHelper.updateThread(threadId, updates);
  }

  async updateThreadStatus(threadId: string, status: 'open' | 'closed'): Promise<DiscussionThread | null> {
    return this.discussionDataHelper.updateThreadStatus(threadId, status);
  }

  async deleteThread(threadId: string): Promise<boolean> {
    return this.discussionDataHelper.deleteThread(threadId);
  }

  async updateReply(
    threadId: string,
    replyId: string,
    content: string,
    userId: string
  ): Promise<DiscussionThread['replies'][0] | null> {
    const thread = this.discussionDataHelper.getByThreadId(threadId);
    if (!thread?.replies) return null;
    const reply = thread.replies.find((r) => r.replyId === replyId);
    if (!reply || reply.authorId !== userId) return null;
    if (!content || content.trim().length < 1) throw new Error('Content is required');
    return this.discussionDataHelper.updateReply(threadId, replyId, content);
  }

  async deleteReply(threadId: string, replyId: string): Promise<DiscussionThread | null> {
    return this.discussionDataHelper.deleteReply(threadId, replyId);
  }

  async getStats(): Promise<{
    totalThreads: number;
    openThreads: number;
    closedThreads: number;
    totalReplies: number;
  }> {
    return this.discussionDataHelper.getStats();
  }
}
