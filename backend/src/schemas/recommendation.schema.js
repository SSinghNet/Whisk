import { z } from 'zod'
import { registry } from '../lib/swagger.js'
import { RecipeResponseSchema } from './recipe.schema.js'

registry.registerPath({
  method: 'post',
  path: '/recommendation',
  summary: 'Get recipe recommendations based on pantry',
  tags: ['Recommendations'],
  responses: {
    200: {
      description: 'List of recommended recipes based on current pantry items',
      content: {
        'application/json': {
          schema: z.array(RecipeResponseSchema),
        },
      },
    },
    500: { description: 'Failed to get recommendations' },
  },
})