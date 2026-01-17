const auditLogService = require('../../services/auditLogService');

class AuditLogAdminController {
  // Get recent logs
  getRecentLogs(req, res, next) {
    try {
      const { limit } = req.query;
      const logs = auditLogService.getRecentLogs(limit ? parseInt(limit) : 100);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // Get logs by user
  getLogsByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const logs = auditLogService.getLogsByUser(userId);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // Get logs by entity
  getLogsByEntity(req, res, next) {
    try {
      const { entity, entityId } = req.params;
      const logs = auditLogService.getLogsByEntity(entity, entityId);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // Get logs by action
  getLogsByAction(req, res, next) {
    try {
      const { action } = req.params;
      const logs = auditLogService.getLogsByAction(action);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // Get logs by date range
  getLogsByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const logs = auditLogService.getLogsByDateRange(startDate, endDate);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all logs
  getAllLogs(req, res, next) {
    try {
      const logs = auditLogService.getAllLogs();

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditLogAdminController();

