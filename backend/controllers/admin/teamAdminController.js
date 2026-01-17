const teamService = require('../../services/teamService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class TeamAdminController {
  // Create team
  createTeam(req, res, next) {
    try {
      const teamData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const team = teamService.createTeam(teamData, userId, requestInfo);

      res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: team
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update team
  updateTeam(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const team = teamService.updateTeam(id, updateData, userId, requestInfo);

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      res.json({
        success: true,
        message: 'Team updated successfully',
        data: team
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete team
  deleteTeam(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = teamService.deleteTeam(id, userId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      res.json({
        success: true,
        message: 'Team deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get team by ID
  getTeamById(req, res, next) {
    try {
      const { id } = req.params;
      const team = teamService.getTeamById(id);

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      res.json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  // Get teams by competition
  getTeamsByCompetition(req, res, next) {
    try {
      const { competitionId } = req.params;
      const teams = teamService.getTeamsByCompetition(competitionId);

      res.json({
        success: true,
        data: teams
      });
    } catch (error) {
      next(error);
    }
  }

  // Add team member
  addTeamMember(req, res, next) {
    try {
      const { teamId } = req.params;
      const { userId: userIdToAdd, role } = req.body;
      const requestingUserId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const member = teamService.addTeamMember(teamId, userIdToAdd, role, requestingUserId, requestInfo);

      res.status(201).json({
        success: true,
        message: 'Team member added successfully',
        data: member
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove team member
  removeTeamMember(req, res, next) {
    try {
      const { memberId } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = teamService.removeTeamMember(memberId, userId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Team member not found'
        });
      }

      res.json({
        success: true,
        message: 'Team member removed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update team member role
  updateMemberRole(req, res, next) {
    try {
      const { memberId } = req.params;
      const { role } = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const member = teamService.updateTeamMemberRole(memberId, role, userId, requestInfo);

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Team member not found'
        });
      }

      res.json({
        success: true,
        message: 'Member role updated successfully',
        data: member
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Send email to team
  async sendTeamEmail(req, res, next) {
    try {
      const { teamId } = req.params;
      const { subject, message } = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const team = teamService.getTeamById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      const emailService = require('../../services/emailService');
      await emailService.sendTeamEmail(team.members, subject, message, userId, requestInfo);

      res.json({
        success: true,
        message: 'Email sent to team members successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TeamAdminController();

