const express = require('express');
const router = express.Router();
const auditLogAdminController = require('../../controllers/admin/auditLogAdminController');
const { isAdmin } = require('../../middleware/authMiddleware');

// All routes require admin authentication
router.use(isAdmin);

// Audit logs
router.get('/logs', auditLogAdminController.getAllLogs);
router.get('/logs/recent', auditLogAdminController.getRecentLogs);
router.get('/logs/user/:userId', auditLogAdminController.getLogsByUser);
router.get('/logs/entity/:entity/:entityId', auditLogAdminController.getLogsByEntity);
router.get('/logs/action/:action', auditLogAdminController.getLogsByAction);
router.get('/logs/date-range', auditLogAdminController.getLogsByDateRange);

module.exports = router;

