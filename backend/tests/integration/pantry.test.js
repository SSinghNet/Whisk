import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { loginTestUser } from './../helpers/auth.js';
import { createTestIngredient } from './../helpers/db.js';

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

    appUser = await prisma.app_user.findUnique({
      where: { supabase_uid: login.user.id },
    });
  });

  afterEach(async () => {
    await prisma.pantry_ingredient.deleteMany({ where: { user_id: appUser.user_id } });
    await prisma.ingredient.deleteMany({
      where: { ingredient_id: { in: createdIngredientIds } },
    });
    createdIngredientIds = [];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function makeIngredient(name = `ingredient-${Date.now()}-${Math.random()}`) {
    const ingredient = await createTestIngredient(name);
    createdIngredientIds.push(Number(ingredient.ingredient_id));
    return ingredient;
  }

  async function makePantryItem(ingredientId, overrides = {}) {
    const res = await request(app)
      .post('/pantry')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ingredient_id: Number(ingredientId),
        quantity: 1,
        unit: 'cup',
        ...overrides,
      });

    expect(res.statusCode).toBe(201);
    return res.body;
  }

  // ---------------------------------------------------------------------------
  // POST /pantry
  // ---------------------------------------------------------------------------
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
      expect(res.body).toHaveProperty('pantry_ingredient_id');
      expect(res.body.ingredient_id).toBe(Number(ingredient.ingredient_id));
      expect(Number(res.body.quantity)).toBe(3);
      expect(res.body).toHaveProperty('unit', 'cup');
      expect(res.body).toHaveProperty('ingredient');
      expect(res.body.ingredient).toHaveProperty('name', ingredient.name);
    });

    test('allows duplicate pantry entries for the same ingredient', async () => {
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

      expect(secondRes.statusCode).toBe(201);
      expect(secondRes.body.ingredient_id).toBe(Number(ingredient.ingredient_id));
      expect(secondRes.body.pantry_ingredient_id).not.toBe(firstRes.body.pantry_ingredient_id);
    });

    test('returns 400 when ingredient_id is missing', async () => {
      const res = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 3, unit: 'cup' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid request body');
      expect(res.body.errors.fieldErrors.ingredient_id).toContain('Invalid input: expected number, received NaN');
    });

    test('returns 400 when unit is invalid', async () => {
      const ingredient = await makeIngredient();

      const res = await request(app)
        .post('/pantry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ingredient_id: Number(ingredient.ingredient_id),
          quantity: 1,
          unit: 'invalid_unit',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid request body');
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app)
        .post('/pantry')
        .send({ ingredient_id: 1, quantity: 1, unit: 'cup' });

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /pantry
  // ---------------------------------------------------------------------------
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
      await makePantryItem(ingredient.ingredient_id, { quantity: 2, unit: 'count' });

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

    test('returns separate rows for duplicate ingredient entries', async () => {
      const ingredient = await makeIngredient();

      await makePantryItem(ingredient.ingredient_id, { quantity: 1, unit: 'count', expiry_date: '2026-12-31' });
      await makePantryItem(ingredient.ingredient_id, { quantity: 2, unit: 'count', expiry_date: '2027-01-15' });

      const res = await request(app)
        .get('/pantry')
        .set('Authorization', `Bearer ${token}`);

      const matches = res.body.filter(
        (item) => Number(item.ingredient_id) === Number(ingredient.ingredient_id)
      );

      expect(matches).toHaveLength(2);
      expect(matches.map((item) => item.expiry_date?.split('T')[0]).sort()).toEqual([
        '2026-12-31',
        '2027-01-15',
      ]);
    });

    test('filters pantry items by search query', async () => {
      const rice = await makeIngredient(`rice-${Date.now()}`);
      const beans = await makeIngredient(`beans-${Date.now()}`);

      await makePantryItem(rice.ingredient_id);
      await makePantryItem(beans.ingredient_id);

      const res = await request(app)
        .get('/pantry')
        .query({ search: 'rice' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].ingredient.name.toLowerCase()).toContain('rice');
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/pantry');

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /pantry/:id
  // ---------------------------------------------------------------------------
  describe('GET /pantry/:id', () => {
    test('returns a single pantry ingredient', async () => {
      const ingredient = await makeIngredient();
      const pantryItem = await makePantryItem(ingredient.ingredient_id, { quantity: 5, unit: 'cup' });

      const res = await request(app)
        .get(`/pantry/${pantryItem.pantry_ingredient_id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.pantry_ingredient_id).toBe(pantryItem.pantry_ingredient_id);
      expect(res.body.ingredient_id).toBe(Number(ingredient.ingredient_id));
      expect(Number(res.body.quantity)).toBe(5);
      expect(res.body).toHaveProperty('unit', 'cup');
      expect(res.body.ingredient.name).toBe(ingredient.name);
    });

    test('returns 400 when id is not a number', async () => {
      const res = await request(app)
        .get('/pantry/abc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid route params');
    });

    test('returns 404 when pantry ingredient is not found', async () => {
      const res = await request(app)
        .get('/pantry/999999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Pantry ingredient not found' });
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/pantry/1');

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /pantry/:id
  // ---------------------------------------------------------------------------
  describe('PATCH /pantry/:id', () => {
    test('updates pantry ingredient fields', async () => {
      const ingredient = await makeIngredient();
      const pantryItem = await makePantryItem(ingredient.ingredient_id, {
        quantity: 1,
        unit: 'cup',
        expiry_date: '2026-12-31',
      });

      const res = await request(app)
        .patch(`/pantry/${pantryItem.pantry_ingredient_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 10, unit: 'count', expiry_date: '2027-01-15' });

      expect(res.statusCode).toBe(200);
      expect(res.body.pantry_ingredient_id).toBe(pantryItem.pantry_ingredient_id);
      expect(res.body.ingredient_id).toBe(Number(ingredient.ingredient_id));
      expect(Number(res.body.quantity)).toBe(10);
      expect(res.body).toHaveProperty('unit', 'count');
    });

    test('returns 400 when no update fields are provided', async () => {
      const ingredient = await makeIngredient();
      const pantryItem = await makePantryItem(ingredient.ingredient_id);

      const res = await request(app)
        .patch(`/pantry/${pantryItem.pantry_ingredient_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid request body');
      expect(res.body.errors.formErrors).toContain('At least one field (quantity, unit, expiry_date) is required');
    });

    test('returns 400 when id is not a number', async () => {
      const res = await request(app)
        .patch('/pantry/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid route params');
    });

    test('returns 404 when pantry ingredient does not exist', async () => {
      const res = await request(app)
        .patch('/pantry/999999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Pantry ingredient not found' });
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app)
        .patch('/pantry/1')
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /pantry/:id
  // ---------------------------------------------------------------------------
  describe('DELETE /pantry/:id', () => {
    test('deletes a pantry ingredient', async () => {
      const ingredient = await makeIngredient();
      const pantryItem = await makePantryItem(ingredient.ingredient_id);

      const deleteRes = await request(app)
        .delete(`/pantry/${pantryItem.pantry_ingredient_id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.statusCode).toBe(204);

      const getRes = await request(app)
        .get(`/pantry/${pantryItem.pantry_ingredient_id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.statusCode).toBe(404);
    });

    test('returns 400 when id is not a number', async () => {
      const res = await request(app)
        .delete('/pantry/abc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid route params');
    });

    test('returns 404 when deleting a missing pantry ingredient', async () => {
      const res = await request(app)
        .delete('/pantry/999999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Pantry ingredient not found' });
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).delete('/pantry/1');

      expect(res.statusCode).toBe(401);
    });
  });
});
