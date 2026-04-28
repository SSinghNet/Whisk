import * as service from "../services/pantryService.js"

export const getPantry = async (req, res) => {
    const supabase_uid = req.user.id
    const search = req.query.search 

    const pantry = await service.getPantry(supabase_uid, search)
    if (!pantry.length) {
        return res.status(200).json([])
    }

    res.status(200).json(pantry)
}

export const getPantryIngredient = async (req, res) => {
    const supabase_uid = req.user.id
    const { id } = req.params

    const item = await service.getPantryIngredient(supabase_uid, id)
    if (!item) {
        return res.status(404).json({ message: "Pantry ingredient not found" })
    }

    res.status(200).json(item)
}

export const postPantryIngredient = async (req, res) => {
    const supabase_uid = req.user.id
    const { ingredient_id, quantity, unit, expiry_date } = req.body

    const item = await service.postPantryIngredient(supabase_uid, {
        ingredient_id,
        quantity,
        unit,
        expiry_date,
    })

    res.status(201).json(item)
}

export const updatePantryIngredient = async (req, res) => {
    const supabase_uid = req.user.id
    const { id } = req.params
    const { quantity, unit, expiry_date } = req.body 

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

    const deleted = await service.deletePantryIngredient(supabase_uid, id)
    if (!deleted) {
        return res.status(404).json({ message: "Pantry ingredient not found" })
    }

    res.status(204).send()
}
