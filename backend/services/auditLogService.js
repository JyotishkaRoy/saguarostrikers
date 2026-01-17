const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class AuditLogService {
  getRecentLogs(limit = 100) {
    return auditLogDataHelper.getRecentLogs(limit);
  }

  getLogsByUser(userId) {
    return auditLogDataHelper.getLogsByUser(userId);
  }

  getLogsByEntity(entity, entityId) {
    return auditLogDataHelper.getLogsByEntity(entity, entityId);
  }

  getLogsByAction(action) {
    return auditLogDataHelper.getLogsByAction(action);
  }

  getLogsByDateRange(startDate, endDate) {
    return auditLogDataHelper.getLogsByDateRange(startDate, endDate);
  }

  getAllLogs() {
    return auditLogDataHelper.getAllLogs();
  }
}

module.exports = new AuditLogService();

