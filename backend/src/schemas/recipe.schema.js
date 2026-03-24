import { z } from 'zod'
import { registry } from '../lib/swagger.js'
import 'shared.schema.js'

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