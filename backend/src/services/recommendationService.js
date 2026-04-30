import { getPantry } from './pantryService.js'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const VALID_UNITS = new Set([
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

const UNIT_ALIASES = {
  tsp: 'teaspoon',
  tsps: 'teaspoon',
  teaspoon: 'teaspoon',
  teaspoons: 'teaspoon',
  tbsp: 'tablespoon',
  tbsps: 'tablespoon',
  tablespoon: 'tablespoon',
  tablespoons: 'tablespoon',
  cups: 'cup',
  grams: 'gram',
  ounces: 'ounce',
  pounds: 'pound',
  milliliters: 'milliliter',
  liters: 'liter',
  gallons: 'gallon',
  servings: 'count',
  serving: 'count',
}

export const sanitizeUnit = (unit) => {
  if (!unit) return 'count'
  const normalized = String(unit).toLowerCase().trim()
  if (VALID_UNITS.has(normalized)) return normalized
  return UNIT_ALIASES[normalized] || 'count'
}

const formatIngredientLine = (ingredient) => {
  if (typeof ingredient === 'string') return ingredient.trim()

  const amount = ingredient?.amount != null && ingredient.amount !== ''
    ? String(ingredient.amount).trim()
    : null
  const unit = ingredient?.unit ? sanitizeUnit(ingredient.unit) : null
  const name = ingredient?.name ? String(ingredient.name).trim() : ''

  return [amount, unit && unit !== 'count' ? unit : null, name].filter(Boolean).join(' ').trim()
}

export const normalizeIngredient = (ingredient) => {
  if (typeof ingredient === 'string') {
    return {
      name: ingredient.trim(),
      amount: null,
      unit: 'count',
      display: ingredient.trim(),
    }
  }

  const name = ingredient?.name ? String(ingredient.name).trim() : ''
  const amount = ingredient?.amount == null || ingredient.amount === ''
    ? null
    : Number(ingredient.amount)
  const unit = sanitizeUnit(ingredient?.unit)
  const display = ingredient?.display
    ? String(ingredient.display).trim()
    : formatIngredientLine({ name, amount, unit })

  return {
    name,
    amount: Number.isFinite(amount) ? amount : null,
    unit,
    display: display || name,
  }
}

export const normalizeRecommendation = (recipe) => {
  const ingredients = Array.isArray(recipe?.ingredients)
    ? recipe.ingredients.map(normalizeIngredient).filter((ingredient) => ingredient.name)
    : []

  const yieldAmount = recipe?.yield_amount == null || recipe.yield_amount === ''
    ? null
    : Number(recipe.yield_amount)

  return {
    title: recipe?.title ? String(recipe.title).trim() : 'Untitled recipe',
    ingredients,
    instructions: recipe?.instructions ? String(recipe.instructions).trim() : null,
    yield_amount: Number.isFinite(yieldAmount) ? yieldAmount : null,
    yield_unit: yieldAmount ? sanitizeUnit(recipe?.yield_unit) : null,
  }
}

const buildPrompt = (pantryItems) => {
  const now = new Date()
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const expiringSoon = []
  const rest = []

  for (const item of pantryItems) {
    const name = item.ingredient?.name
    if (!name) continue
    const qty = item.quantity ? `${item.quantity} ${item.unit || ''}`.trim() : null
    const expiry = item.expiry_date ? new Date(item.expiry_date) : null
    const label = qty ? `${name} (${qty})` : name

    if (expiry && expiry <= threeDays) {
      expiringSoon.push({ label, expiry })
    } else {
      rest.push(label)
    }
  }

  expiringSoon.sort((a, b) => a.expiry - b.expiry)

  const expiringLines = expiringSoon.map((i) => `- ${i.label} ⚠️ expiring soon`)
  const restLines = rest.map((i) => `- ${i}`)
  const ingredientList = [...expiringLines, ...restLines].join('\n')

  return `You are a helpful cooking assistant. Based on the following pantry ingredients, suggest 4 recipes the user can make.

IMPORTANT: Prioritize using ingredients marked as "expiring soon" first.

Pantry:
${ingredientList}

Respond ONLY with a valid JSON array. No markdown, no explanation, just the raw JSON array.

Format:
[
  {
    "title": "Recipe Name",
    "yield_amount": 4,
    "yield_unit": "count",
    "ingredients": [
      {
        "name": "ingredient 1",
        "amount": 2,
        "unit": "cup",
        "display": "2 cup ingredient 1"
      }
    ],
    "instructions": "Step by step instructions as a single string."
  }
]`
}

export const getRecommendations = async (supabaseUid) => {
  const pantryItems = await getPantry(supabaseUid, null)

  if (!pantryItems.length) return []

  const prompt = buildPrompt(pantryItems)

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Groq API error ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content || ''

  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    return Array.isArray(parsed) ? parsed.map(normalizeRecommendation) : []
  } catch {
    throw new Error('Failed to parse recipe suggestions from Groq response')
  }
}
