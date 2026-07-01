const express = require('express');
const { validationResult } = require('express-validator');
const authController = require('./auth.controller');
const authValidation = require('./auth.validation');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

// Centralized validate middleware used in routes below

router.post(
  '/register',
  authValidation.registerValidation,
  validate,
  authController.register
);

router.post(
  '/login',
  authValidation.loginValidation,
  validate,
  authController.login
);

router.post(
  '/refresh',
  authController.refreshToken
);

module.exports = router;
