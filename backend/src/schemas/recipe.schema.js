import { z } from 'zod'
import { registry } from '../lib/swagger.js'
import { IngredientResponseSchema } from './ingredient.schema.js'
import { UnitCode } from './shared.schema.js'

export const RecipeIngredientSchema = z.object({
  recipe_id: z.number(),
  ingredient_id: z.number(),
  amount: z.number().nullable().optional(),
  unit: UnitCode,
  ingredient: IngredientResponseSchema,
})

export const RecipeResponseSchema = registry.register(
  'Recipe',
  z.object({
    recipe_id: z.number(),
    title: z.string(),
    instructions: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    yield_amount: z.number().nullable().optional(),
    yield_unit: UnitCode.nullable().optional(),
    created_at: z.string(),
    recipe_ingredient: z.array(RecipeIngredientSchema),
  })
)

export const CreateRecipeSchema = z.object({
  title: z.string().min(1),
  instructions: z.string().optional(),
  image_url: z.string().optional(),
  yield_amount: z.number().positive().optional(),
  yield_unit: UnitCode.optional(),
})

export const UpdateRecipeSchema = z.object({
  title: z.string().min(1).optional(),
  instructions: z.string().optional(),
  image_url: z.string().optional(),
  yield_amount: z.number().positive().optional(),
  yield_unit: UnitCode.optional(),
})

export const UserRecipeSchema = registry.register(
  'UserRecipe',
  z.object({
    user_id: z.number(),
    recipe_id: z.number(),
  })
)

// GET /recipe
registry.registerPath({
  method: 'get',
  path: '/recipe',
  summary: 'Get all recipes in database',
  tags: ['Recipes'],
  responses: {
    200: {
      description: 'List of all recipes',
      content: { 'application/json': { schema: z.array(RecipeResponseSchema) } },
    },
  },
})

// GET /recipe/user
registry.registerPath({
  method: 'get',
  path: '/recipe/user',
  summary: 'Get recipes for authenticated user',
  tags: ['Recipes'],
  responses: {
    200: {
      description: 'List of user recipes',
      content: { 'application/json': { schema: z.array(RecipeResponseSchema) } },
    },
  },
})

// GET /recipe/:id
registry.registerPath({
  method: 'get',
  path: '/recipe/{id}',
  summary: 'Get a recipe by ID',
  tags: ['Recipes'],
  request: { params: z.object({ id: z.string().regex(/^[0-9]+$/) }) },
  responses: {
    200: {
      description: 'Recipe found',
      content: { 'application/json': { schema: RecipeResponseSchema } },
    },
    404: { description: 'Recipe not found' },
  },
})

// POST /recipe
registry.registerPath({
  method: 'post',
  path: '/recipe',
  summary: 'Create a new recipe',
  tags: ['Recipes'],
  request: {
    body: { content: { 'application/json': { schema: CreateRecipeSchema } } },
  },
  responses: {
    201: {
      description: 'Recipe created',
      content: { 'application/json': { schema: RecipeResponseSchema } },
    },
    400: { description: 'Bad request' },
  },
})

// PATCH /recipe/:id
registry.registerPath({
  method: 'patch',
  path: '/recipe/{id}',
  summary: 'Update a recipe',
  tags: ['Recipes'],
  request: {
    params: z.object({ id: z.string().regex(/^[0-9]+$/) }),
    body: { content: { 'application/json': { schema: UpdateRecipeSchema } } },
  },
  responses: {
    200: {
      description: 'Recipe updated',
      content: { 'application/json': { schema: RecipeResponseSchema } },
    },
    400: { description: 'Bad request' },
    404: { description: 'Recipe not found' },
  },
})

// DELETE /recipe/:id
registry.registerPath({
  method: 'delete',
  path: '/recipe/{id}',
  summary: 'Delete a recipe',
  tags: ['Recipes'],
  request: { params: z.object({ id: z.string().regex(/^[0-9]+$/) }) },
  responses: {
    204: { description: 'Recipe deleted' },
    404: { description: 'Recipe not found' },
  },
})

// POST /recipe/:id/users
registry.registerPath({
  method: 'post',
  path: '/recipe/{id}/users',
  summary: 'Add recipe to user',
  tags: ['Recipes'],
  request: { params: z.object({ id: z.string().regex(/^[0-9]+$/) }) },
  responses: {
    201: {
      description: 'Recipe added to user',
      content: { 'application/json': { schema: UserRecipeSchema } },
    },
    404: { description: 'Recipe not found' },
    409: { description: 'Recipe already added by user' },
  },
})

// DELETE /recipe/:id/users
registry.registerPath({
  method: 'delete',
  path: '/recipe/{id}/users',
  summary: 'Remove recipe from user',
  tags: ['Recipes'],
  request: { params: z.object({ id: z.string().regex(/^[0-9]+$/) }) },
  responses: {
    204: { description: 'Recipe removed from user' },
    404: { description: 'Recipe not found for user' },
  },
})