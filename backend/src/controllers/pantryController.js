import * as service from "../services/pantryService.js"

export const getPantry = async (req, res) => {
    const supabase_uid = req.user.id
    const search = req.query.search || null

    const pantry = await service.getPantry(supabase_uid, search)
    if (!pantry.length) {
        return res.status(200).json([])
    }

    res.status(200).json(pantry)
}

export const getPantryIngredient = async (req, res) => {
    const supabase_uid = req.user.id
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: "Ingredient id is required" })
    }

    const item = await service.getPantryIngredient(supabase_uid, id)
    if (!item) {
        return res.status(404).json({ message: "Pantry ingredient not found" })
    }

    res.status(200).json(item)
}

export const postPantryIngredient = async (req, res) => {
    const supabase_uid = req.user.id
    const { ingredient_id, quantity, unit, expiry_date } = req.body || {}

    if (!ingredient_id) {
        return res.status(400).json({ message: "ingredient_id is required" })
    }

    try {
        const item = await service.postPantryIngredient(supabase_uid, {
            ingredient_id,
            quantity,
            unit,
            expiry_date,
        })

        res.status(201).json(item)
    } catch (error) {
        if (error.statusCode === 409 || error.message === 'Ingredient already exists in pantry') {
            return res.status(409).json({ message: 'Ingredient already exists in pantry' })
        }

        res.status(500).json({ message: error.message || 'Internal server error' })
    }
}

export const updatePantryIngredient = async (req, res) => {
    const supabase_uid = req.user.id
    const { id } = req.params
    const { quantity, unit, expiry_date } = req.body || {}

    if (!id) {
        return res.status(400).json({ message: "Ingredient id is required" })
    }

    if (quantity === undefined && unit === undefined && expiry_date === undefined) {
        return res.status(400).json({ message: "At least one field (quantity, unit, expiry_date) is required" })
    }

    const item = await service.updatePantryIngredient(supabase_uid, id, {
        quantity,
        unit,
        expiry_date,
    })

    if (!item) {
        return res.status(404).json({ message: "Pantry ingredient not found" })
    }

    res.status(200).json(item)
}

export const deletePantryIngredient = async (req, res) => {
    const supabase_uid = req.user.id
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: "Ingredient id is required" })
    }

    const deleted = await service.deletePantryIngredient(supabase_uid, id)
    if (!deleted) {
        return res.status(404).json({ message: "Pantry ingredient not found" })
    }

    res.status(204).send()
}
