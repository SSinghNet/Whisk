import { z } from 'zod'
import { registry } from '../lib/swagger.js'
import { IngredientResponseSchema } from './ingredient.schema.js'
import { UnitCode } from './shared.schema.js'

export const PantryIngredientResponseSchema = registry.register(
  'PantryIngredientResponse',
  z.object({
    pantry_ingredient_id: z.number().positive(),
    user_id: z.number().positive(),
    ingredient_id: z.number().positive(),
    ingredient: IngredientResponseSchema,
    quantity: z.number().positive(),
    unit: UnitCode,
    expiry_date: z.iso.date().optional().nullable(),
  })
)

export const PantryIngredientCreateSchema = registry.register(
  'PantryIngredientCreate',
  z.object({
    ingredient_id: z.coerce
      .number({ required_error: 'Ingredient is required', invalid_type_error: 'Ingredient ID must be a number' })
      .int('Ingredient ID must be an integer')
      .positive('Ingredient ID must be a positive number'),
    quantity: z.coerce
      .number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity must be a number' })
      .positive('Quantity must be greater than 0')
      .max(9999.99, 'Quantity cannot exceed 9999.99')
      .multipleOf(0.01, 'Quantity cannot have more than 2 decimal places'),
    unit: UnitCode,
    expiry_date: z.iso.date().optional().nullable(),
  })
)

export const PantryIngredientUpdateSchema = registry.register(
  'PantryIngredientUpdate',
  z.object({
  quantity: z.coerce
    .number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity must be a number' })
    .positive('Quantity must be greater than 0')
    .max(9999.99, 'Quantity cannot exceed 9999.99')
    .multipleOf(0.01, 'Quantity cannot have more than 2 decimal places')
    .optional().nullable(),
    unit: UnitCode.optional().nullable(),
    expiry_date: z.iso.date({ error: 'Invalid date format' }).optional().nullable(),
  }).refine(
    ({ quantity, unit, expiry_date }) => quantity !== undefined || unit !== undefined || expiry_date !== undefined,
    { message: 'At least one field (quantity, unit, expiry_date) is required' }
  )
)


registry.registerPath({
  method: 'get',
  path: '/pantry',
  summary: 'List pantry ingredients',
  tags: ['Pantry'],
  request: {
    query: z.object({ search: z.string().optional() }),
  },
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
