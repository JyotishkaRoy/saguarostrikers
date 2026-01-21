const express = require('express');
const router = express.Router();
const missionController = require('../controllers/portal/missionController');
const fileController = require('../controllers/portal/fileController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');

// User interests
router.post('/interests', isAuthenticated, validationRules.showInterest, handleValidationErrors, missionController.showInterest);
router.get('/interests', isAuthenticated, missionController.getUserInterests);

// User teams
router.get('/teams', isAuthenticated, missionController.getUserTeams);

// Files and galleries (for user's missions)
router.get('/missions/:missionId/files', isAuthenticated, fileController.getFilesByMission);
router.get('/missions/:missionId/gallery', isAuthenticated, fileController.getGalleryByMission);
router.get('/sub-events/:subEventId/files', isAuthenticated, fileController.getFilesBySubEvent);
router.get('/sub-events/:subEventId/gallery', isAuthenticated, fileController.getGalleryBySubEvent);
router.get('/files/:fileId/download', isAuthenticated, fileController.downloadFile);

module.exports = router;

