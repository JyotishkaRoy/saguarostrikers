const express = require('express');
const router = express.Router();
const missionAdminController = require('../../controllers/admin/missionAdminController');
const { isAdmin } = require('../../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../../middleware/validationMiddleware');

// All routes require admin authentication
router.use(isAdmin);

// Missions
router.get('/missions', missionAdminController.getAllMissions);
router.get('/missions/:id', missionAdminController.getMissionById);
router.post('/missions', validationRules.createMission, handleValidationErrors, missionAdminController.createMission);
router.put('/missions/:id', validationRules.updateMission, handleValidationErrors, missionAdminController.updateMission);
router.delete('/missions/:id', missionAdminController.deleteMission);
router.post('/missions/:id/publish', missionAdminController.publishMission);

// Mission interests
router.get('/missions/:id/interests', missionAdminController.getMissionInterests);

// Sub-events
router.post('/sub-events', validationRules.createSubEvent, handleValidationErrors, missionAdminController.createSubEvent);
router.put('/sub-events/:id', missionAdminController.updateSubEvent);
router.delete('/sub-events/:id', missionAdminController.deleteSubEvent);

module.exports = router;

