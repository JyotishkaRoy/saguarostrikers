const siteContentService = require('../../services/siteContentService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class SiteContentAdminController {
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

  // Update homepage content
  updateHomepageContent(req, res, next) {
    try {
      const updateData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const content = siteContentService.updateHomepageContent(updateData, userId, requestInfo);

      res.json({
        success: true,
        message: 'Homepage content updated successfully',
        data: content
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add hero image
  addHeroImage(req, res, next) {
    try {
      const { imageUrl } = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const content = siteContentService.addHeroImage(imageUrl, userId, requestInfo);

      res.json({
        success: true,
        message: 'Hero image added successfully',
        data: content
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove hero image
  removeHeroImage(req, res, next) {
    try {
      const { imageUrl } = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const content = siteContentService.removeHeroImage(imageUrl, userId, requestInfo);

      res.json({
        success: true,
        message: 'Hero image removed successfully',
        data: content
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Board Members Management
  getAllBoardMembers(req, res, next) {
    try {
      const members = siteContentService.getAllBoardMembers();

      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      next(error);
    }
  }

  createBoardMember(req, res, next) {
    try {
      const memberData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const member = siteContentService.createBoardMember(memberData, userId, requestInfo);

      res.status(201).json({
        success: true,
        message: 'Board member created successfully',
        data: member
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  updateBoardMember(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const member = siteContentService.updateBoardMember(id, updateData, userId, requestInfo);

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Board member not found'
        });
      }

      res.json({
        success: true,
        message: 'Board member updated successfully',
        data: member
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  deleteBoardMember(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = siteContentService.deleteBoardMember(id, userId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Board member not found'
        });
      }

      res.json({
        success: true,
        message: 'Board member deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SiteContentAdminController();

