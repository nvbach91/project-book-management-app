const request = require('supertest');
const pool = require('../config/db');
const app = require('../servers/index');

describe('User API Integration Tests', () => {
  let createdUserId;
  // Clean up created user after tests
  afterAll(async () => {
    if (createdUserId) {
      await pool.query('DELETE FROM users WHERE user_id = ?', [createdUserId]);
    }
    await pool.end();
  });

  test('GET /users should return all users', async () => {
    const response = await request(app).get('/api/v1/users');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /users/:id should return existing user', async () => {
    const email = `get${Date.now()}@example.com`;
    const createRes = await request(app)
      .post('/api/v1/users')
      .send({
        display_name: 'FetchUser',
        email,
        password: 'test123456'
      });
    const userId = createRes.body.userId;
    const res = await request(app).get(`/api/v1/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('email', email);
    await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
  });

  test('POST /users should create a new user', async () => {
    const randomEmail = `test${Date.now()}@gmail.com`;
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        display_name: 'New User',
        email: randomEmail,
        password: 'test123456'
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBeDefined();
    
    createdUserId = res.body.userId;
    const [rows] = await pool.query('SELECT email, display_name FROM users WHERE user_id = ?', [createdUserId]);
    expect(rows.length).toBe(1);
    expect(rows[0].email).toBe(randomEmail);
    expect(rows[0].display_name).toBe('New User');
  });

  test('PUT /users/:id should update the user', async () => {
    const newName = 'Updated Name';
    const res = await request(app)
      .put(`/api/v1/users/${createdUserId}`)
      .send({ display_name: newName })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User updated');
    const [rows] = await pool.query('SELECT display_name FROM users WHERE user_id = ?', [createdUserId]);
    expect(rows[0].display_name).toBe(newName);
  });

  test('DELETE /users/:id should delete the user', async () => {
    const res = await request(app).delete(`/api/v1/users/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [createdUserId]);
    expect(rows.length).toBe(0);
    createdUserId = null;
  });

  //Negative Tests
  test('GET /users/:id should return 404 if user not found', async () => {
    const res = await request(app).get('/api/v1/users/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  test('POST /users should return 400 if password too short', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ email: 'short@example.com', display_name: 'Short', password: '123' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /users should return 400 if display_name missing', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ email: 'no_display@example.com', password: 'test123456' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/display name/i);
  });

  test('POST /users should return 409 if email already exists', async () => {
    const email = `dup${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/users')
      .send({ display_name: 'DupUser', email, password: 'test123456' });
    const res = await request(app)
      .post('/api/v1/users')
      .send({ display_name: 'DupUser2', email, password: 'test123456' });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Email already exists');
  });

  test('PUT /users/:id should return 404 for non-existing user', async () => {
    const res = await request(app)
      .put('/api/v1/users/999999')
      .send({ display_name: 'No One' });
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /users/:id should return 404 for non-existing user', async () => {
    const res = await request(app).delete('/api/v1/users/999999');
    expect(res.statusCode).toBe(404);
  });

  //Database Error Simulation Tests
  test('GET /users should handle DB error', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn().mockRejectedValueOnce(new Error('Failed to get all users'));
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch('Failed to get all users');
    pool.query = originalQuery;
  });

  test('GET /users should return empty array when no users exist', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn().mockResolvedValueOnce([[], []]);
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);

    pool.query = originalQuery;
  });

  test('GET /users/:id should handle DB error', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn().mockRejectedValueOnce(new Error('Failed to get user by ID'));
    const res = await request(app).get('/api/v1/users/123');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch('Failed to get user by ID');
    pool.query = originalQuery;
  });

  test('POST /users should handle unexpected DB error', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn().mockRejectedValueOnce(new Error('Insert failed'));
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        display_name: 'Error User',
        email: `dberror${Date.now()}@example.com`,
        password: 'test123456'
      });
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch('Insert failed');
    pool.query = originalQuery;
  });

  test('PUT /users/:id should handle DB error', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn().mockRejectedValueOnce(new Error('Update failed'));
    const res = await request(app)
      .put('/api/v1/users/1')
      .send({ display_name: 'Error Test' });
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch('Update failed');
    pool.query = originalQuery;
  });

  test('DELETE /users/:id should handle DB error', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn().mockRejectedValueOnce(new Error('Delete failed'));
    const res = await request(app).delete('/api/v1/users/1');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch('Delete failed');
    pool.query = originalQuery;
  });
});
