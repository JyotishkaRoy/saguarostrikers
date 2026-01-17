const express = require('express');
const router = express.Router();
const noticeAdminController = require('../../controllers/admin/noticeAdminController');
const { isAdmin } = require('../../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../../middleware/validationMiddleware');

// All routes require admin authentication
router.use(isAdmin);

// Notices
router.get('/notices', noticeAdminController.getAllNotices);
router.post('/notices', validationRules.createNotice, handleValidationErrors, noticeAdminController.createNotice);
router.put('/notices/:id', noticeAdminController.updateNotice);
router.delete('/notices/:id', noticeAdminController.deleteNotice);
router.post('/notices/:id/publish', noticeAdminController.publishNotice);
router.post('/notices/:id/unpublish', noticeAdminController.unpublishNotice);

module.exports = router;

