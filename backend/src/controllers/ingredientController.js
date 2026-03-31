import * as service from "../services/ingredientService.js"

export const getIngredients = async (req, res) => {
    const search = req.query.search || null
    const ingredients = await service.getIngredients(search)
    if (!ingredients.length) {
        return res.status(200).json([])
    }

    res.status(200).json(ingredients)
}

export const getIngredient = async (req, res) => {
    const { id } = req.params
    const ingredient = await service.getIngredientById(id)
    if (!ingredient) {
        return res.status(404).json({ message: "Ingredient not found" })
    }

    res.status(200).json(ingredient)
}

export const postIngredient = async (req, res) => {
    const { name } = req.body || {}
    if (!name) {
        return res.status(400).json({ message: "Name is required" })
    }

    const ingredient = await service.postIngredient(name)
    res.status(201).json(ingredient)
}

export const updateIngredient = async (req, res) => {
    const { id } = req.params
    const { name } = req.body || {}

    if (!id) {
        return res.status(400).json({ message: "Id is required" })
    }
    if (!name) {
        return res.status(400).json({ message: "Name is required" })
    }

    const ingredient = await service.updateIngredient(id, name)
    if (!ingredient) {
        return res.status(404).json({ message: "Ingredient not found" })
    }
    res.status(200).json(ingredient)
}

export const deleteIngredient = async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: "Id is required" })
    }

    const ingredient = await service.deleteIngredient(id)
    if (!ingredient) {
        return res.status(404).json({ message: "Ingredient not found" })
    }

    res.status(204).send()
}