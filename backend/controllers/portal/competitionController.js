const competitionService = require('../../services/competitionService');
const interestService = require('../../services/interestService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class CompetitionController {
  // Get all published competitions (public)
  getPublishedCompetitions(req, res, next) {
    try {
      const competitions = competitionService.getPublishedCompetitions();

      res.json({
        success: true,
        data: competitions
      });
    } catch (error) {
      next(error);
    }
  }

  // Get upcoming competitions (public)
  getUpcomingCompetitions(req, res, next) {
    try {
      const competitions = competitionService.getUpcomingCompetitions();

      res.json({
        success: true,
        data: competitions
      });
    } catch (error) {
      next(error);
    }
  }

  // Get competition by slug (public)
  getCompetitionBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const competition = competitionService.getCompetitionBySlug(slug);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: 'Competition not found'
        });
      }

      res.json({
        success: true,
        data: competition
      });
    } catch (error) {
      next(error);
    }
  }

  // Show interest in competition (authenticated user)
  async showInterest(req, res, next) {
    try {
      const { competitionId, message } = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const interest = interestService.showInterest(userId, competitionId, message, requestInfo);

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

module.exports = new CompetitionController();

