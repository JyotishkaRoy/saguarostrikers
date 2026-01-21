const siteContentService = require('../../services/siteContentService');
const noticeService = require('../../services/noticeService');
const contactService = require('../../services/contactService');
const missionService = require('../../services/missionService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class PublicController {
  // Get homepage content
  getHomepageContent(req, res, next) {
    try {
      const content = siteContentService.getHomepageContent();

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      next(error);
    }
  }

  // Get active board members
  getBoardMembers(req, res, next) {
    try {
      const members = siteContentService.getActiveBoardMembers();

      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      next(error);
    }
  }

  // Get published notices
  getPublishedNotices(req, res, next) {
    try {
      const notices = noticeService.getPublishedGeneralNotices();

      res.json({
        success: true,
        data: notices
      });
    } catch (error) {
      next(error);
    }
  }

  // Submit contact message
  async submitContactMessage(req, res, next) {
    try {
      const { name, email, subject, message } = req.body;
      const requestInfo = getRequestInfo(req);

      const newMessage = contactService.createContactMessage(
        { name, email, subject, message },
        requestInfo
      );

      res.status(201).json({
        success: true,
        message: 'Message sent successfully. We will get back to you soon.',
        data: newMessage
      });
    } catch (error) {
      next(error);
    }
  }

  // Get published missions
  getPublishedMissions(req, res, next) {
    try {
      const missions = missionService.getPublishedMissions();

      res.json({
        success: true,
        data: missions
      });
    } catch (error) {
      next(error);
    }
  }

  // Get mission by slug
  getMissionBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const mission = missionService.getMissionBySlug(slug);

      if (!mission) {
        return res.status(404).json({
          success: false,
          message: 'Mission not found'
        });
      }

      res.json({
        success: true,
        data: mission
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PublicController();

