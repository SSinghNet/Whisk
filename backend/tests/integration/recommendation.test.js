import request from 'supertest';
import { jest } from '@jest/globals';

const mockGetRecommendations = jest.fn();

jest.unstable_mockModule('../../src/services/recommendationService.js', () => ({
  getRecommendations: mockGetRecommendations,
}));

const { default: app } = await import('../../src/app.js');
const { loginTestUser } = await import('../helpers/auth.js');

const mockRecipe = (overrides = {}) => ({
  title: 'Scrambled Eggs',
  yield_amount: 2,
  yield_unit: 'count',
  ingredients: [
    { name: 'egg', amount: 3, unit: 'count', display: '3 egg' },
    { name: 'butter', amount: 1, unit: 'tablespoon', display: '1 tablespoon butter' },
  ],
  instructions: 'Crack eggs. Cook in butter over low heat.',
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Recommendation routes', () => {
  let token;

  beforeAll(async () => {
    mockGetRecommendations.mockResolvedValue([]); // prime the mock
    const login = await loginTestUser();
    token = login.token;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /recommendations', () => {
    test('returns 200 with a list of recipe recommendations', async () => {
      const recipes = [mockRecipe(), mockRecipe({ title: 'Buttered Toast' })];
      mockGetRecommendations.mockResolvedValue(recipes);

      const res = await request(app)
        .post('/recommendations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    test('returns 200 with an empty array when pantry is empty', async () => {
      mockGetRecommendations.mockResolvedValue([]);

      const res = await request(app)
        .post('/recommendations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('each recipe has the expected shape', async () => {
      mockGetRecommendations.mockResolvedValue([mockRecipe()]);

      const res = await request(app)
        .post('/recommendations')
        .set('Authorization', `Bearer ${token}`);

      const recipe = res.body[0];
      expect(recipe).toHaveProperty('title');
      expect(recipe).toHaveProperty('instructions');
      expect(recipe).toHaveProperty('yield_amount');
      expect(recipe).toHaveProperty('yield_unit');
      expect(Array.isArray(recipe.ingredients)).toBe(true);
    });

    test('each ingredient has the expected shape', async () => {
      mockGetRecommendations.mockResolvedValue([mockRecipe()]);

      const res = await request(app)
        .post('/recommendations')
        .set('Authorization', `Bearer ${token}`);

      const ingredient = res.body[0].ingredients[0];
      expect(ingredient).toHaveProperty('name');
      expect(ingredient).toHaveProperty('amount');
      expect(ingredient).toHaveProperty('unit');
      expect(ingredient).toHaveProperty('display');
    });

    test('handles recipes with null optional fields', async () => {
      const recipe = mockRecipe({ instructions: null, yield_amount: null, yield_unit: null });
      mockGetRecommendations.mockResolvedValue([recipe]);

      const res = await request(app)
        .post('/recommendations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0].instructions).toBeNull();
      expect(res.body[0].yield_amount).toBeNull();
      expect(res.body[0].yield_unit).toBeNull();
    });

    test('handles ingredients with null amount', async () => {
      const recipe = mockRecipe({
        ingredients: [{ name: 'salt', amount: null, unit: 'count', display: 'salt' }],
      });
      mockGetRecommendations.mockResolvedValue([recipe]);

      const res = await request(app)
        .post('/recommendations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0].ingredients[0].amount).toBeNull();
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).post('/recommendations');

      expect(res.statusCode).toBe(401);
    });

    test('returns 500 when the service throws a Groq API error', async () => {
      mockGetRecommendations.mockRejectedValue(
        new Error('Groq API error 500: Internal Server Error')
      );

      const res = await request(app)
        .post('/recommendations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
    });

    test('returns 500 with message when Groq response cannot be parsed', async () => {
      mockGetRecommendations.mockRejectedValue(
        new Error('Failed to parse recipe suggestions from Groq response')
      );

      const res = await request(app)
        .post('/recommendations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Failed to parse recipe suggestions from Groq response');
    });
  });
});