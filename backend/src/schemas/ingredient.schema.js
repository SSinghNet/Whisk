import { z } from 'zod'
import { registry } from '../lib/swagger.js'

export const IngredientResponseSchema = registry.register(
  'Ingredient',
  z.object({
    ingredient_id: z.number(),
    name: z.string(),
    created_at: z.iso.datetime(),
  })
)

export const IngredientCreateSchema = z.object({
  name: z.string().min(1),
})

export const IngredientUpdateSchema = z.object({
  name: z.string().min(1),
})

registry.registerPath({
  method: 'get',
  path: '/ingredient',
  summary: 'List ingredients',
  tags: ['Ingredients'],
  responses: {
    200: {
      description: 'Ingredient list',
      content: { 'application/json': { schema: z.array(IngredientResponseSchema) } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/ingredient/{id}',
  summary: 'Get ingredient by id',
  tags: ['Ingredients'],
  request: { params: z.object({ id: z.string().regex(/^[0-9]+$/) }) },
  responses: {
    200: {
      description: 'Ingredient found',
      content: { 'application/json': { schema: IngredientResponseSchema } },
    },
    404: { description: 'Ingredient not found' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/ingredient',
  summary: 'Create ingredient',
  tags: ['Ingredients'],
  request: {
    body: { content: { 'application/json': { schema: IngredientCreateSchema } } },
  },
  responses: {
    201: {
      description: 'Ingredient created',
      content: { 'application/json': { schema: IngredientResponseSchema } },
    },
    400: { description: 'Bad request' },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/ingredient/{id}',
  summary: 'Update ingredient',
  tags: ['Ingredients'],
  request: {
    params: z.object({ id: z.string().regex(/^[0-9]+$/) }),
    body: { content: { 'application/json': { schema: IngredientUpdateSchema } } },
  },
  responses: {
    200: {
      description: 'Ingredient updated',
      content: { 'application/json': { schema: IngredientResponseSchema } },
    },
    400: { description: 'Bad request' },
    404: { description: 'Ingredient not found' },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/ingredient/{id}',
  summary: 'Delete ingredient',
  tags: ['Ingredients'],
  request: { params: z.object({ id: z.string().regex(/^[0-9]+$/) }) },
  responses: {
    204: { description: 'Ingredient deleted' },
    404: { description: 'Ingredient not found' },
  },
})
