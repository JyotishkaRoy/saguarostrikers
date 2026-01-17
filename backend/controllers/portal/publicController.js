const siteContentService = require('../../services/siteContentService');
const noticeService = require('../../services/noticeService');
const contactService = require('../../services/contactService');
const competitionService = require('../../services/competitionService');
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

  // Get published competitions
  getPublishedCompetitions(req, res, next) {
    try {
      const competitions = competitionService.getPublishedCompetitions();

      res.json({
        success: true,
        data: competitions
      });
    } catch (error) {
      next(error);
    }
  }

  // Get competition by slug
  getCompetitionBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const competition = competitionService.getCompetitionBySlug(slug);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: 'Competition not found'
        });
      }

      res.json({
        success: true,
        data: competition
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PublicController();

