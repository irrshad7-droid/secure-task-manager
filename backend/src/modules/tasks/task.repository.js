const Task = require('./task.model');

class TaskRepository {
  async create(data) {
    return await Task.create(data);
  }

  async findById(id) {
    return await Task.findById(id);
  }

  async findAll(query, options = {}) {
    const { sort, skip, limit } = options;
    let mQuery = Task.find(query);
    
    if (sort) mQuery = mQuery.sort(sort);
    if (skip !== undefined) mQuery = mQuery.skip(skip);
    if (limit !== undefined) mQuery = mQuery.limit(limit);
    
    return await mQuery;
  }

  async findByIdAndUpdate(id, data) {
    return await Task.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await Task.findByIdAndDelete(id);
  }

  async countDocuments(query) {
    return await Task.countDocuments(query);
  }
}

module.exports = new TaskRepository();
