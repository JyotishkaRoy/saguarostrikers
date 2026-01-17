const authService = require('../../services/authService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      const requestInfo = getRequestInfo(req);

      const user = await authService.register(
        { email, password, firstName, lastName, phone },
        requestInfo
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const requestInfo = getRequestInfo(req);

      const result = await authService.login(email, password, requestInfo);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const result = await authService.changePassword(userId, oldPassword, newPassword, requestInfo);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProfile(req, res, next) {
    try {
      const userService = require('../../services/userService');
      const user = userService.getUserById(req.user.userId);

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
}

module.exports = new AuthController();

