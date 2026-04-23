const EDAMAM_BASE = 'https://api.edamam.com/api/recipes/v2'

const normalizeHit = ({ recipe }) => {
  const id = recipe.uri?.split('#recipe_')[1] || null
  return {
    edamam_id: id,
    title: recipe.label,
    image_url: recipe.image || null,
    source_url: recipe.url || null,
    source: recipe.source || null,
    yield_amount: recipe.yield || null,
    yield_unit: null,
    recipe_ingredient: (recipe.ingredients || []).map((ing) => ({
      ingredient: { name: ing.food },
      amount: ing.quantity || null,
      unit: ing.measure || null,
      display: ing.text,
    })),
    ingredient_lines: recipe.ingredientLines || [],
    diet_labels: recipe.dietLabels || [],
    health_labels: recipe.healthLabels || [],
    cuisine_type: recipe.cuisineType || [],
    meal_type: recipe.mealType || [],
  }
}

export const searchRecipes = async (query, from = 0) => {
  if (!query?.trim()) return []

  const params = new URLSearchParams({
    type: 'public',
    q: query.trim(),
    app_id: process.env.EDAMAM_APP_ID,
    app_key: process.env.EDAMAM_APP_KEY,
    from: String(from),
    to: String(from + 20),
  })

  const res = await fetch(`${EDAMAM_BASE}?${params}`, {
    headers: { 'Edamam-Account-User': process.env.EDAMAM_APP_ID },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Edamam API error ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  return (data.hits || []).map(normalizeHit)
}
