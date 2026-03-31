import { z } from 'zod'
import { registry } from '../lib/swagger.js'
import { UnitCode } from 'shared.schema.js'

export const RecipeResponseSchema = registry.register(
    'Recipe',
    z.object({
      recipe_id:    z.number(),
      user_id:      z.number(),
      title:        z.string(),
      instructions: z.string(),
      image_url:    z.string(),
      yield_amount: z.number(),
      yield_unit:   UnitCode,
      created_at: z.iso.datetime(),
    })
  )

export const CreateRecipeSchema = z.object({
  title:        z.string().min(1),
  instructions: z.string().min(1),
  image_url:    z.string().url(),
  yield_amount: z.number().positive(),
  yield_unit:   UnitCode,
})

export const UpdateRecipeSchema = z.object({
  title:        z.string().min(1).optional(),
  instructions: z.string().min(1).optional(),
  image_url:    z.string().url().optional(),
  yield_amount: z.number().positive().optional(),
  yield_unit:   UnitCode.optional(),
})


// GET /recipes
registry.registerPath({
  method: 'get',
  path: '/recipes',
  summary: 'Get all recipes',
  tags: ['Recipes'],
  responses: {
    200: {
      description: 'List of recipes',
      content: { 'application/json': { schema: z.array(RecipeResponseSchema) } }
    }
  }
})


// GET /recipes/:id
registry.registerPath({
  method: 'get',
  path: '/recipes/{id}',
  summary: 'Get a recipe by ID',
  tags: ['Recipes'],
  responses: {
    200: {
      description: 'Recipe found',
      content: { 'application/json': { schema: RecipeResponseSchema } }
    },
    404: { description: 'Recipe not found' }
  }
})


// POST /recipes
registry.registerPath({
  method: 'post',
  path: '/recipes',
  summary: 'Create a new recipe',
  tags: ['Recipes'],
  request: {
    body: {
      content: { 'application/json': { schema: CreateRecipeSchema } }
    }
  },
  responses: {
    201: {
      description: 'Recipe created',
      content: { 'application/json': { schema: RecipeResponseSchema } }
    }
  }
})


// PUT /recipes/:id
registry.registerPath({
  method: 'put',
  path: '/recipes/{id}',
  summary: 'Update a recipe',
  tags: ['Recipes'],
  request: {
    body: {
      content: { 'application/json': { schema: UpdateRecipeSchema } }
    }
  },
  responses: {
    200: {
      description: 'Recipe updated',
      content: { 'application/json': { schema: RecipeResponseSchema } }
    },
    404: { description: 'Recipe not found' }
  }
})


// DELETE /recipes/:id
registry.registerPath({
  method: 'delete',
  path: '/recipes/{id}',
  summary: 'Delete a recipe',
  tags: ['Recipes'],
  responses: {
    204: { description: 'Recipe deleted' }
  }
})