const noticeService = require('../../services/noticeService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class NoticeAdminController {
  // Get all notices
  getAllNotices(req, res, next) {
    try {
      const notices = noticeService.getAllNotices();

      res.json({
        success: true,
        data: notices
      });
    } catch (error) {
      next(error);
    }
  }

  // Create notice
  createNotice(req, res, next) {
    try {
      const noticeData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const notice = noticeService.createNotice(noticeData, userId, requestInfo);

      res.status(201).json({
        success: true,
        message: 'Notice created successfully',
        data: notice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update notice
  updateNotice(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const notice = noticeService.updateNotice(id, updateData, userId, requestInfo);

      if (!notice) {
        return res.status(404).json({
          success: false,
          message: 'Notice not found'
        });
      }

      res.json({
        success: true,
        message: 'Notice updated successfully',
        data: notice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete notice
  deleteNotice(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = noticeService.deleteNotice(id, userId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notice not found'
        });
      }

      res.json({
        success: true,
        message: 'Notice deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Publish notice
  publishNotice(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const notice = noticeService.publishNotice(id, userId, requestInfo);

      res.json({
        success: true,
        message: 'Notice published successfully',
        data: notice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Unpublish notice
  unpublishNotice(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const notice = noticeService.unpublishNotice(id, userId, requestInfo);

      res.json({
        success: true,
        message: 'Notice unpublished successfully',
        data: notice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new NoticeAdminController();

