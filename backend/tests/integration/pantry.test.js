import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { loginTestUser } from './../helpers/auth.js';
import {
  createTestIngredient,
  deleteIngredient,
  deletePantryItem,
} from './../helpers/db.js';

describe('Pantry routes', () => {
  let token;
  let appUser;
  let createdIngredientIds = [];

  beforeAll(async () => {
    const login = await loginTestUser();
    token = login.token;

    const registerRes = await request(app)
      .post('/users/register')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 201, 409]).toContain(registerRes.statusCode);

    const dbUser = await prisma.app_user.findUnique({
      where: { supabase_uid: login.user.id },
    });

    appUser = dbUser;
  });

  beforeEach(async () => {
    // Only clean up pantry items and ingredients belonging to the test user
    await prisma.pantry_ingredient.deleteMany({ where: { user_id: appUser.user_id } });
    await prisma.ingredient.deleteMany({
      where: { ingredient_id: { in: createdIngredientIds } },
    });
    createdIngredientIds = [];
  });

  afterEach(async () => {
    for (const ingredientId of createdIngredientIds) {
      await deletePantryItem(appUser.user_id, ingredientId);
      await deleteIngredient(ingredientId);
    }
    createdIngredientIds = [];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function makeIngredient(name = `ingredient-${Date.now()}-${Math.random()}`) {
    const ingredient = await createTestIngredient(name);
    createdIngredientIds.push(ingredient.ingredient_id);
    return ingredient;
  }

  describe('POST /pantry', () => {
    test('creates a pantry item', async () => {
      const ingredient = await makeIngredient();

      const res = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ingredient_id: Number(ingredient.ingredient_id),
          quantity: 3,
          unit: 'cup',
          expiry_date: '2026-12-31',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.ingredient_id).toBe(Number(ingredient.ingredient_id));
      expect(Number(res.body.quantity)).toBe(3);
      expect(res.body).toHaveProperty('unit', 'cup');
      expect(res.body).toHaveProperty('ingredient');
      expect(res.body.ingredient).toHaveProperty('name', ingredient.name);
    });

    test('returns 400 when ingredient_id is missing', async () => {
      const res = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          quantity: 3,
          unit: 'cup',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        message: 'ingredient_id is required',
      });
    });

    test('returns 409 when ingredient already exists in pantry', async () => {
      const ingredient = await makeIngredient();

      const firstRes = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ingredient_id: Number(ingredient.ingredient_id),
          quantity: 1,
          unit: 'cup',
        });

      expect(firstRes.statusCode).toBe(201);

      const secondRes = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ingredient_id: Number(ingredient.ingredient_id),
          quantity: 2,
          unit: 'cup',
        });

      expect(secondRes.statusCode).toBe(409);
      expect(secondRes.body).toEqual({
        message: 'Ingredient already exists in pantry',
      });
    });
  });

  describe('GET /pantry', () => {
    test('returns empty array when pantry is empty', async () => {
      const res = await request(app)
        .get('/pantry')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns pantry items', async () => {
      const ingredient = await makeIngredient();

      const createRes = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ingredient_id: Number(ingredient.ingredient_id),
          quantity: 2,
          unit: 'count',
        });

      expect(createRes.statusCode).toBe(201);

      const res = await request(app)
        .get('/pantry')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      const found = res.body.find(
        (item) => Number(item.ingredient_id) === Number(ingredient.ingredient_id)
      );

      expect(found).toBeDefined();
      expect(Number(found.quantity)).toBe(2);
      expect(found.unit).toBe('count');
      expect(found.ingredient.name).toBe(ingredient.name);
    });

    test('filters pantry items by search query', async () => {
      const rice = await makeIngredient(`rice-${Date.now()}`);
      const beans = await makeIngredient(`beans-${Date.now()}`);

      const riceCreateRes = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ingredient_id: Number(rice.ingredient_id),
          quantity: 1,
          unit: 'count',
        });

      expect(riceCreateRes.statusCode).toBe(201);

      const beansCreateRes = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ingredient_id: Number(beans.ingredient_id),
          quantity: 1,
          unit: 'count',
        });

      expect(beansCreateRes.statusCode).toBe(201);

      const res = await request(app)
        .get('/pantry')
        .query({ search: 'rice' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].ingredient.name.toLowerCase()).toContain('rice');
    });
  });

  describe('GET /pantry/:id', () => {
    test('returns a single pantry ingredient', async () => {
      const ingredient = await makeIngredient();

      const createRes = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ingredient_id: Number(ingredient.ingredient_id),
          quantity: 5,
          unit: 'cup',
        });

      expect(createRes.statusCode).toBe(201);

      const res = await request(app)
        .get(`/pantry/${Number(ingredient.ingredient_id)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ingredient_id).toBe(Number(ingredient.ingredient_id));
      expect(Number(res.body.quantity)).toBe(5);
      expect(res.body).toHaveProperty('unit', 'cup');
      expect(res.body.ingredient.name).toBe(ingredient.name);
    });

    test('returns 404 when pantry ingredient is not found', async () => {
      const res = await request(app)
        .get('/pantry/999999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        message: 'Pantry ingredient not found',
      });
    });
  });

  describe('PATCH /pantry/:id', () => {
    test('updates pantry ingredient fields', async () => {
      const ingredient = await makeIngredient();

      const createRes = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ingredient_id: Number(ingredient.ingredient_id),
          quantity: 1,
          unit: 'cup',
          expiry_date: '2026-12-31',
        });

      expect(createRes.statusCode).toBe(201);

      const res = await request(app)
        .patch(`/pantry/${Number(ingredient.ingredient_id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          quantity: 10,
          unit: 'count',
          expiry_date: '2027-01-15',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.ingredient_id).toBe(Number(ingredient.ingredient_id));
      expect(Number(res.body.quantity)).toBe(10);
      expect(res.body).toHaveProperty('unit', 'count');
    });

    test('returns 400 when no update fields are provided', async () => {
      const ingredient = await makeIngredient();

      const res = await request(app)
        .patch(`/pantry/${Number(ingredient.ingredient_id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        message: 'At least one field (quantity, unit, expiry_date) is required',
      });
    });

    test('returns 404 when pantry ingredient does not exist', async () => {
      const res = await request(app)
        .patch('/pantry/999999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        message: 'Pantry ingredient not found',
      });
    });
  });

  describe('DELETE /pantry/:id', () => {
    test('deletes a pantry ingredient', async () => {
      const ingredient = await makeIngredient();

      const createRes = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ingredient_id: Number(ingredient.ingredient_id),
          quantity: 4,
          unit: 'count',
        });

      expect(createRes.statusCode).toBe(201);

      const deleteRes = await request(app)
        .delete(`/pantry/${Number(ingredient.ingredient_id)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.statusCode).toBe(204);

      const getRes = await request(app)
        .get(`/pantry/${Number(ingredient.ingredient_id)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.statusCode).toBe(404);
    });

    test('returns 404 when deleting a missing pantry ingredient', async () => {
      const res = await request(app)
        .delete('/pantry/999999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        message: 'Pantry ingredient not found',
      });
    });
  });
});