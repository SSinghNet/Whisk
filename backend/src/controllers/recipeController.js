import * as service from "../services/recipeService.js"

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
    const { title, instructions, image_url, yield_amount, yield_unit } = req.body || {}

    if (!title) {
        return res.status(400).json({ message: "title is required" })
    }

    try {
        const recipe = await service.createRecipe({
            title,
            instructions,
            image_url,
            yield_amount,
            yield_unit,
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
