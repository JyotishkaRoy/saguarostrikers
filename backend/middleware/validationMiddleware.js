const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

// Validation rules for different entities
const validationRules = {
  // User validations
  register: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
  ],

  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],

  createUser: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role')
  ],

  updateUser: [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
  ],

  // Competition validations
  createCompetition: [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('status').optional().isIn(['draft', 'published', 'completed', 'cancelled']).withMessage('Invalid status')
  ],

  updateCompetition: [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('status').optional().isIn(['draft', 'published', 'completed', 'cancelled']).withMessage('Invalid status')
  ],

  // Sub-event validations
  createSubEvent: [
    body('competitionId').notEmpty().withMessage('Competition ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('eventDate').isISO8601().withMessage('Valid event date is required')
  ],

  // Team validations
  createTeam: [
    body('competitionId').notEmpty().withMessage('Competition ID is required'),
    body('teamName').notEmpty().withMessage('Team name is required'),
    body('description').optional()
  ],

  addTeamMember: [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('role').optional().notEmpty().withMessage('Role cannot be empty')
  ],

  // Notice validations
  createNotice: [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('type').isIn(['general', 'competition']).withMessage('Invalid notice type'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
  ],

  // Contact message validation
  createContact: [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required')
  ],

  // Board member validation
  createBoardMember: [
    body('name').notEmpty().withMessage('Name is required'),
    body('position').notEmpty().withMessage('Position is required'),
    body('bio').notEmpty().withMessage('Bio is required'),
    body('order').optional().isInt().withMessage('Order must be a number')
  ],

  // Interest validation
  showInterest: [
    body('competitionId').notEmpty().withMessage('Competition ID is required'),
    body('message').optional()
  ]
};

module.exports = {
  validationRules,
  handleValidationErrors
};

