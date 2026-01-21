const express = require('express');
const router = express.Router();
const publicController = require('../controllers/portal/publicController');
const missionController = require('../controllers/portal/missionController');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');

// Homepage content
router.get('/homepage', publicController.getHomepageContent);

// Board members
router.get('/board-members', publicController.getBoardMembers);

// Public notices
router.get('/notices', publicController.getPublishedNotices);

// Missions
router.get('/missions', missionController.getPublishedMissions);
router.get('/missions/upcoming', missionController.getUpcomingMissions);
router.get('/missions/:slug', missionController.getMissionBySlug);

// Contact form
router.post('/contact', validationRules.createContact, handleValidationErrors, publicController.submitContactMessage);

module.exports = router;

