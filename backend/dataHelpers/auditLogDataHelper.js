const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class AuditLogDataHelper {
  getAllLogs() {
    return readDB(DB_FILES.AUDIT_LOGS);
  }

  getLogById(logId) {
    const logs = this.getAllLogs();
    return logs.find(log => log.logId === logId);
  }

  createLog(logData) {
    const logs = this.getAllLogs();
    const newLog = {
      logId: uuidv4(),
      ...logData,
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    writeDB(DB_FILES.AUDIT_LOGS, logs);
    return newLog;
  }

  getLogsByUser(userId) {
    const logs = this.getAllLogs();
    return logs.filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getLogsByEntity(entity, entityId) {
    const logs = this.getAllLogs();
    return logs.filter(log => log.entity === entity && log.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getLogsByAction(action) {
    const logs = this.getAllLogs();
    return logs.filter(log => log.action === action)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getRecentLogs(limit = 100) {
    const logs = this.getAllLogs();
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  getLogsByDateRange(startDate, endDate) {
    const logs = this.getAllLogs();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

module.exports = new AuditLogDataHelper();

