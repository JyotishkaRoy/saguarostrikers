const express = require('express');
const router = express.Router();
const contactAdminController = require('../../controllers/admin/contactAdminController');
const { isAdmin } = require('../../middleware/authMiddleware');

// All routes require admin authentication
router.use(isAdmin);

// Contact messages
router.get('/messages', contactAdminController.getAllMessages);
router.get('/messages/status/:status', contactAdminController.getMessagesByStatus);
router.get('/messages/:id', contactAdminController.getMessageById);
router.post('/messages/:id/respond', contactAdminController.respondToMessage);
router.patch('/messages/:id/archive', contactAdminController.archiveMessage);
router.delete('/messages/:id', contactAdminController.deleteMessage);

module.exports = router;

