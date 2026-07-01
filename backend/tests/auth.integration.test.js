const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');

describe('Auth Integration Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.name).toBe(testUser.name);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should prevent privilege escalation (cannot register as ADMIN)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, role: 'ADMIN' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.user.role).toBe('USER');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('should login an existing user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Incorrect email or password');
    });
  });

  describe('Protected Routes', () => {
    it('should return 401 Unauthorized when no token is provided', async () => {
      const res = await request(app).get('/api/v1/tasks');
      expect(res.statusCode).toBe(401);
    });
  });
});
