import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { loginTestUser } from './../helpers/auth.js';

describe('Recipe routes', () => {
  let token;
  let appUser;

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
    // Clean up user_recipe first (FK constraint), then orphaned test recipes
    await prisma.user_recipe.deleteMany({ where: { user_id: appUser.user_id } });
    await prisma.recipe.deleteMany({ where: { title: { startsWith: 'Test Recipe' } } });
  });

  afterAll(async () => {
    await prisma.user_recipe.deleteMany({ where: { user_id: appUser.user_id } });
    await prisma.recipe.deleteMany({ where: { title: { startsWith: 'Test Recipe' } } });
    await prisma.$disconnect();
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const authRequest = (method, url) =>
    request(app)[method](url).set('Authorization', `Bearer ${token}`);

  async function createRecipeInDb(overrides = {}) {
    return prisma.recipe.create({
      data: {
        title: 'Test Recipe',
        instructions: 'Do the thing.',
        image_url: null,
        yield_amount: 2,
        yield_unit: 'cup',
        ...overrides,
      },
    });
  }

  async function linkRecipeToUser(recipeId) {
    return prisma.user_recipe.create({
      data: {
        user_id: appUser.user_id,
        recipe_id: recipeId,
      },
    });
  }

  async function cleanupRecipe(recipeId) {
    await prisma.user_recipe.deleteMany({ where: { recipe_id: recipeId } });
    await prisma.recipe.delete({ where: { recipe_id: recipeId } });
  }

  // ---------------------------------------------------------------------------
  // GET /recipe
  // ---------------------------------------------------------------------------
  describe('GET /recipe', () => {
    test('returns 200 with an array of recipes', async () => {
      const res = await authRequest('get', '/recipe');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('returns 200 with empty array when search yields no results', async () => {
      const res = await authRequest('get', '/recipe?search=zzznomatchzzz');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('filters results by search query', async () => {
      const recipe = await createRecipeInDb({ title: `Unique Truffle Soup ${Date.now()}` });

      const res = await authRequest('get', '/recipe?search=Truffle');

      expect(res.statusCode).toBe(200);
      expect(res.body.some((r) => Number(r.recipe_id) === Number(recipe.recipe_id))).toBe(true);

      await cleanupRecipe(recipe.recipe_id);
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/recipe');

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /recipe/user
  // ---------------------------------------------------------------------------
  describe('GET /recipe/user', () => {
    test("returns 200 with the authenticated user's recipes", async () => {
      const recipe = await createRecipeInDb({ title: 'My Personal Recipe' });
      await linkRecipeToUser(recipe.recipe_id);

      const res = await authRequest('get', '/recipe/user');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((r) => Number(r.recipe_id) === Number(recipe.recipe_id))).toBe(true);

      await cleanupRecipe(recipe.recipe_id);
    });

    test('returns 200 with empty array when user has no recipes', async () => {
      const res = await authRequest('get', '/recipe/user');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/recipe/user');

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /recipe/:id
  // ---------------------------------------------------------------------------
  describe('GET /recipe/:id', () => {
    test('returns 200 with the recipe when found', async () => {
      const recipe = await createRecipeInDb();
      await linkRecipeToUser(recipe.recipe_id);

      const res = await authRequest('get', `/recipe/${Number(recipe.recipe_id)}`);

      expect(res.statusCode).toBe(200);
      expect(Number(res.body.recipe_id)).toBe(Number(recipe.recipe_id));
      expect(res.body.title).toBe(recipe.title);

      await cleanupRecipe(recipe.recipe_id);
    });

    test('returns 404 when recipe does not exist', async () => {
      const res = await authRequest('get', '/recipe/999999999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Recipe not found' });
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/recipe/1');

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /recipe
  // ---------------------------------------------------------------------------
  describe('POST /recipe', () => {
    let createdRecipeId;

    afterEach(async () => {
      if (createdRecipeId) {
        await cleanupRecipe(BigInt(createdRecipeId));
        createdRecipeId = null;
      }
    });

    test('creates a recipe with all fields', async () => {
      const body = {
        title: 'Integration Test Recipe',
        instructions: 'Mix everything.',
        image_url: 'https://example.com/img.jpg',
        yield_amount: 4,
        yield_unit: 'cup',
      };

      const res = await authRequest('post', '/recipe').send(body);

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe(body.title);
      expect(res.body.instructions).toBe(body.instructions);
      expect(res.body).toHaveProperty('recipe_id');
      createdRecipeId = res.body.recipe_id;
    });

    test('creates a recipe with only the required title field', async () => {
      const res = await authRequest('post', '/recipe').send({ title: 'Minimal Recipe' });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Minimal Recipe');
      createdRecipeId = res.body.recipe_id;
    });

    test('returns 400 when title is missing', async () => {
      const res = await authRequest('post', '/recipe').send({ instructions: 'No title here' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'title is required' });
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).post('/recipe').send({ title: 'Sneaky Recipe' });

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /recipe/:id
  // ---------------------------------------------------------------------------
  describe('PATCH /recipe/:id', () => {
    test('updates recipe fields', async () => {
      const recipe = await createRecipeInDb();

      const res = await authRequest('patch', `/recipe/${Number(recipe.recipe_id)}`).send({
        title: 'Updated Title',
        yield_amount: 6,
        yield_unit: 'tablespoon',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(Number(res.body.yield_amount)).toBe(6);
      expect(res.body).toHaveProperty('yield_unit', 'tablespoon');

      await cleanupRecipe(recipe.recipe_id);
    });

    test('returns 400 when no fields are provided', async () => {
      const recipe = await createRecipeInDb();

      const res = await authRequest('patch', `/recipe/${Number(recipe.recipe_id)}`).send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        message: 'At least one field (title, instructions, image_url, yield_amount, yield_unit) is required',
      });

      await cleanupRecipe(recipe.recipe_id);
    });

    test('returns 404 when recipe does not exist', async () => {
      const res = await authRequest('patch', '/recipe/999999999').send({ title: 'Ghost Update' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Recipe not found' });
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).patch('/recipe/1').send({ title: 'Unauthorized' });

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /recipe/:id
  // ---------------------------------------------------------------------------
  describe('DELETE /recipe/:id', () => {
    test('deletes a recipe', async () => {
      const recipe = await createRecipeInDb();

      const deleteRes = await authRequest('delete', `/recipe/${Number(recipe.recipe_id)}`);

      expect(deleteRes.statusCode).toBe(204);

      const getRes = await authRequest('get', `/recipe/${Number(recipe.recipe_id)}`);
      expect(getRes.statusCode).toBe(404);
    });

    test('returns 404 when recipe does not exist', async () => {
      const res = await authRequest('delete', '/recipe/999999999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Recipe not found' });
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).delete('/recipe/1');

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /recipe/:id/users  (addRecipeToUser)
  // ---------------------------------------------------------------------------
  describe('POST /recipe/:id/users', () => {
    test('adds a recipe to the user', async () => {
      const recipe = await createRecipeInDb();

      const res = await authRequest('post', `/recipe/${Number(recipe.recipe_id)}/users`);

      expect(res.statusCode).toBe(201);
      expect(Number(res.body.recipe_id)).toBe(Number(recipe.recipe_id));

      await cleanupRecipe(recipe.recipe_id);
    });

    test('returns 409 when recipe is already added by user', async () => {
      const recipe = await createRecipeInDb();
      await linkRecipeToUser(recipe.recipe_id);

      const res = await authRequest('post', `/recipe/${Number(recipe.recipe_id)}/users`);

      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({ message: 'Recipe already added by user' });

      await cleanupRecipe(recipe.recipe_id);
    });

    test('returns 404 when recipe does not exist', async () => {
      const res = await authRequest('post', '/recipe/999999999/users');

      expect(res.statusCode).toBe(404);
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).post('/recipe/1/users');

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /recipe/:id/users  (removeRecipeFromUser)
  // ---------------------------------------------------------------------------
  describe('DELETE /recipe/:id/users', () => {
    test('removes a recipe from the user', async () => {
      const recipe = await createRecipeInDb();
      await linkRecipeToUser(recipe.recipe_id);

      const deleteRes = await authRequest('delete', `/recipe/${Number(recipe.recipe_id)}/users`);

      expect(deleteRes.statusCode).toBe(204);

      const gone = await prisma.user_recipe.findFirst({
        where: { user_id: appUser.user_id, recipe_id: recipe.recipe_id },
      });
      expect(gone).toBeNull();

      await cleanupRecipe(recipe.recipe_id);
    });

    test('returns 404 when recipe is not linked to user', async () => {
      const recipe = await createRecipeInDb();

      const res = await authRequest('delete', `/recipe/${Number(recipe.recipe_id)}/users`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Recipe not found for user' });

      await cleanupRecipe(recipe.recipe_id);
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).delete('/recipe/1/users');

      expect(res.statusCode).toBe(401);
    });
  });
});