const noticeDataHelper = require('../dataHelpers/noticeDataHelper');
const missionDataHelper = require('../dataHelpers/missionDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class NoticeService {
  createNotice(noticeData, userId, requestInfo = {}) {
    const { title, content, type, missionId, priority, status } = noticeData;

    // If mission notice, verify mission exists
    if (type === 'mission' && missionId) {
      const mission = missionDataHelper.getMissionById(missionId);
      if (!mission) {
        throw new Error('Mission not found');
      }
    }

    // Create notice
    const newNotice = noticeDataHelper.createNotice({
      title,
      content,
      type: type || 'general',
      missionId: missionId || null,
      priority: priority || 'medium',
      status: status || 'draft',
      createdBy: userId,
      publishedAt: status === 'published' ? new Date().toISOString() : null
    });

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'NOTICE_CREATED',
      entity: 'notice',
      entityId: newNotice.noticeId,
      changes: { title, type, status: newNotice.status },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newNotice;
  }

  updateNotice(noticeId, updateData, userId, requestInfo = {}) {
    const notice = noticeDataHelper.getNoticeById(noticeId);
    if (!notice) {
      throw new Error('Notice not found');
    }

    // If publishing, set publishedAt
    if (updateData.status === 'published' && notice.status !== 'published') {
      updateData.publishedAt = new Date().toISOString();
    }

    const updatedNotice = noticeDataHelper.updateNotice(noticeId, updateData);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'NOTICE_UPDATED',
      entity: 'notice',
      entityId: noticeId,
      changes: updateData,
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedNotice;
  }

  deleteNotice(noticeId, userId, requestInfo = {}) {
    const notice = noticeDataHelper.getNoticeById(noticeId);
    if (!notice) {
      throw new Error('Notice not found');
    }

    const success = noticeDataHelper.deleteNotice(noticeId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId,
        action: 'NOTICE_DELETED',
        entity: 'notice',
        entityId: noticeId,
        changes: { title: notice.title },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }

  getAllNotices() {
    return noticeDataHelper.getAllNotices();
  }

  getPublishedNotices() {
    return noticeDataHelper.getPublishedNotices();
  }

  getPublishedGeneralNotices() {
    return noticeDataHelper.getPublishedGeneralNotices();
  }

  getNoticesByMission(missionId) {
    return noticeDataHelper.getNoticesByMission(missionId);
  }

  publishNotice(noticeId, userId, requestInfo = {}) {
    return this.updateNotice(noticeId, { 
      status: 'published',
      publishedAt: new Date().toISOString()
    }, userId, requestInfo);
  }

  unpublishNotice(noticeId, userId, requestInfo = {}) {
    return this.updateNotice(noticeId, { status: 'unpublished' }, userId, requestInfo);
  }
}

module.exports = new NoticeService();

