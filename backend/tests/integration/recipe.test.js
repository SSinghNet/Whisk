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
    await prisma.$disconnect();
  });

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

  describe('GET /recipe/:id', () => {
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

      const res = await request(app)
        .get(`/recipe/${recipe.recipe_id}`)
        .set('Authorization', `Bearer ${token}`);

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
  });

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

      const res = await request(app)
        .post(`/recipe/${recipe.recipe_id}/make`)
        .set('Authorization', `Bearer ${token}`);

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

      const res = await request(app)
        .post(`/recipe/${recipe.recipe_id}/make`)
        .set('Authorization', `Bearer ${token}`);

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
});
