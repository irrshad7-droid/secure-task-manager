const taskRepository = require('./task.repository');
const AppError = require('../../utils/AppError');

class TaskService {
  async createTask(data, userId) {
    const taskData = { ...data, owner: userId };
    return await taskRepository.create(taskData);
  }

  async getTaskById(taskId, user) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    // Authorization check
    if (task.owner.toString() !== user._id.toString() && user.role !== 'ADMIN') {
      throw new AppError('You do not have permission to access this task', 403);
    }

    return task;
  }

  async getAllTasks(user, queryParams) {
    // Build basic query
    let queryObj = { ...queryParams };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // If not admin, can only see own tasks
    if (user.role !== 'ADMIN') {
      queryObj.owner = user._id;
    }

    // Text Search
    if (queryParams.search) {
      queryObj.$text = { $search: queryParams.search };
    }

    // Sorting
    let sort = '-createdAt';
    if (queryParams.sort) {
      sort = queryParams.sort.split(',').join(' ');
    }

    // Pagination
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const tasks = await taskRepository.findAll(queryObj, { sort, skip, limit });
    const total = await taskRepository.countDocuments(queryObj);

    return { tasks, total, page, limit };
  }

  async updateTask(taskId, updateData, user) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    if (task.owner.toString() !== user._id.toString() && user.role !== 'ADMIN') {
      throw new AppError('You do not have permission to update this task', 403);
    }

    // Prevent ownership transfer
    delete updateData.owner;

    return await taskRepository.findByIdAndUpdate(taskId, updateData);
  }

  async deleteTask(taskId, user) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    if (task.owner.toString() !== user._id.toString() && user.role !== 'ADMIN') {
      throw new AppError('You do not have permission to delete this task', 403);
    }

    await taskRepository.delete(taskId);
    return null;
  }
}

module.exports = new TaskService();
