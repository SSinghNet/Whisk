import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { loginTestUser } from './../helpers/auth.js';

describe('Ingredient routes', () => {
  let token;
  let createdIds = [];

  beforeAll(async () => {
    const login = await loginTestUser();
    token = login.token;
  });

  beforeEach(async () => {
    // Only clean up ingredients created by this test suite
    if (createdIds.length) {
      await prisma.ingredient.deleteMany({
        where: { ingredient_id: { in: createdIds } },
      });
    }
    createdIds = [];
  });

  afterEach(async () => {
    for (const id of createdIds) {
      await prisma.ingredient.deleteMany({
        where: { ingredient_id: id },
      });
    }
    createdIds = [];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createIngredient(name = `ingredient-${Date.now()}-${Math.random()}`) {
    const res = await request(app)
      .post('/ingredient')
      .set('Authorization', `Bearer ${token}`)
      .send({ name });

    expect(res.statusCode).toBe(201);

    const id = Number(res.body.ingredient_id);
    createdIds.push(id);

    return res.body;
  }

  describe('POST /ingredient', () => {
    test('creates an ingredient', async () => {
      const res = await request(app)
        .post('/ingredient')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'rice' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('ingredient_id');
      expect(res.body).toHaveProperty('name', 'rice');

      createdIds.push(Number(res.body.ingredient_id));
    });

    test('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/ingredient')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        message: 'Name is required',
      });
    });
  });

  describe('GET /ingredient', () => {
    test('returns empty array when no ingredients exist', async () => {
      const res = await request(app)
        .get('/ingredient')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns all ingredients', async () => {
      await createIngredient('rice');
      await createIngredient('beans');

      const res = await request(app)
        .get('/ingredient')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    test('filters ingredients by search query', async () => {
      await createIngredient('rice');
      await createIngredient('beans');

      const res = await request(app)
        .get('/ingredient')
        .query({ search: 'rice' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name.toLowerCase()).toContain('rice');
    });
  });

  describe('GET /ingredient/:id', () => {
    test('returns one ingredient', async () => {
      const ingredient = await createIngredient('milk');

      const res = await request(app)
        .get(`/ingredient/${ingredient.ingredient_id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Number(res.body.ingredient_id)).toBe(Number(ingredient.ingredient_id));
      expect(res.body).toHaveProperty('name', 'milk');
    });

    test('returns 404 when ingredient not found', async () => {
      const res = await request(app)
        .get('/ingredient/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        message: 'Ingredient not found',
      });
    });
  });

  describe('PATCH /ingredient/:id', () => {
    test('updates an ingredient name', async () => {
      const ingredient = await createIngredient('milk');

      const res = await request(app)
        .patch(`/ingredient/${ingredient.ingredient_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'almond milk' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'almond milk');
    });

    test('returns 400 when name is missing', async () => {
      const ingredient = await createIngredient('milk');

      const res = await request(app)
        .patch(`/ingredient/${ingredient.ingredient_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        message: 'Name is required',
      });
    });

    test('returns 404 when ingredient does not exist', async () => {
      const res = await request(app)
        .patch('/ingredient/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'test' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        message: 'Ingredient not found',
      });
    });
  });

  describe('DELETE /ingredient/:id', () => {
    test('deletes an ingredient', async () => {
      const ingredient = await createIngredient('milk');

      const res = await request(app)
        .delete(`/ingredient/${ingredient.ingredient_id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(204);

      const getRes = await request(app)
        .get(`/ingredient/${ingredient.ingredient_id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.statusCode).toBe(404);
    });

    test('returns 404 when deleting non-existent ingredient', async () => {
      const res = await request(app)
        .delete('/ingredient/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        message: 'Ingredient not found',
      });
    });
  });
});