import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { loginTestUser } from './../helpers/auth.js';

describe('Shopping list routes', () => {
  let token;

  beforeAll(async () => {
    const login = await loginTestUser();
    token = login.token;
  });

  afterEach(async () => {
    await prisma.user_shoppinglist.deleteMany({
      where: { ingredient_id: { in: createdIngredientIds } },
    });

    await prisma.ingredient.deleteMany({
      where: { ingredient_id: { in: createdIngredientIds } },
    });

    createdIngredientIds = [];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  let createdIngredientIds = [];

  async function createIngredient(name = `ingredient-${Date.now()}-${Math.random()}`) {
    const res = await request(app)
      .post('/ingredient')
      .set('Authorization', `Bearer ${token}`)
      .send({ name });

    expect(res.statusCode).toBe(201);
    const id = Number(res.body.ingredient_id);
    createdIngredientIds.push(id);
    return res.body;
  }

  async function addToShoppingList(ingredient_id, overrides = {}) {
    const res = await request(app)
      .post('/shopping-list')
      .set('Authorization', `Bearer ${token}`)
      .send({ ingredient_id, quantity: 1, unit: 'count', ...overrides });

    expect(res.statusCode).toBe(201);
    return res.body;
  }

  // ---------------------------------------------------------------------------
  // GET /shopping-list
  // ---------------------------------------------------------------------------
  describe('GET /shopping-list', () => {
    test('returns empty array when shopping list is empty', async () => {
      const res = await request(app)
        .get('/shopping-list')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns all shopping list items', async () => {
      const ing1 = await createIngredient('rice');
      const ing2 = await createIngredient('beans');
      await addToShoppingList(ing1.ingredient_id);
      await addToShoppingList(ing2.ingredient_id);

      const res = await request(app)
        .get('/shopping-list')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    test('each item has the expected shape', async () => {
      const ing = await createIngredient('milk');
      await addToShoppingList(ing.ingredient_id, { quantity: 2, unit: 'liter' });

      const res = await request(app)
        .get('/shopping-list')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      const item = res.body[0];
      expect(item).toHaveProperty('ingredient_id');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('unit');
      expect(item).toHaveProperty('ingredient');
      expect(item.ingredient).toHaveProperty('name');
    });

    test('filters items by search query', async () => {
      const ing1 = await createIngredient('rice');
      const ing2 = await createIngredient('beans');
      await addToShoppingList(ing1.ingredient_id);
      await addToShoppingList(ing2.ingredient_id);

      const res = await request(app)
        .get('/shopping-list')
        .query({ search: 'rice' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].ingredient.name).toMatch(/rice/i);
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/shopping-list');

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /shopping-list
  // ---------------------------------------------------------------------------
  describe('POST /shopping-list', () => {
    test('adds an item to the shopping list', async () => {
      const ing = await createIngredient('eggs');

      const res = await request(app)
        .post('/shopping-list')
        .set('Authorization', `Bearer ${token}`)
        .send({ ingredient_id: ing.ingredient_id, quantity: 2, unit: 'count' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('ingredient_id', ing.ingredient_id);
      expect(Number(res.body.quantity)).toBe(2);
      expect(res.body).toHaveProperty('unit', 'count');
      expect(res.body).toHaveProperty('ingredient');
    });

    test('upserts quantity when item already exists', async () => {
      const ing = await createIngredient('butter');
      await addToShoppingList(ing.ingredient_id, { quantity: 1 });

      const res = await request(app)
        .post('/shopping-list')
        .set('Authorization', `Bearer ${token}`)
        .send({ ingredient_id: ing.ingredient_id, quantity: 2 });

      expect(res.statusCode).toBe(201);
      expect(Number(res.body.quantity)).toBe(3); // 1 + 2
    });

    test('defaults quantity to 1 when not provided', async () => {
      const ing = await createIngredient('salt');

      const res = await request(app)
        .post('/shopping-list')
        .set('Authorization', `Bearer ${token}`)
        .send({ ingredient_id: ing.ingredient_id });

      expect(res.statusCode).toBe(201);
      expect(Number(res.body.quantity)).toBe(1);
    });

    test('defaults unit to count when not provided', async () => {
      const ing = await createIngredient('pepper');

      const res = await request(app)
        .post('/shopping-list')
        .set('Authorization', `Bearer ${token}`)
        .send({ ingredient_id: ing.ingredient_id });

      expect(res.statusCode).toBe(201);
      expect(res.body.unit).toBe('count');
    });

    test('returns 400 when ingredient_id is missing', async () => {
      const res = await request(app)
        .post('/shopping-list')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'ingredient_id is required');
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app)
        .post('/shopping-list')
        .send({ ingredient_id: 1 });

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /shopping-list/:id
  // ---------------------------------------------------------------------------
  describe('DELETE /shopping-list/:id', () => {
    test('deletes a shopping list item', async () => {
      const ing = await createIngredient('olive oil');
      await addToShoppingList(ing.ingredient_id);

      const res = await request(app)
        .delete(`/shopping-list/${ing.ingredient_id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(204);

      const getRes = await request(app)
        .get('/shopping-list')
        .set('Authorization', `Bearer ${token}`);

      const ids = getRes.body.map((i) => i.ingredient_id);
      expect(ids).not.toContain(ing.ingredient_id);
    });

    test('returns 404 when item does not exist', async () => {
      const res = await request(app)
        .delete('/shopping-list/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Shopping list item not found' });
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).delete('/shopping-list/1');

      expect(res.statusCode).toBe(401);
    });
  });
});