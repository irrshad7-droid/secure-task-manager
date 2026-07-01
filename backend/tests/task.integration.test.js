const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const Task = require('../src/modules/tasks/task.model');

describe('Task Integration Tests', () => {
  let user1Token, user2Token, adminToken;
  let user1, user2, adminUser;

  beforeEach(async () => {
    // Register User 1
    const res1 = await request(app).post('/api/v1/auth/register').send({
      name: 'User 1', email: 'user1@example.com', password: 'password123'
    });
    user1Token = res1.body.data.accessToken;
    user1 = res1.body.data.user;

    // Register User 2
    const res2 = await request(app).post('/api/v1/auth/register').send({
      name: 'User 2', email: 'user2@example.com', password: 'password123'
    });
    user2Token = res2.body.data.accessToken;
    user2 = res2.body.data.user;

    // Create Admin directly via DB (since API prevents it)
    adminUser = await User.create({
      name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'ADMIN'
    });
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com', password: 'password123'
    });
    adminToken = loginRes.body.data.accessToken;
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a task for the authenticated user', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Task 1', description: 'Description 1' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.task.title).toBe('Task 1');
      expect(res.body.data.task.owner.toString()).toBe(user1._id.toString());
    });
  });

  describe('Task Boundaries and Authorization', () => {
    let task1Id;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'User 1 Task' });
      task1Id = res.body.data.task._id;
    });

    it('should not allow user 2 to modify user 1 task', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hacked Title' });

      expect(res.statusCode).toBe(403);
    });

    it('should not allow user 2 to view user 1 task', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(403);
    });

    it('should allow ADMIN to view user 1 task', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.task.title).toBe('User 1 Task');
    });

    it('should allow ADMIN to update user 1 task', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Edited' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.task.title).toBe('Admin Edited');
    });
  });
});
