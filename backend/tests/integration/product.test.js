import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { loginTestUser } from './../helpers/auth.js';

describe('Product routes', () => {
  let token;
  let seededIngredientId = null;

  const REAL_BARCODE = '5449000000996';
  const INVALID_BARCODE = '123';
  const UNKNOWN_BARCODE = '99999999999999';

  beforeAll(async () => {
    const login = await loginTestUser();
    token = login.token;

    const registerRes = await request(app)
      .post('/users/register')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 201, 409]).toContain(registerRes.statusCode);
  });

  beforeEach(async () => {
    await prisma.product.deleteMany({ where: { barcode: REAL_BARCODE } });
    seededIngredientId = null;
  });

  afterEach(async () => {
    // Clean up product first (FK), then any ingredient seeded by the cache hit test
    await prisma.product.deleteMany({ where: { barcode: REAL_BARCODE } });
    if (seededIngredientId) {
      await prisma.ingredient.deleteMany({ where: { ingredient_id: seededIngredientId } });
      seededIngredientId = null;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ---------------------------------------------------------------------------
  // GET /product/:barcode
  // ---------------------------------------------------------------------------
  describe('GET /product/:barcode', () => {

    // --- Validation ---
    test('returns 400 when barcode is too short', async () => {
      const res = await request(app)
        .get(`/product/${INVALID_BARCODE}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid barcode format' });
    });

    test('returns 400 when barcode contains non-numeric characters', async () => {
      const res = await request(app)
        .get('/product/ABCD1234567')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid barcode format' });
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).get(`/product/${REAL_BARCODE}`);

      expect(res.statusCode).toBe(401);
    });

    // --- Not found ---
    test('returns 404 when barcode is not found in local DB or Open Food Facts', async () => {
      const res = await request(app)
        .get(`/product/${UNKNOWN_BARCODE}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Product not found' });
    });

    // --- Cache miss: hits Open Food Facts API ---
    test('returns 200 and persists product when barcode is found via Open Food Facts', async () => {
      const res = await request(app)
        .get(`/product/${REAL_BARCODE}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('barcode', REAL_BARCODE);
      expect(res.body).toHaveProperty('product_name');
      expect(res.body).toHaveProperty('ingredient_id');
      expect(res.body).toHaveProperty('ingredient_name');
      expect(res.body).toHaveProperty('default_unit');
      expect(res.body).toHaveProperty('default_quantity');

      // Verify it was actually persisted to the local DB
      const persisted = await prisma.product.findUnique({
        where: { barcode: REAL_BARCODE },
      });
      expect(persisted).not.toBeNull();
      expect(persisted.barcode).toBe(REAL_BARCODE);

      // Track ingredient for afterEach cleanup
      seededIngredientId = BigInt(res.body.ingredient_id);
    });

    // --- Cache hit: verifies product was persisted to local DB by the cache miss ---
    test('product is persisted to local DB after cache miss', async () => {
      // Seed via the API (hits OFF and persists)
      const seedRes = await request(app)
        .get(`/product/${REAL_BARCODE}`)
        .set('Authorization', `Bearer ${token}`);

      expect(seedRes.statusCode).toBe(200);
      seededIngredientId = BigInt(seedRes.body.ingredient_id);

      // Verify directly in the DB via raw query to avoid OFF
      const rows = await prisma.$queryRaw`
        SELECT p.*, i.name as ingredient_name
        FROM product p
        JOIN ingredient i ON i.ingredient_id = p.ingredient_id
        WHERE p.barcode = ${REAL_BARCODE}
        LIMIT 1
      `;
      const persisted = rows[0];

      expect(persisted).toBeDefined();
      expect(persisted.barcode).toBe(REAL_BARCODE);
      expect(persisted.product_name).toBe(seedRes.body.product_name);
      expect(Number(persisted.ingredient_id)).toBe(seedRes.body.ingredient_id);
      expect(persisted.ingredient_name).toBe(seedRes.body.ingredient_name);
      expect(persisted.default_unit).toBe(seedRes.body.default_unit);
      expect(Number(persisted.default_quantity)).toBe(seedRes.body.default_quantity);
    });
  });
});