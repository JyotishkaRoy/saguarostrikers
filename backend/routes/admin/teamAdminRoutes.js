const express = require('express');
const router = express.Router();
const teamAdminController = require('../../controllers/admin/teamAdminController');
const { isAdmin } = require('../../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../../middleware/validationMiddleware');

// All routes require admin authentication
router.use(isAdmin);

// Teams
router.post('/teams', validationRules.createTeam, handleValidationErrors, teamAdminController.createTeam);
router.get('/teams/:id', teamAdminController.getTeamById);
router.put('/teams/:id', teamAdminController.updateTeam);
router.delete('/teams/:id', teamAdminController.deleteTeam);
router.get('/competitions/:competitionId/teams', teamAdminController.getTeamsByCompetition);

// Team members
router.post('/teams/:teamId/members', validationRules.addTeamMember, handleValidationErrors, teamAdminController.addTeamMember);
router.delete('/members/:memberId', teamAdminController.removeTeamMember);
router.put('/members/:memberId/role', teamAdminController.updateMemberRole);

// Send email to team
router.post('/teams/:teamId/send-email', teamAdminController.sendTeamEmail);

module.exports = router;

