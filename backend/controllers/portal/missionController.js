const missionService = require('../../services/missionService');
const interestService = require('../../services/interestService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class MissionController {
  // Get all published missions (public)
  getPublishedMissions(req, res, next) {
    try {
      const missions = missionService.getPublishedMissions();

      res.json({
        success: true,
        data: missions
      });
    } catch (error) {
      next(error);
    }
  }

  // Get upcoming missions (public)
  getUpcomingMissions(req, res, next) {
    try {
      const missions = missionService.getUpcomingMissions();

      res.json({
        success: true,
        data: missions
      });
    } catch (error) {
      next(error);
    }
  }

  // Get mission by slug (public)
  getMissionBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const mission = missionService.getMissionBySlug(slug);

      if (!mission) {
        return res.status(404).json({
          success: false,
          message: 'Mission not found'
        });
      }

      res.json({
        success: true,
        data: mission
      });
    } catch (error) {
      next(error);
    }
  }

  // Show interest in mission (authenticated user)
  async showInterest(req, res, next) {
    try {
      const { missionId, message } = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const interest = interestService.showInterest(userId, missionId, message, requestInfo);

      res.status(201).json({
        success: true,
        message: 'Interest registered successfully',
        data: interest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user's interests (authenticated user)
  getUserInterests(req, res, next) {
    try {
      const userId = req.user.userId;
      const interests = interestService.getUserInterests(userId);

      res.json({
        success: true,
        data: interests
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's teams (authenticated user)
  getUserTeams(req, res, next) {
    try {
      const userId = req.user.userId;
      const teamService = require('../../services/teamService');
      const teams = teamService.getUserTeams(userId);

      res.json({
        success: true,
        data: teams
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MissionController();

