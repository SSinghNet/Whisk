import { z } from 'zod'
import { registry } from '../lib/swagger.js'
import { IngredientResponseSchema } from './ingredient.schema.js'
import { UnitCode } from './shared.schema.js'

export const ShoppingListItemResponseSchema = registry.register(
  'ShoppingListItem',
  z.object({
    ingredient_id: z.number(),
    user_id: z.number(),
    quantity: z.number(),
    unit: UnitCode,
    ingredient: IngredientResponseSchema,
  })
)

export const ShoppingListItemCreateSchema = z.object({
  ingredient_id: z.number(),
  quantity: z.number().optional(),
  unit: UnitCode.optional(),
})

registry.registerPath({
  method: 'get',
  path: '/shopping-list',
  summary: 'List shopping list items',
  tags: ['Shopping List'],
  responses: {
    200: {
      description: 'Shopping list items',
      content: { 'application/json': { schema: z.array(ShoppingListItemResponseSchema) } },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/shopping-list',
  summary: 'Add item to shopping list',
  tags: ['Shopping List'],
  request: {
    body: { content: { 'application/json': { schema: ShoppingListItemCreateSchema } } },
  },
  responses: {
    201: {
      description: 'Shopping list item created or updated',
      content: { 'application/json': { schema: ShoppingListItemResponseSchema } },
    },
    400: { description: 'Bad request' },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/shopping-list/{id}',
  summary: 'Delete shopping list item',
  tags: ['Shopping List'],
  request: { params: z.object({ id: z.string().regex(/^[0-9]+$/) }) },
  responses: {
    204: { description: 'Shopping list item deleted' },
    404: { description: 'Shopping list item not found' },
  },
})