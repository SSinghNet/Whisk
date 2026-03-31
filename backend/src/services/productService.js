import prisma from '../lib/prisma.js'

const OPEN_FOOD_FACTS_URL = 'https://world.openfoodfacts.org/api/v0/product'

/**
 * Look up a product by barcode.
 * Strategy (per SDS design decision):
 *   1. Check local product table first (cache hit → return immediately)
 *   2. Cache miss → call Open Food Facts API
 *   3. If found externally, find-or-create a matching ingredient, persist the
 *      product row, then return it.
 *   4. If not found anywhere, return null so the caller can fall back to
 *      manual entry.
 */
export async function getProductByBarcode(barcode) {
    // 1. Local cache check
    const cached = await prisma.product.findUnique({
        where: { barcode },
        include: { ingredient: true },
    })
    if (cached) return cached

    // 2. External lookup — Open Food Facts (no API key required)
    const response = await fetch(`${OPEN_FOOD_FACTS_URL}/${barcode}.json`, {
        headers: { 'User-Agent': 'Whisk-App/1.0 (student project)' },
    })

    if (!response.ok) return null

    const json = await response.json()

    // status 0 = product not found in Open Food Facts
    if (json.status !== 1 || !json.product) return null

    const { product_name, brands } = json.product

    // Need at least a name to create a meaningful ingredient
    if (!product_name) return null

    const name = product_name.trim().toLowerCase()
    const brand = brands ? brands.split(',')[0].trim() : null

    // 3. Find-or-create ingredient by name
    const ingredient = await prisma.ingredient.upsert({
        where: { name },
        update: {},
        create: { name },
    })

    // 4. Persist product to local cache
    const product = await prisma.product.create({
        data: {
            barcode,
            product_name: product_name.trim(),
            brand,
            ingredient_id: ingredient.ingredient_id,
            default_unit: 'count',
        },
        include: { ingredient: true },
    })

    return product
}
