const { body, param, query } = require('express-validator');

exports.createTaskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 100 }).withMessage('Max length is 100 characters'),
  body('description').optional().trim(),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format')
];

exports.updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID format'),
  body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty').isLength({ max: 100 }).withMessage('Max length is 100 characters'),
  body('description').optional().trim(),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format')
];

exports.taskIdValidation = [
  param('id').isMongoId().withMessage('Invalid task ID format')
];

// Optional: query validation for get all tasks
