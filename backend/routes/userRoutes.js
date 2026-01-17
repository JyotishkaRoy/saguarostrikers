const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/portal/competitionController');
const fileController = require('../controllers/portal/fileController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');

// User interests
router.post('/interests', isAuthenticated, validationRules.showInterest, handleValidationErrors, competitionController.showInterest);
router.get('/interests', isAuthenticated, competitionController.getUserInterests);

// User teams
router.get('/teams', isAuthenticated, competitionController.getUserTeams);

// Files and galleries (for user's competitions)
router.get('/competitions/:competitionId/files', isAuthenticated, fileController.getFilesByCompetition);
router.get('/competitions/:competitionId/gallery', isAuthenticated, fileController.getGalleryByCompetition);
router.get('/sub-events/:subEventId/files', isAuthenticated, fileController.getFilesBySubEvent);
router.get('/sub-events/:subEventId/gallery', isAuthenticated, fileController.getGalleryBySubEvent);
router.get('/files/:fileId/download', isAuthenticated, fileController.downloadFile);

module.exports = router;

