const express = require('express');
const router = express.Router();
const siteContentAdminController = require('../../controllers/admin/siteContentAdminController');
const { isAdmin } = require('../../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../../middleware/validationMiddleware');

// All routes require admin authentication
router.use(isAdmin);

// Homepage content
router.get('/homepage', siteContentAdminController.getHomepageContent);
router.put('/homepage', siteContentAdminController.updateHomepageContent);
router.post('/homepage/hero-images', siteContentAdminController.addHeroImage);
router.delete('/homepage/hero-images', siteContentAdminController.removeHeroImage);

// Board members
router.get('/board-members', siteContentAdminController.getAllBoardMembers);
router.post('/board-members', validationRules.createBoardMember, handleValidationErrors, siteContentAdminController.createBoardMember);
router.put('/board-members/:id', siteContentAdminController.updateBoardMember);
router.delete('/board-members/:id', siteContentAdminController.deleteBoardMember);

module.exports = router;

