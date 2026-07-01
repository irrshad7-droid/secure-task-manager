const express = require('express');
const { validationResult } = require('express-validator');
const taskController = require('./task.controller');
const taskValidation = require('./task.validation');
const { protect } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

// Validation middleware is imported from global middlewares

// All task routes require authentication
router.use(protect);

router
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskValidation.createTaskValidation, validate, taskController.createTask);

router
  .route('/:id')
  .get(taskValidation.taskIdValidation, validate, taskController.getTask)
  .put(taskValidation.updateTaskValidation, validate, taskController.updateTask)
  .delete(taskValidation.taskIdValidation, validate, taskController.deleteTask);

module.exports = router;
