const express = require('express');
const router = express.Router();
const authController = require('../controllers/portal/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', validationRules.register, handleValidationErrors, authController.register);
router.post('/login', validationRules.login, handleValidationErrors, authController.login);

// Protected routes
router.get('/profile', isAuthenticated, authController.getProfile);
router.post('/change-password', isAuthenticated, authController.changePassword);

module.exports = router;

