const userService = require('../../services/userService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class UserAdminController {
  // Get all users
  getAllUsers(req, res, next) {
    try {
      const requestingUserId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const users = userService.getAllUsers(requestingUserId, requestInfo);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Create user
  async createUser(req, res, next) {
    try {
      const userData = req.body;
      const requestingUserId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const user = await userService.createUser(userData, requestingUserId, requestInfo);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const requestingUserId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const user = await userService.updateUser(id, updateData, requestingUserId, requestInfo);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete user
  deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = userService.deleteUser(id, requestingUserId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user status (activate/deactivate)
  updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const requestingUserId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const user = userService.updateUserStatus(id, status, requestingUserId, requestInfo);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserAdminController();

