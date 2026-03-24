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
