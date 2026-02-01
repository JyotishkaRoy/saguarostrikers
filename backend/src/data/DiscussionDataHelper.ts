import { BaseDataHelper } from './BaseDataHelper.js';
import { DiscussionThread, DiscussionReply } from '../models/types.js';
import { generateId } from '../utils/idGenerator.js';

export class DiscussionDataHelper extends BaseDataHelper<DiscussionThread> {
  constructor() {
    super('discussions.json');
  }

  getByThreadId(threadId: string): DiscussionThread | null {
    return this.getById(threadId, 'threadId');
  }

  getAllThreads(options: {
    skip?: number;
    limit?: number;
    category?: string;
    status?: string;
    missionId?: string;
  } = {}): { threads: DiscussionThread[]; total: number; hasMore: boolean } {
    const { skip = 0, limit = 20, category, status, missionId } = options;
    let threads = this.getAll();

    if (category) {
      threads = threads.filter((t) => t.category === category);
    }
    if (status) {
      threads = threads.filter((t) => t.status === status);
    }
    if (missionId) {
      threads = threads.filter((t) => t.missionId === missionId);
    }

    threads.sort((a, b) => {
      const aDate = new Date(a.lastReplyAt || a.createdAt).getTime();
      const bDate = new Date(b.lastReplyAt || b.createdAt).getTime();
      return bDate - aDate;
    });

    const total = threads.length;
    const paginated = threads.slice(skip, skip + limit);
    return { threads: paginated, total, hasMore: skip + limit < total };
  }

  createThread(data: {
    title: string;
    description: string;
    category: string;
    status?: 'open' | 'closed';
    missionId?: string;
    createdBy?: string;
    isPinned?: boolean;
    isLocked?: boolean;
  }): DiscussionThread {
    const now = new Date().toISOString();
    const thread: DiscussionThread = {
      threadId: generateId(),
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status ?? 'open',
      missionId: data.missionId,
      createdBy: data.createdBy,
      replies: [],
      replyCount: 0,
      lastReplyAt: null,
      isPinned: data.isPinned ?? false,
      isLocked: data.isLocked ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.add(thread);
    return thread;
  }

  updateThread(threadId: string, updates: Partial<DiscussionThread>): DiscussionThread | null {
    const now = new Date().toISOString();
    return this.updateById(threadId, 'threadId', { ...updates, updatedAt: now });
  }

  updateThreadStatus(threadId: string, status: 'open' | 'closed'): DiscussionThread | null {
    return this.updateThread(threadId, { status });
  }

  addReply(threadId: string, replyData: { content: string; authorId: string; authorName?: string; authorEmail?: string; authorRole?: string }): DiscussionReply | null {
    const thread = this.getByThreadId(threadId);
    if (!thread) return null;

    const reply: DiscussionReply = {
      replyId: generateId(),
      content: replyData.content,
      authorId: replyData.authorId,
      authorName: replyData.authorName,
      authorEmail: replyData.authorEmail,
      authorRole: replyData.authorRole,
      createdAt: new Date().toISOString(),
    };

    const replies = [...(thread.replies || []), reply];
    const updated: Partial<DiscussionThread> = {
      replies,
      replyCount: replies.length,
      lastReplyAt: reply.createdAt,
      updatedAt: reply.createdAt,
    };
    this.updateById(threadId, 'threadId', updated);
    return reply;
  }

  updateReply(threadId: string, replyId: string, content: string): DiscussionReply | null {
    const thread = this.getByThreadId(threadId);
    if (!thread || !thread.replies) return null;
    const index = thread.replies.findIndex((r) => r.replyId === replyId);
    if (index === -1) return null;
    const replies = [...thread.replies];
    replies[index] = { ...replies[index], content: content.trim() };
    this.updateById(threadId, 'threadId', {
      replies,
      updatedAt: new Date().toISOString(),
    });
    return replies[index];
  }

  deleteReply(threadId: string, replyId: string): DiscussionThread | null {
    const thread = this.getByThreadId(threadId);
    if (!thread) return null;

    const replies = (thread.replies || []).filter((r) => r.replyId !== replyId);
    const lastReplyAt = replies.length > 0 ? replies[replies.length - 1].createdAt : null;
    const updated = this.updateById(threadId, 'threadId', {
      replies,
      replyCount: replies.length,
      lastReplyAt,
      updatedAt: new Date().toISOString(),
    });
    return updated;
  }

  deleteThread(threadId: string): boolean {
    return this.deleteById(threadId, 'threadId');
  }

  getStats(): { totalThreads: number; openThreads: number; closedThreads: number; totalReplies: number } {
    const threads = this.getAll();
    const totalReplies = threads.reduce((sum, t) => sum + (t.replyCount || 0), 0);
    return {
      totalThreads: threads.length,
      openThreads: threads.filter((t) => t.status === 'open').length,
      closedThreads: threads.filter((t) => t.status === 'closed').length,
      totalReplies,
    };
  }
}
