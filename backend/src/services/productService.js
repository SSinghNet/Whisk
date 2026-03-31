import prisma from '../lib/prisma.js'

const OPEN_FOOD_FACTS_URL = 'https://world.openfoodfacts.org/api/v0/product'

// Maps common quantity string units from Open Food Facts to our unit_code enum.
// Handles formats like "500 g", "1 L", "330 ml", "12 oz", "6 x 330 ml".
// Parses an Open Food Facts quantity string (e.g. "591 ml", "6 x 330 ml", "500g")
// into { unit, quantity } matching our unit_code enum.
function parseQuantity(quantityStr) {
    if (!quantityStr) return { unit: 'count', quantity: null }
    const lower = quantityStr.toLowerCase()

    // Multi-pack: take the per-unit value (e.g. "6 x 330 ml" → 330 ml)
    const multiMatch = lower.match(/\d+\s*x\s*([\d.]+)\s*([a-z]+)/)
    if (multiMatch) return resolve(parseFloat(multiMatch[1]), multiMatch[2])

    // Single value: "591 ml", "500g", "1.5 l"
    const singleMatch = lower.match(/([\d.]+)\s*([a-z]+)/)
    if (singleMatch) return resolve(parseFloat(singleMatch[1]), singleMatch[2])

    return { unit: 'count', quantity: null }
}

function resolve(num, unitStr) {
    let unit = 'count'
    if (unitStr === 'kg')                              { unit = 'gram';       num = num * 1000 }
    else if (unitStr === 'g')                            unit = 'gram'
    else if (unitStr === 'ml')                           unit = 'milliliter'
    else if (unitStr === 'l' || unitStr === 'litre' || unitStr === 'liter') unit = 'liter'
    else if (unitStr === 'oz' || unitStr === 'fl')       unit = 'ounce'
    else if (unitStr === 'lb' || unitStr === 'pound')    unit = 'pound'
    return { unit, quantity: unit === 'count' ? null : num }
}

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

    const { product_name, brands, quantity } = json.product

    // Need at least a name to create a meaningful ingredient
    if (!product_name) return null

    const name = product_name.trim().toLowerCase()
    const brand = brands ? brands.split(',')[0].trim() : null
    const { unit, quantity: parsedQuantity } = parseQuantity(quantity)

    // 3. Find-or-create ingredient by name
    const ingredient = await prisma.ingredient.upsert({
        where: { name },
        update: {},
        create: { name },
    })

    // 4. Persist product to local cache via raw SQL to include default_quantity
    const rows = await prisma.$queryRaw`
        INSERT INTO product (barcode, product_name, brand, ingredient_id, default_unit, default_quantity)
        VALUES (${barcode}, ${product_name.trim()}, ${brand}, ${ingredient.ingredient_id}, ${unit}::"unit_code", ${parsedQuantity})
        RETURNING product_id, barcode, product_name, brand, ingredient_id, default_unit, default_quantity, created_at
    `

    return { ...rows[0], ingredient }
}
