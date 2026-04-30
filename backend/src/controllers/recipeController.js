import * as service from "../services/recipeService.js"
import * as edamam from "../services/edamamService.js"

export const getRecipes = async (req, res) => {
    const search = req.query.search || null

    const recipes = await service.getRecipes(search)
    if (!recipes.length) {
        return res.status(200).json([])
    }

    res.status(200).json(recipes)
}

export const getUserRecipes = async (req, res) => {
    const supabase_uid = req.user.id
    const search = req.query.search || null

    const recipes = await service.getUserRecipes(supabase_uid, search)
    if (!recipes.length) {
        return res.status(200).json([])
    }

    res.status(200).json(recipes)
}

export const getRecipe = async (req, res) => {
    const supabase_uid = req.user.id
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: "Recipe id is required" })
    }

    const recipe = await service.getRecipe(supabase_uid, id)
    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" })
    }

    res.status(200).json(recipe)
}

export const createRecipe = async (req, res) => {
    const supabase_uid = req.user.id
    const { title, instructions, image_url, yield_amount, yield_unit, is_private, ingredients } = req.body || {}

    if (!title) {
        return res.status(400).json({ message: "title is required" })
    }

    try {
        const recipe = await service.createRecipe(supabase_uid, {
            title,
            instructions,
            image_url,
            yield_amount,
            yield_unit,
            is_private: is_private ?? false,
            ingredients: ingredients || [],
        })

        res.status(201).json(recipe)
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server error' })
    }
}

export const updateRecipe = async (req, res) => {
    const { id } = req.params
    const { title, instructions, image_url, yield_amount, yield_unit } = req.body || {}

    if (!id) {
        return res.status(400).json({ message: "Recipe id is required" })
    }

    if (title === undefined && instructions === undefined && image_url === undefined && 
        yield_amount === undefined && yield_unit === undefined) {
        return res.status(400).json({ message: "At least one field (title, instructions, image_url, yield_amount, yield_unit) is required" })
    }

    try {
        const recipe = await service.updateRecipe(id, {
            title,
            instructions,
            image_url,
            yield_amount,
            yield_unit,
        })

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" })
        }

        res.status(200).json(recipe)
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server error' })
    }
}

export const deleteRecipe = async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: "Recipe id is required" })
    }

    try {
        const deleted = await service.deleteRecipe(id)
        if (!deleted) {
            return res.status(404).json({ message: "Recipe not found" })
        }

        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server error' })
    }
}

export const addRecipeToUser = async (req, res) => {
    const supabase_uid = req.user.id
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: "Recipe id is required" })
    }

    try {
        const userRecipe = await service.addRecipeToUser(supabase_uid, id)
        res.status(201).json(userRecipe)
    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message })
        }
        if (error.statusCode === 409 || error.message === 'Recipe already added by user') {
            return res.status(409).json({ message: 'Recipe already added by user' })
        }

        res.status(500).json({ message: error.message || 'Internal server error' })
    }
}

export const removeRecipeFromUser = async (req, res) => {
    const supabase_uid = req.user.id
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: "Recipe id is required" })
    }

    try {
        const removed = await service.removeRecipeFromUser(supabase_uid, id)
        if (!removed) {
            return res.status(404).json({ message: "Recipe not found for user" })
        }

        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server error' })
    }
}

export const searchEdamam = async (req, res) => {
  const query = req.query.q || ''
  const from = parseInt(req.query.from || '0', 10)

  if (!query.trim()) return res.status(200).json([])

  try {
    const recipes = await edamam.searchRecipes(query, from)
    res.status(200).json(recipes)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search recipes' })
  }
}

const VALID_UNITS = new Set(['count','gram','ounce','pound','milliliter','liter','gallon','cup','tablespoon','teaspoon'])

const sanitizeUnit = (unit) => {
  if (!unit) return 'count'
  const lower = unit.toLowerCase().trim()
  if (VALID_UNITS.has(lower)) return lower
  // common Edamam aliases
  const map = { tsp: 'teaspoon', tbsp: 'tablespoon', tablespoons: 'tablespoon', teaspoons: 'teaspoon',
    cups: 'cup', grams: 'gram', ounces: 'ounce', pounds: 'pound',
    milliliters: 'milliliter', liters: 'liter', gallons: 'gallon' }
  return map[lower] || 'count'
}

export const importEdamam = async (req, res) => {
  const supabase_uid = req.user.id
  const { title, image_url, instructions, yield_amount, yield_unit, ingredients } = req.body || {}

  if (!title) return res.status(400).json({ message: 'title is required' })

  const sanitizedIngredients = (ingredients || [])
    .filter((ing) => ing.name?.trim())
    .map((ing) => ({ ...ing, unit: sanitizeUnit(ing.unit) }))

  const parsedYield = yield_amount ? Number(yield_amount) : null
  const resolvedYieldUnit = parsedYield ? sanitizeUnit(yield_unit) : null

  try {
    const recipe = await service.createRecipe(supabase_uid, {
      title,
      image_url: image_url || null,
      instructions: instructions || null,
      yield_amount: parsedYield,
      yield_unit: resolvedYieldUnit,
      is_private: false,
      ingredients: sanitizedIngredients,
    })
    res.status(201).json(recipe)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}

export const makeRecipe = async (req, res) => {
    const supabase_uid = req.user.id
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: "Recipe id is required" })
    }

    try {
        const recipe = await service.makeRecipe(supabase_uid, id)
        res.status(200).json(recipe)
    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message })
        }

        if (error.statusCode === 409) {
            return res.status(409).json({
                message: error.message,
                details: error.details,
            })
        }

        res.status(500).json({ message: error.message || 'Internal server error' })
    }
}
