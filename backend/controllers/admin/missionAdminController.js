const missionService = require('../../services/missionService');
const subEventService = require('../../services/subEventService');
const interestService = require('../../services/interestService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class MissionAdminController {
  // Get all missions
  getAllMissions(req, res, next) {
    try {
      const missions = missionService.getAllMissions(req.user.userId);

      res.json({
        success: true,
        data: missions
      });
    } catch (error) {
      next(error);
    }
  }

  // Get mission by ID
  getMissionById(req, res, next) {
    try {
      const { id } = req.params;
      const mission = missionService.getMissionById(id);

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

  // Create mission
  createMission(req, res, next) {
    try {
      const missionData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const mission = missionService.createMission(missionData, userId, requestInfo);

      res.status(201).json({
        success: true,
        message: 'Mission created successfully',
        data: mission
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update mission
  updateMission(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const mission = missionService.updateMission(id, updateData, userId, requestInfo);

      if (!mission) {
        return res.status(404).json({
          success: false,
          message: 'Mission not found'
        });
      }

      res.json({
        success: true,
        message: 'Mission updated successfully',
        data: mission
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete mission
  deleteMission(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = missionService.deleteMission(id, userId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Mission not found'
        });
      }

      res.json({
        success: true,
        message: 'Mission deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Publish mission
  publishMission(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const mission = missionService.publishMission(id, userId, requestInfo);

      res.json({
        success: true,
        message: 'Mission published successfully',
        data: mission
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get mission interests
  getMissionInterests(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const interests = interestService.getMissionInterests(id, userId);

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

module.exports = new MissionAdminController();

