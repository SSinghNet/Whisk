import request from 'supertest';
import app from '../src/app.js';

describe('GET /', () => {
  test('returns API running message', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: 'Whisk API is running',
    });
  });
});