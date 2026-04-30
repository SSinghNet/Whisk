import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { loginTestUser } from '../helpers/auth.js';
import { createTestIngredient } from '../helpers/db.js';

describe('Recipe routes', () => {
  let token;
  let appUser;
  let createdIngredientIds = [];
  let createdRecipeIds = [];

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

  beforeEach(async () => {
    await prisma.user_recipe.deleteMany({ where: { user_id: appUser.user_id } });
    await prisma.recipe.deleteMany({ where: { title: { startsWith: 'Test Recipe' } } });
  });

  afterEach(async () => {
    if (createdRecipeIds.length) {
      await prisma.user_recipe.deleteMany({
        where: { recipe_id: { in: createdRecipeIds } },
      });
      await prisma.recipe_ingredient.deleteMany({
        where: { recipe_id: { in: createdRecipeIds } },
      });
      await prisma.recipe.deleteMany({
        where: { recipe_id: { in: createdRecipeIds } },
      });
    }

    if (createdIngredientIds.length) {
      await prisma.pantry_ingredient.deleteMany({
        where: {
          user_id: appUser.user_id,
          ingredient_id: { in: createdIngredientIds },
        },
      });
      await prisma.ingredient.deleteMany({
        where: { ingredient_id: { in: createdIngredientIds } },
      });
    }

    createdIngredientIds = [];
    createdRecipeIds = [];
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

  async function makeIngredient(name) {
    const ingredient = await createTestIngredient(name);
    createdIngredientIds.push(Number(ingredient.ingredient_id));
    return ingredient;
  }

  async function makeRecipe(definitions) {
    const recipe = await prisma.recipe.create({
      data: {
        title: `recipe-${Date.now()}-${Math.random()}`,
        instructions: 'Mix and cook.',
      },
    });

    createdRecipeIds.push(Number(recipe.recipe_id));

    await prisma.recipe_ingredient.createMany({
      data: definitions.map(({ ingredient, amount, unit }) => ({
        recipe_id: Number(recipe.recipe_id),
        ingredient_id: Number(ingredient.ingredient_id),
        amount,
        unit,
      })),
    });

    return recipe;
  }

  async function createRecipeInDb(overrides = {}) {
    const recipe = await prisma.recipe.create({
      data: {
        title: 'Test Recipe',
        instructions: 'Do the thing.',
        image_url: null,
        yield_amount: 2,
        yield_unit: 'cup',
        ...overrides,
      },
    });
    createdRecipeIds.push(Number(recipe.recipe_id));
    return recipe;
  }

  async function linkRecipeToUser(recipeId) {
    return prisma.user_recipe.create({
      data: {
        user_id: appUser.user_id,
        recipe_id: recipeId,
      },
    });
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
    });

    test('returns pantry availability for each recipe ingredient', async () => {
      const pasta = await makeIngredient(`pasta-${Date.now()}`);
      const sauce = await makeIngredient(`sauce-${Date.now()}`);
      const basil = await makeIngredient(`basil-${Date.now()}`);

      const recipe = await makeRecipe([
        { ingredient: pasta, amount: 2, unit: 'cup' },
        { ingredient: sauce, amount: 3, unit: 'cup' },
        { ingredient: basil, amount: 1, unit: 'count' },
      ]);

      await prisma.pantry_ingredient.createMany({
        data: [
          {
            user_id: appUser.user_id,
            ingredient_id: Number(pasta.ingredient_id),
            quantity: 2,
            unit: 'cup',
          },
          {
            user_id: appUser.user_id,
            ingredient_id: Number(sauce.ingredient_id),
            quantity: 1,
            unit: 'cup',
          },
        ],
      });

      const res = await authRequest('get', `/recipe/${recipe.recipe_id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.pantry_status_summary).toMatchObject({
        available_count: 1,
        insufficient_count: 1,
        missing_count: 1,
        can_make_recipe: false,
      });

      const ingredientStatuses = Object.fromEntries(
        res.body.recipe_ingredient.map((item) => [item.ingredient.name, item.pantry_status.status])
      );

      expect(ingredientStatuses[pasta.name]).toBe('available');
      expect(ingredientStatuses[sauce.name]).toBe('insufficient');
      expect(ingredientStatuses[basil.name]).toBe('missing');
      expect(res.body.pantry_status_summary.missing_ingredients).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: sauce.name, status: 'insufficient' }),
          expect.objectContaining({ name: basil.name, status: 'missing' }),
        ])
      );
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
      createdRecipeIds.push(Number(res.body.recipe_id));
    });

    test('creates a recipe with only the required title field', async () => {
      const res = await authRequest('post', '/recipe').send({ title: 'Minimal Recipe' });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Minimal Recipe');
      createdRecipeIds.push(Number(res.body.recipe_id));
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
    });

    test('returns 400 when no fields are provided', async () => {
      const recipe = await createRecipeInDb();

      const res = await authRequest('patch', `/recipe/${Number(recipe.recipe_id)}`).send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        message: 'At least one field (title, instructions, image_url, yield_amount, yield_unit) is required',
      });
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
  // POST /recipe/:id/make
  // ---------------------------------------------------------------------------
  describe('POST /recipe/:id/make', () => {
    test('deducts pantry ingredients when the recipe can be made', async () => {
      const flour = await makeIngredient(`flour-${Date.now()}`);
      const eggs = await makeIngredient(`eggs-${Date.now()}`);

      const recipe = await makeRecipe([
        { ingredient: flour, amount: 3, unit: 'cup' },
        { ingredient: eggs, amount: 2, unit: 'count' },
      ]);

      const flourFirst = await prisma.pantry_ingredient.create({
        data: {
          user_id: appUser.user_id,
          ingredient_id: Number(flour.ingredient_id),
          quantity: 1,
          unit: 'cup',
          expiry_date: new Date('2026-05-01'),
        },
      });

      const flourSecond = await prisma.pantry_ingredient.create({
        data: {
          user_id: appUser.user_id,
          ingredient_id: Number(flour.ingredient_id),
          quantity: 4,
          unit: 'cup',
          expiry_date: new Date('2026-06-01'),
        },
      });

      await prisma.pantry_ingredient.create({
        data: {
          user_id: appUser.user_id,
          ingredient_id: Number(eggs.ingredient_id),
          quantity: 2,
          unit: 'count',
        },
      });

      const res = await authRequest('post', `/recipe/${recipe.recipe_id}/make`);

      expect(res.statusCode).toBe(200);
      expect(res.body.pantry_status_summary.can_make_recipe).toBe(false);

      const remainingFlour = await prisma.pantry_ingredient.findMany({
        where: {
          user_id: appUser.user_id,
          ingredient_id: Number(flour.ingredient_id),
        },
        orderBy: { pantry_ingredient_id: 'asc' },
      });

      const remainingEggs = await prisma.pantry_ingredient.findMany({
        where: {
          user_id: appUser.user_id,
          ingredient_id: Number(eggs.ingredient_id),
        },
      });

      expect(remainingFlour).toHaveLength(1);
      expect(Number(remainingFlour[0].pantry_ingredient_id)).toBe(Number(flourSecond.pantry_ingredient_id));
      expect(Number(remainingFlour[0].quantity)).toBe(2);
      expect(remainingEggs).toHaveLength(0);

      const flourStatus = res.body.recipe_ingredient.find(
        (item) => item.ingredient.name === flour.name
      );

      expect(flourStatus.pantry_status.status).toBe('insufficient');
      expect(flourStatus.pantry_status.missing_quantity).toBe(1);

      const deletedFlourItem = await prisma.pantry_ingredient.findUnique({
        where: { pantry_ingredient_id: Number(flourFirst.pantry_ingredient_id) },
      });

      expect(deletedFlourItem).toBeNull();
    });

    test('returns 409 when pantry ingredients are insufficient', async () => {
      const milk = await makeIngredient(`milk-${Date.now()}`);
      const recipe = await makeRecipe([
        { ingredient: milk, amount: 2, unit: 'cup' },
      ]);

      await prisma.pantry_ingredient.create({
        data: {
          user_id: appUser.user_id,
          ingredient_id: Number(milk.ingredient_id),
          quantity: 1,
          unit: 'cup',
        },
      });

      const res = await authRequest('post', `/recipe/${recipe.recipe_id}/make`);

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Recipe cannot be made with current pantry ingredients');
      expect(res.body.details.can_make_recipe).toBe(false);
      expect(res.body.details.make_recipe_blockers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: milk.name, status: 'insufficient' }),
        ])
      );
    });
  });

  // ---------------------------------------------------------------------------
  // POST /recipe/:id/users
  // ---------------------------------------------------------------------------
  describe('POST /recipe/:id/users', () => {
    test('adds a recipe to the user', async () => {
      const recipe = await createRecipeInDb();

      const res = await authRequest('post', `/recipe/${Number(recipe.recipe_id)}/users`);

      expect(res.statusCode).toBe(201);
      expect(Number(res.body.recipe_id)).toBe(Number(recipe.recipe_id));
    });

    test('returns 409 when recipe is already added by user', async () => {
      const recipe = await createRecipeInDb();
      await linkRecipeToUser(recipe.recipe_id);

      const res = await authRequest('post', `/recipe/${Number(recipe.recipe_id)}/users`);

      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({ message: 'Recipe already added by user' });
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
  // DELETE /recipe/:id/users
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
    });

    test('returns 404 when recipe is not linked to user', async () => {
      const recipe = await createRecipeInDb();

      const res = await authRequest('delete', `/recipe/${Number(recipe.recipe_id)}/users`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Recipe not found for user' });
    });

    test('returns 401 when no token is provided', async () => {
      const res = await request(app).delete('/recipe/1/users');

      expect(res.statusCode).toBe(401);
    });
  });
});