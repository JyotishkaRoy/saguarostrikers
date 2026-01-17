const express = require('express');
const router = express.Router();
const publicController = require('../controllers/portal/publicController');
const competitionController = require('../controllers/portal/competitionController');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');

// Homepage content
router.get('/homepage', publicController.getHomepageContent);

// Board members
router.get('/board-members', publicController.getBoardMembers);

// Public notices
router.get('/notices', publicController.getPublishedNotices);

// Competitions
router.get('/competitions', competitionController.getPublishedCompetitions);
router.get('/competitions/upcoming', competitionController.getUpcomingCompetitions);
router.get('/competitions/:slug', competitionController.getCompetitionBySlug);

// Contact form
router.post('/contact', validationRules.createContact, handleValidationErrors, publicController.submitContactMessage);

module.exports = router;

