import { generateId } from '../utils/idGenerator.js';
import { NoticeDataHelper } from '../data/NoticeDataHelper.js';
import { MissionDataHelper } from '../data/MissionDataHelper.js';
import { Notice } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class NoticeService {
  private noticeDataHelper: NoticeDataHelper;
  private missionDataHelper: MissionDataHelper;

  constructor() {
    this.noticeDataHelper = new NoticeDataHelper();
    this.missionDataHelper = new MissionDataHelper();
  }

  /**
   * Get all notices (admin)
   */
  async getAllNotices(): Promise<Notice[]> {
    return this.noticeDataHelper.getAll();
  }

  /**
   * Get published notices (public)
   */
  async getPublishedNotices(): Promise<Notice[]> {
    return this.noticeDataHelper.getPublishedNotices();
  }

  /**
   * Get notice by ID
   */
  async getNoticeById(noticeId: string): Promise<Notice> {
    const notice = this.noticeDataHelper.getNoticeById(noticeId);
    
    if (!notice) {
      throw createError.notFound('Notice not found');
    }

    return notice;
  }

  /**
   * Get notices by mission (public shows only published)
   */
  async getNoticesByMission(
    missionId: string,
    publishedOnly: boolean = true
  ): Promise<Notice[]> {
    if (publishedOnly) {
      return this.noticeDataHelper.getPublishedMissionNotices(missionId);
    }
    return this.noticeDataHelper.getNoticesByMission(missionId);
  }

  /**
   * Get general notices (public shows only published)
   */
  async getGeneralNotices(publishedOnly: boolean = true): Promise<Notice[]> {
    const notices = this.noticeDataHelper.getGeneralNotices();
    
    if (publishedOnly) {
      return notices.filter(notice => notice.status === 'published');
    }
    
    return notices;
  }

  /**
   * Create notice
   */
  async createNotice(
    data: {
      title: string;
      content: string;
      type: 'general' | 'mission';
      missionId?: string;
      status?: 'draft' | 'published' | 'unpublished';
      priority?: 'low' | 'medium' | 'high';
    },
    createdBy: string
  ): Promise<Notice> {
    // If mission notice, verify mission exists
    if (data.type === 'mission') {
      if (!data.missionId) {
        throw createError.badRequest('Mission ID required for mission notices');
      }

      const mission = this.missionDataHelper.getMissionById(data.missionId);
      if (!mission) {
        throw createError.notFound('Mission not found');
      }
    }

    const notice: Notice = {
      noticeId: generateId(),
      title: data.title,
      content: data.content,
      type: data.type,
      missionId: data.missionId,
      status: data.status || 'draft',
      priority: data.priority || 'medium',
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: data.status === 'published' ? new Date().toISOString() : undefined
    };

    return this.noticeDataHelper.createNotice(notice);
  }

  /**
   * Update notice
   */
  async updateNotice(
    noticeId: string,
    updates: {
      title?: string;
      content?: string;
      status?: 'draft' | 'published' | 'unpublished';
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<Notice> {
    const notice = this.noticeDataHelper.getNoticeById(noticeId);
    
    if (!notice) {
      throw createError.notFound('Notice not found');
    }

    const updateData: any = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Set publishedAt if status changes to published
    if (updates.status === 'published' && notice.status !== 'published') {
      updateData.publishedAt = new Date().toISOString();
    }

    const updatedNotice = this.noticeDataHelper.updateNotice(noticeId, updateData);

    if (!updatedNotice) {
      throw createError.internal('Failed to update notice');
    }

    return updatedNotice;
  }

  /**
   * Delete notice
   */
  async deleteNotice(noticeId: string): Promise<void> {
    const notice = this.noticeDataHelper.getNoticeById(noticeId);
    
    if (!notice) {
      throw createError.notFound('Notice not found');
    }

    const deleted = this.noticeDataHelper.deleteNotice(noticeId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete notice');
    }
  }

  /**
   * Publish/unpublish notice
   */
  async togglePublishStatus(noticeId: string): Promise<Notice> {
    const notice = this.noticeDataHelper.getNoticeById(noticeId);
    
    if (!notice) {
      throw createError.notFound('Notice not found');
    }

    const newStatus = notice.status === 'published' ? 'unpublished' : 'published';
    
    return this.updateNotice(noticeId, { status: newStatus });
  }
}
