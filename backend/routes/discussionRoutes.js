const express = require('express');
const router = express.Router();
const controller = require('../controllers/portal/discussionController');
const { authenticate } = require('../middleware/authMiddleware');

// Public routes
router.get('/', controller.getAllThreads.bind(controller));
router.get('/search', controller.searchThreads.bind(controller));
router.get('/:id', controller.getThread.bind(controller));

// Authenticated routes
router.post('/:id/replies', authenticate, controller.addReply.bind(controller));

module.exports = router;
