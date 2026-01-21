const { generateId } = require('../utils/idGenerator.cjs');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class NoticeDataHelper {
  getAllNotices() {
    return readDB(DB_FILES.NOTICES);
  }

  getNoticeById(noticeId) {
    const notices = this.getAllNotices();
    return notices.find(notice => notice.noticeId === noticeId);
  }

  getNoticesByMission(missionId) {
    const notices = this.getAllNotices();
    return notices.filter(notice => notice.missionId === missionId);
  }

  createNotice(noticeData) {
    const notices = this.getAllNotices();
    const newNotice = {
      noticeId: generateId(),
      ...noticeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notices.push(newNotice);
    writeDB(DB_FILES.NOTICES, notices);
    return newNotice;
  }

  updateNotice(noticeId, updateData) {
    const notices = this.getAllNotices();
    const index = notices.findIndex(notice => notice.noticeId === noticeId);
    
    if (index === -1) return null;
    
    notices[index] = {
      ...notices[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    writeDB(DB_FILES.NOTICES, notices);
    return notices[index];
  }

  deleteNotice(noticeId) {
    const notices = this.getAllNotices();
    const filteredNotices = notices.filter(notice => notice.noticeId !== noticeId);
    
    if (notices.length === filteredNotices.length) return false;
    
    writeDB(DB_FILES.NOTICES, filteredNotices);
    return true;
  }

  getPublishedNotices() {
    const notices = this.getAllNotices();
    return notices.filter(notice => notice.status === 'published')
      .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
  }

  getPublishedGeneralNotices() {
    const notices = this.getPublishedNotices();
    return notices.filter(notice => notice.type === 'general');
  }
}

module.exports = new NoticeDataHelper();

