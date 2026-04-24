import { getPantry } from './pantryService.js'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

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
    "ingredients": ["ingredient 1", "ingredient 2"],
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
    return Array.isArray(parsed) ? parsed : []
  } catch {
    throw new Error('Failed to parse recipe suggestions from Groq response')
  }
}
