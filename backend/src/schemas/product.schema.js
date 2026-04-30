import { z } from 'zod'
import { registry } from '../lib/swagger.js'



const barcodeParam = z.object({
  barcode: z.string().regex(/^\d{8,14}$/, 'Barcode must be 8–14 digits'),
})

export const ProductResponseSchema = registry.register(
  'ProductResponse',
  z.object({
    barcode:          z.string().regex(/^\d{8,14}$/),
    product_name:     z.string().min(1),
    brand:            z.string().nullable(),
    ingredient_id:    z.number().positive(),
    ingredient_name:  z.string().min(1),
    default_unit:     z.enum(['gram', 'milliliter', 'liter', 'ounce', 'pound', 'count']),
    default_quantity: z.number().positive().nullable(),
  })
)

registry.registerPath({
  method: 'get',
  path: '/product/{barcode}',
  summary: 'Look up a product by barcode',
  tags: ['Products'],
  request: { params: barcodeParam },
  responses: {
    200: {
      description: 'Product found',
      content: { 'application/json': { schema: ProductResponseSchema } },
    },
    400: { description: 'Invalid barcode format' },
    404: { description: 'Product not found' },
  },
})