import { z } from 'zod'
import { registry } from '../lib/swagger.js'
import { IngredientResponseSchema } from './ingredient.schema.js'
import { UnitCode } from './shared.schema.js'

export const PantryIngredientResponseSchema = registry.register(
  'PantryIngredient',
  z.object({
    pantry_ingredient_id: z.number(),
    user_id: z.number(),
    ingredient_id: z.number(),
    ingredient: IngredientResponseSchema,
    quantity: z.number().nullable().optional(),
    unit: UnitCode.optional().nullable(),
    expiry_date: z.iso.date().optional().nullable(),
  })
)

export const PantryIngredientCreateSchema = z.object({
  ingredient_id: z.number(),
  quantity: z.number().optional(),
  unit: UnitCode.optional(),
  expiry_date: z.iso.date().optional(),
})

export const PantryIngredientUpdateSchema = z.object({
  quantity: z.number().optional(),
  unit: UnitCode.optional(),
  expiry_date: z.iso.date().optional(),
})

registry.registerPath({
  method: 'get',
  path: '/pantry',
  summary: 'List pantry ingredients',
  tags: ['Pantry'],
  responses: {
    200: {
      description: 'Pantry list',
      content: { 'application/json': { schema: z.array(PantryIngredientResponseSchema) } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/pantry/{id}',
  summary: 'Get pantry ingredient by id',
  tags: ['Pantry'],
  request: { params: z.object({ id: z.string().regex(/^[0-9]+$/) }) },
  responses: {
    200: {
      description: 'Pantry ingredient found',
      content: { 'application/json': { schema: PantryIngredientResponseSchema } },
    },
    404: { description: 'Pantry ingredient not found' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/pantry',
  summary: 'Create pantry entry',
  tags: ['Pantry'],
  request: {
    body: { content: { 'application/json': { schema: PantryIngredientCreateSchema } } },
  },
  responses: {
    201: {
      description: 'Pantry ingredient created',
      content: { 'application/json': { schema: PantryIngredientResponseSchema } },
    },
    400: { description: 'Bad request' },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/pantry/{id}',
  summary: 'Update pantry ingredient',
  tags: ['Pantry'],
  request: {
    params: z.object({ id: z.string().regex(/^[0-9]+$/) }),
    body: { content: { 'application/json': { schema: PantryIngredientUpdateSchema } } },
  },
  responses: {
    200: {
      description: 'Pantry ingredient updated',
      content: { 'application/json': { schema: PantryIngredientResponseSchema } },
    },
    400: { description: 'Bad request' },
    404: { description: 'Pantry ingredient not found' },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/pantry/{id}',
  summary: 'Delete pantry ingredient',
  tags: ['Pantry'],
  request: { params: z.object({ id: z.string().regex(/^[0-9]+$/) }) },
  responses: {
    204: { description: 'Pantry ingredient deleted' },
    404: { description: 'Pantry ingredient not found' },
  },
})
