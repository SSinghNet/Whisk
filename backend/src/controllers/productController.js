import { getProductByBarcode } from '../services/productService.js'

/**
 * GET /product/:barcode
 * Returns product info for the given barcode.
 * Checks local cache first, then falls back to Open Food Facts.
 * Returns 404 if the barcode is not found in either source.
 */
export async function lookupBarcode(req, res, next) {
    try {
        const { barcode } = req.params

        if (!barcode || !/^\d{8,14}$/.test(barcode)) {
            return res.status(400).json({ message: 'Invalid barcode format' })
        }

        const product = await getProductByBarcode(barcode)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        res.json({
            barcode:        product.barcode,
            product_name:   product.product_name,
            brand:          product.brand,
            ingredient_id:  product.ingredient.ingredient_id,
            ingredient_name: product.ingredient.name,
            default_unit:   product.default_unit,
        })
    } catch (err) {
        next(err)
    }
}
