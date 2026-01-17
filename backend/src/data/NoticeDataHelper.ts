import { BaseDataHelper } from './BaseDataHelper.js';
import { Notice, NoticeType, PublishStatus } from '../models/types.js';

export class NoticeDataHelper extends BaseDataHelper<Notice> {
  constructor() {
    super('notices.json');
  }

  public getNoticeById(noticeId: string): Notice | null {
    return this.getById(noticeId, 'noticeId');
  }

  public createNotice(noticeData: Notice): Notice {
    return this.add(noticeData);
  }

  public updateNotice(noticeId: string, updates: Partial<Notice>): Notice | null {
    return this.updateById(noticeId, 'noticeId', updates);
  }

  public deleteNotice(noticeId: string): boolean {
    return this.deleteById(noticeId, 'noticeId');
  }

  public getNoticesByType(type: NoticeType): Notice[] {
    return this.findWhere(notice => notice.type === type);
  }

  public getNoticesByStatus(status: PublishStatus): Notice[] {
    return this.findWhere(notice => notice.status === status);
  }

  public getPublishedNotices(): Notice[] {
    return this.findWhere(notice => notice.status === 'published');
  }

  public getNoticesByCompetition(competitionId: string): Notice[] {
    return this.findWhere(
      notice =>
        notice.type === 'competition' && notice.competitionId === competitionId
    );
  }

  public getPublishedCompetitionNotices(competitionId: string): Notice[] {
    return this.findWhere(
      notice =>
        notice.type === 'competition' &&
        notice.competitionId === competitionId &&
        notice.status === 'published'
    );
  }

  public getGeneralNotices(): Notice[] {
    return this.findWhere(notice => notice.type === 'general');
  }

  public deleteNoticesByCompetition(competitionId: string): number {
    this.loadData();
    const initialLength = this.data.length;
    this.data = this.data.filter(
      notice => !(notice.type === 'competition' && notice.competitionId === competitionId)
    );
    
    if (this.data.length < initialLength) {
      this.saveData();
    }
    
    return initialLength - this.data.length;
  }
}
