const taskService = require('./task.service');
const catchAsync = require('../../utils/catchAsync');

exports.createTask = catchAsync(async (req, res, next) => {
  const task = await taskService.createTask(req.body, req.user._id);

  res.status(201).json({
    status: 'success',
    data: { task }
  });
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const result = await taskService.getAllTasks(req.user, req.query);

  res.status(200).json({
    status: 'success',
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit
    },
    data: {
      tasks: result.tasks
    }
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const task = await taskService.getTaskById(req.params.id, req.user);

  res.status(200).json({
    status: 'success',
    data: { task }
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user);

  res.status(200).json({
    status: 'success',
    data: { task }
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  await taskService.deleteTask(req.params.id, req.user);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
