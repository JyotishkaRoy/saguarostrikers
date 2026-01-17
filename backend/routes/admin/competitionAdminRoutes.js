const express = require('express');
const router = express.Router();
const competitionAdminController = require('../../controllers/admin/competitionAdminController');
const { isAdmin } = require('../../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../../middleware/validationMiddleware');

// All routes require admin authentication
router.use(isAdmin);

// Competitions
router.get('/competitions', competitionAdminController.getAllCompetitions);
router.get('/competitions/:id', competitionAdminController.getCompetitionById);
router.post('/competitions', validationRules.createCompetition, handleValidationErrors, competitionAdminController.createCompetition);
router.put('/competitions/:id', validationRules.updateCompetition, handleValidationErrors, competitionAdminController.updateCompetition);
router.delete('/competitions/:id', competitionAdminController.deleteCompetition);
router.post('/competitions/:id/publish', competitionAdminController.publishCompetition);

// Competition interests
router.get('/competitions/:id/interests', competitionAdminController.getCompetitionInterests);

// Sub-events
router.post('/sub-events', validationRules.createSubEvent, handleValidationErrors, competitionAdminController.createSubEvent);
router.put('/sub-events/:id', competitionAdminController.updateSubEvent);
router.delete('/sub-events/:id', competitionAdminController.deleteSubEvent);

module.exports = router;

