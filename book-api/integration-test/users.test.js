const request = require('supertest');
const app = require('../servers/index');
const db = require('../config/db');

describe('Users API Integration Tests', () => {
  let createdUserId;
  const randomEmail = `user${Date.now()}@gmail.com`;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        display_name: 'Test User',
        email: randomEmail,
        password: 'password123'
      })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User created');
    expect(res.body).toHaveProperty('userId');
    createdUserId = res.body.userId;
  });

  afterAll(async () => {
    if (createdUserId) {
      const res = await request(app).delete(`/api/v1/users/${createdUserId}`);
      expect([200, 404]).toContain(res.statusCode);
    }
  });

  test('GET /api/v1/users → should return an array of users', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/v1/users/:id → should return a specific user', async () => {
    const res = await request(app).get(`/api/v1/users/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    const user = Array.isArray(res.body) ? res.body[0] : res.body;
    expect(user).toHaveProperty('user_id', createdUserId);
    expect(user).toHaveProperty('email', randomEmail);
    expect(user).toHaveProperty('display_name');
  });

  test('GET /api/v1/users/:id → should return 404 if user not found', async () => {
    const res = await request(app).get('/api/v1/users/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('PUT /api/v1/users/:id → should update user display name', async () => {
    const res = await request(app)
      .put(`/api/v1/users/${createdUserId}`)
      .send({ display_name: 'Updated Test User' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User updated');
  });

  test('PUT /api/v1/users/:id → should return 404 if user not found', async () => {
    const res = await request(app)
      .put('/api/v1/users/999999')
      .send({ display_name: 'Nonexistent' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(404);
  });

  test('POST /api/v1/users → should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        display_name: 'New User',
        email: `new${Date.now()}@mail.com`,
        password: 'password123'
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('userId');
    await request(app).delete(`/api/v1/users/${res.body.userId}`);
  });

  test('POST /api/v1/users → should fail with duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        display_name: 'Dup User',
        email: randomEmail,
        password: 'password123'
      })
      .set('Accept', 'application/json');
    expect([400, 409]).toContain(res.statusCode);
  });

  test('POST /api/v1/users → should fail if password is too short', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        display_name: 'Short Password User',
        email: `shortpass${Date.now()}@mail.com`,
        password: '123' 
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Password must be at least 6 characters long');
  });

  test('POST /api/v1/users → should fail with missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ email: '' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email, display name, and password are required');
  });

  test('DELETE /api/v1/users/:id → should delete the user', async () => {
    const tempRes = await request(app)
      .post('/api/v1/users')
      .send({
        display_name: 'ToDelete',
        email: `delete${Date.now()}@mail.com`,
        password: 'password123'
      })
      .set('Accept', 'application/json');
    const deleteId = tempRes.body.userId;
    const res = await request(app).delete(`/api/v1/users/${deleteId}`);
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/v1/users/:id → should return 404 if user not found', async () => {
    const res = await request(app).delete('/api/v1/users/999999');
    expect(res.statusCode).toBe(404);
  });
});

describe('Users API Database Error Handling', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/v1/users → should return 500 on database error', async () => {
    jest.spyOn(db, 'query').mockRejectedValueOnce(new Error('DB failure'));
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/v1/users/:id → should return 500 on database error', async () => {
    jest.spyOn(db, 'query').mockRejectedValueOnce(new Error('DB crash on getUserById'));
    const res = await request(app).get('/api/v1/users/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'DB crash on getUserById');
  });

  test('POST /api/v1/users → should return 500 on database error', async () => {
    jest.spyOn(db, 'query').mockRejectedValueOnce(new Error('DB insert failed'));
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        display_name: 'Broken',
        email: `broken${Date.now()}@mail.com`,
        password: '123456'
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
  });

  test('PUT /api/v1/users/:id → should return 500 on database error', async () => {
    jest.spyOn(db, 'query').mockRejectedValueOnce(new Error('DB update failed'));
    const res = await request(app)
      .put('/api/v1/users/1')
      .send({ display_name: 'FailUpdate' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
  });

  test('DELETE /api/v1/users/:id → should return 500 on database error', async () => {
    jest.spyOn(db, 'query').mockRejectedValueOnce(new Error('DB delete failed'));
    const res = await request(app).delete('/api/v1/users/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
  });
});
