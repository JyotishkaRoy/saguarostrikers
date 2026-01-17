const competitionService = require('../../services/competitionService');
const subEventService = require('../../services/subEventService');
const interestService = require('../../services/interestService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class CompetitionAdminController {
  // Get all competitions
  getAllCompetitions(req, res, next) {
    try {
      const competitions = competitionService.getAllCompetitions(req.user.userId);

      res.json({
        success: true,
        data: competitions
      });
    } catch (error) {
      next(error);
    }
  }

  // Get competition by ID
  getCompetitionById(req, res, next) {
    try {
      const { id } = req.params;
      const competition = competitionService.getCompetitionById(id);

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

  // Create competition
  createCompetition(req, res, next) {
    try {
      const competitionData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const competition = competitionService.createCompetition(competitionData, userId, requestInfo);

      res.status(201).json({
        success: true,
        message: 'Competition created successfully',
        data: competition
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update competition
  updateCompetition(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const competition = competitionService.updateCompetition(id, updateData, userId, requestInfo);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: 'Competition not found'
        });
      }

      res.json({
        success: true,
        message: 'Competition updated successfully',
        data: competition
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete competition
  deleteCompetition(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = competitionService.deleteCompetition(id, userId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Competition not found'
        });
      }

      res.json({
        success: true,
        message: 'Competition deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Publish competition
  publishCompetition(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const competition = competitionService.publishCompetition(id, userId, requestInfo);

      res.json({
        success: true,
        message: 'Competition published successfully',
        data: competition
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get competition interests
  getCompetitionInterests(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const interests = interestService.getCompetitionInterests(id, userId);

      res.json({
        success: true,
        data: interests
      });
    } catch (error) {
      next(error);
    }
  }

  // Create sub-event
  createSubEvent(req, res, next) {
    try {
      const subEventData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const subEvent = subEventService.createSubEvent(subEventData, userId, requestInfo);

      res.status(201).json({
        success: true,
        message: 'Sub-event created successfully',
        data: subEvent
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update sub-event
  updateSubEvent(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const subEvent = subEventService.updateSubEvent(id, updateData, userId, requestInfo);

      if (!subEvent) {
        return res.status(404).json({
          success: false,
          message: 'Sub-event not found'
        });
      }

      res.json({
        success: true,
        message: 'Sub-event updated successfully',
        data: subEvent
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete sub-event
  deleteSubEvent(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = subEventService.deleteSubEvent(id, userId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Sub-event not found'
        });
      }

      res.json({
        success: true,
        message: 'Sub-event deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CompetitionAdminController();

