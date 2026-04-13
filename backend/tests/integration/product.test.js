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

    // --- Cache hit: product already in local DB ---
    test('returns 200 from local cache without calling Open Food Facts', async () => {
      const ingredient = await prisma.ingredient.create({
        data: { name: `test-ingredient-${Date.now()}` },
      });

      // Track for afterEach cleanup
      seededIngredientId = ingredient.ingredient_id;

      const rows = await prisma.$queryRaw`
        INSERT INTO product (barcode, product_name, brand, ingredient_id, default_unit, default_quantity)
        VALUES (
          ${REAL_BARCODE},
          'Cached Test Product',
          'Test Brand',
          ${ingredient.ingredient_id},
          'milliliter'::"unit_code",
          ${330}::numeric
        )
        RETURNING product_id, barcode, product_name, brand, ingredient_id, default_unit, default_quantity, created_at
      `;

      const res = await request(app)
        .get(`/product/${REAL_BARCODE}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.barcode).toBe(REAL_BARCODE);
      expect(res.body.product_name).toBe('Cached Test Product');
      expect(res.body.brand).toBe('Test Brand');
      expect(Number(res.body.ingredient_id)).toBe(Number(ingredient.ingredient_id));
      expect(res.body.ingredient_name).toBe(ingredient.name);
      expect(res.body.default_unit).toBe('milliliter');
      expect(res.body.default_quantity).toBe(330);
    });
  });
});