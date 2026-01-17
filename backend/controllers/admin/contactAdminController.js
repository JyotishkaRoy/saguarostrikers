const contactService = require('../../services/contactService');
const emailService = require('../../services/emailService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class ContactAdminController {
  // Get all messages
  getAllMessages(req, res, next) {
    try {
      const userId = req.user.userId;
      const messages = contactService.getAllMessages(userId);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }

  // Get messages by status
  getMessagesByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const messages = contactService.getMessagesByStatus(status);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }

  // Get message by ID
  getMessageById(req, res, next) {
    try {
      const { id } = req.params;
      const message = contactService.getMessageById(id);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  // Respond to message
  async respondToMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { response } = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const message = contactService.getMessageById(id);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      // Send email response
      await emailService.sendContactResponse(message, response, userId, requestInfo);

      // Mark as responded
      const updatedMessage = contactService.markAsResponded(id, userId, response, requestInfo);

      res.json({
        success: true,
        message: 'Response sent successfully',
        data: updatedMessage
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Archive message
  archiveMessage(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const message = contactService.archiveMessage(id, userId, requestInfo);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      res.json({
        success: true,
        message: 'Message archived successfully',
        data: message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete message
  deleteMessage(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = contactService.deleteMessage(id, userId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ContactAdminController();

