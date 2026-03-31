import { Router } from 'express'
import { lookupBarcode } from '../controllers/productController.js'

const router = Router()

// GET /product/:barcode — look up a product by barcode (cache-first, then Open Food Facts)
router.get('/:barcode', lookupBarcode)

export default router
