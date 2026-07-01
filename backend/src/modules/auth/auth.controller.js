const authService = require('./auth.service');
const catchAsync = require('../../utils/catchAsync');

exports.register = catchAsync(async (req, res, next) => {
  const result = await authService.register(req.body);
  
  res.status(201).json({
    status: 'success',
    data: result
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);

  res.status(200).json({
    status: 'success',
    data: result
  });
});
