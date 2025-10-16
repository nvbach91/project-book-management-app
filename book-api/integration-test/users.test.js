const request = require('supertest');
const app = require('../servers/index');

describe('GET /users', () => {
  test('should get all users', async () => {
    const response = await request(app)
      .get('/api/v1/users');
    expect(response.statusCode).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  });

  test('should get user by id', async () => {
    const response = await request(app)
      .get('/api/v1/users/2'); //Change to your existing id in database 
    expect(response.statusCode).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  });
});

describe('POST /users', () => {
  test('should create a new user', async () => {
    const randomEmail = `test${Date.now()}@gmail.com`;
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        display_name: 'test',
        email: randomEmail,
        password: 'test123456'
      })
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(201)
    expect(response.body.message).toBe('User created')
    expect(response.body.userId).toBeDefined()
    expect(response.body.userId).toBeGreaterThan(0)
  });
});

describe('PUT /users/:id', () => {
  test('should update the user display_name', async () => {
    const userId = 4; //Change to your existing id in database 
    const newName = 'Updated Name';
    const response = await request(app)
      .put(`/api/v1/users/${userId}`)
      .send({ display_name: newName })
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'User updated');
  })
});

describe('DELETE /users', () => {
  test('should delete user by id', async () => {
    const response = await request(app)
      .delete('/api/v1/users/19'); //Change to your existing id in database 
    expect(response.statusCode).toBe(200);
  });
});