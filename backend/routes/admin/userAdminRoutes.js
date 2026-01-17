const express = require('express');
const router = express.Router();
const userAdminController = require('../../controllers/admin/userAdminController');
const { isAdmin } = require('../../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../../middleware/validationMiddleware');

// All routes require admin authentication
router.use(isAdmin);

// Users
router.get('/users', userAdminController.getAllUsers);
router.get('/users/:id', userAdminController.getUserById);
router.post('/users', validationRules.createUser, handleValidationErrors, userAdminController.createUser);
router.put('/users/:id', validationRules.updateUser, handleValidationErrors, userAdminController.updateUser);
router.delete('/users/:id', userAdminController.deleteUser);
router.patch('/users/:id/status', userAdminController.updateUserStatus);

module.exports = router;

