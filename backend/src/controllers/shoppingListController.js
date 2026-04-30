import * as service from '../services/shoppingListService.js'

export const getShoppingList = async (req, res) => {
    const supabase_uid = req.user.id
    const search = String(req.query?.search ?? '').trim()
    const shoppingList = await service.getShoppingList(supabase_uid, search)

    res.status(200).json(shoppingList)
}

export const postShoppingListItem = async (req, res) => {
    const supabase_uid = req.user.id
    const { ingredient_id, quantity, unit } = req.body || {}

    if (!ingredient_id) {
        return res.status(400).json({ message: 'ingredient_id is required' })
    }

    const item = await service.postShoppingListItem(supabase_uid, {
        ingredient_id,
        quantity,
        unit,
    })

    res.status(201).json(item)
}

export const deleteShoppingListItem = async (req, res) => {
    const supabase_uid = req.user.id
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: 'Ingredient id is required' })
    }

    const deleted = await service.deleteShoppingListItem(supabase_uid, id)
    if (!deleted) {
        return res.status(404).json({ message: 'Shopping list item not found' })
    }

    res.status(204).send()
}