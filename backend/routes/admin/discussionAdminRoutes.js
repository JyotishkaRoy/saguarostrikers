const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/discussionAdminController');
const { authenticate, authorizeAdmin } = require('../../middleware/authMiddleware');

// All routes require authentication and admin authorization
router.use(authenticate, authorizeAdmin);

// Get all threads (with admin filters)
router.get('/', controller.getAllThreads.bind(controller));

// Get stats
router.get('/stats', controller.getStats.bind(controller));

// Create thread
router.post('/', controller.createThread.bind(controller));

// Update thread
router.put('/:id', controller.updateThread.bind(controller));

// Update thread status
router.patch('/:id/status', controller.updateThreadStatus.bind(controller));

// Delete thread
router.delete('/:id', controller.deleteThread.bind(controller));

// Delete reply
router.delete('/:threadId/replies/:replyId', controller.deleteReply.bind(controller));

module.exports = router;
