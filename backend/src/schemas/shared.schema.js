import { z } from 'zod'

//enums matching DB enum exactly
export const UnitCode = z.enum([
  'count',
  'gram',
  'ounce',
  'pound',
  'milliliter',
  'liter',
  'gallon',
  'cup',
  'tablespoon',
  'teaspoon',
])

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})


export const SearchQuerySchema = z.object({
  search: z.optional(z.string().trim().min(1).toLowerCase()),
})