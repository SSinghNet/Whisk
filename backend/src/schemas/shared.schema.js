import { z } from 'zod'

//BigInt ID as number
export const BigIntId = z.number()

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

//timestamp
export const Timestamp = z.iso.datetime()